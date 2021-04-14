'use strict';

const moment = require('moment');

const Service = require('egg').Service;

/**
 * API-Admin 文章 Service
 * @author LiQingSong
 */
class ArticleService extends Service {

  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'id', 'hit', 'addtime' ];
    const len = sort.length - 1;
    return i > len ? sort[0] : sort[i];
  }

  /**
   * 返回 Sequelize 排序
   * @param {object} param0 {sort = 排序字段下标[id,hit,addtime], order = 下标[desc 降序，asc 升序]}
   */
  getSequelizeOrder({ sort, order }) {
    const sortVal = (!sort || isNaN(sort)) ? this.getSort(0) : this.getSort(sort);
    const orderVal = (!order || isNaN(sort) || order === 0) ? 'DESC' : 'ASC';
    return [ sortVal, orderVal ];
  }


  /**
   * 获取文章分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   * @param {object} param1 { keywords, categoryid, addtimestart, addtimeend, tags, sort = 排序字段下标[id,hit,addtime], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { keywords, categoryid, addtimestart, addtimeend, tags, sort, order }) {
    const { ctx } = this;
    const pageSize = parseInt(per) || 10;
    const currentPage = parseInt(page) || 1;

    const { Op } = ctx.app.Sequelize;
    const where = {};
    if (keywords && keywords !== '') {
      where.title = {
        [Op.like]: '%' + keywords + '%',
      };
    }
    if (categoryid && !isNaN(categoryid) && categoryid > 0) {
      where.categoryId = {
        [Op.eq]: categoryid,
      };
    }
    if (addtimestart && addtimestart !== '' && addtimeend && addtimeend !== '') {
      where.addtime = {
        [Op.between]: [ addtimestart, addtimeend ],
      };
    }
    if (tags && tags !== '') {
      where.tag = {
        [Op.like]: '%' + tags + '%',
      };
    }

    const { count, rows } = await ctx.model.Article.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      where,
      order: [
        this.getSequelizeOrder({ sort, order }),
      ],
      attributes: { exclude: [ 'content' ] },
    });

    // 设置返回响应
    const response = {
      total: count,
      currentPage,
      list: [],
    };
    const rowsLen = rows.length;
    if (rowsLen < 1) {
      return response;
    }

    // 取出分类id
    const cIds = [];
    for (let index = 0; index < rowsLen; index++) {
      cIds.push(rows[index].categoryId);
    }
    const articleCategories = await ctx.model.ArticleCategory.findAll({
      where: {
        id: cIds,
      },
    });
    const categorys = {};
    for (let index = 0; index < articleCategories.length; index++) {
      categorys[articleCategories[index].id] = {
        id: articleCategories[index].id,
        name: articleCategories[index].name,
        alias: articleCategories[index].alias,
      };
    }

    // 设置返回数据列表
    const list = [];
    for (let index = 0; index < rowsLen; index++) {
      list.push({
        id: rows[index].id,
        title: rows[index].title,
        category: categorys[rows[index].categoryId] || {},
        addtime: rows[index].addtime,
        tag: rows[index].tag,
        hit: rows[index].hit,
        categoryIds: rows[index].categoryIds,
      });
    }

    response.list = list;
    return response;
  }


  /**
   * 插入一条记录
   * @param {Article} param0 对应文章字段
   */
  async save({ title, keywords, description, categoryId, categoryIds, thumb, content, tag, interestIds, addtime, hit, creatorId }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ title, keywords, description, categoryId, categoryIds, addtime });

    // 创建事务
    const t = await ctx.model.transaction();
    let record;
    try {

      record = await ctx.model.Article.create({
        title, keywords, description, categoryId, categoryIds,
        thumb, content, tag, interestIds, addtime, hit, creatorId, createTime: new Date(),
      }, { transaction: t });

      // await ctx.service.admin.search.save(ctx.service.admin.search.articleToSearch(record));
      await ctx.model.Search.create(ctx.service.admin.search.articleToSearch(record), { transaction: t });

      // 提交事务
      await t.commit();

    } catch (error) {

      // 回滚事务
      await t.rollback();

      throw error;
    }


    return record;

  }

  /**
   * 根据 ID 修改
   * @param {Article} param0 对应文章字段
   */
  async updateById({ id, title, keywords, description, categoryId, categoryIds, thumb, content, tag, interestIds, addtime, hit }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ title, keywords, description, categoryId, categoryIds, addtime });

    // 创建事务
    const t = await ctx.model.transaction();
    try {

      const record = arguments[0];

      await ctx.model.Article.update({
        title, keywords, description, categoryId, categoryIds,
        thumb, content, tag, interestIds, addtime, hit,
      }, {
        where: { id },
        transaction: t,
      });

      // await ctx.service.admin.search.updateById(ctx.service.admin.search.articleToSearch(record));
      const searchParam = ctx.service.admin.search.articleToSearch(record);
      await ctx.model.Search.destroy({
        where: { id: searchParam.id, type: searchParam.type },
        transaction: t,
      });
      await ctx.model.Search.create(searchParam, { transaction: t });

      // 提交事务
      await t.commit();


    } catch (error) {

      // 回滚事务
      await t.rollback();

      throw error;

    }

    return true;

  }

  /**
   * 根据 ID 删除
   * @param {number} id 文章id
   */
  async removeById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 创建事务
    const t = await ctx.model.transaction();
    // 返回删除记录行数
    let response = 0;
    try {

      response = await ctx.model.Article.destroy({
        where: { id },
        transaction: t,
      });

      // await ctx.service.admin.search.remove(ctx.service.admin.search.articleToSearch({id}));
      const searchParam = ctx.service.admin.search.articleToSearch({ id });
      await ctx.model.Search.destroy({
        where: { id: searchParam.id, type: searchParam.type },
        transaction: t,
      });

      // 提交事务
      await t.commit();

    } catch (error) {

      // 回滚事务
      await t.rollback();

      throw error;

    }

    return response;

  }


  /**
   * 根据 ID 获取 ArticleInterest 详情
   * @param {number} id 文章id
   */
  async getArticleInterestById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    const article = await ctx.model.Article.findOne({ where: { id } });
    if (!article) {
      ctx.throw(ctx.app.enum.resultCode.NOT_FOUND.msg);
    }

    const interestIds = article.interestIds.split(',');
    const interestArticle = await ctx.model.Article.findAll({
      attributes: [ 'id', 'title', 'addtime' ],
      where: { id: interestIds },
    });

    return {
      id: article.id,
      categoryId: article.categoryId,
      categoryIds: article.categoryIds,
      title: article.title,
      keywords: article.keywords,
      description: article.description,
      thumb: article.thumb,
      content: article.content,
      tag: article.tag,
      interestIds: article.interestIds,
      addtime: article.addtime,
      hit: article.hit,
      creatorId: article.creatorId,
      createTime: article.createTime,
      interest: interestArticle,
    };

  }


  /**
   * 验证
   * @param {Article} param0 对应文章字段
   */
  async saveUpdateVerify({ title, keywords, description, categoryId, categoryIds, addtime }) {
    const { ctx } = this;

    const rule = {
      title: [
        {
          type: 'string',
          required: true,
          message: '标题不能为空',
        },
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 100 || len < 3) {
              return new Error('标题长度3-100个字');
            }
            return true;
          },
        },
      ],
      keywords: [
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 50) {
              return new Error('关键字长度0-50个字');
            }
            return true;
          },
        },
      ],
      description: [
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 200) {
              return new Error('Description长度0-200个字');
            }
            return true;
          },
        },
      ],
      categoryId: [
        {
          type: 'number',
          required: true,
          message: '分类不能为空',
        },
      ],
      categoryIds: [
        {
          type: 'string',
          required: true,
          message: '分类不能为空',
        },
      ],
      addtime: [
        {
          type: 'string',
          required: true,
          message: '添加时间不能为空',
        },
      ],
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { title, keywords, description, categoryId, categoryIds, addtime });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    return true;

  }


  /**
   * 统计 - 日新增，总量，日同比，周同比
   */
  async getArticleDailyNew() {
    const { ctx } = this;

    // 当前日期
    const now = moment().format('YYYY-MM-DD');
    // 前一天日期
    const dayBefore = moment().subtract(1, 'days').format('YYYY-MM-DD');
    // 后一天日期
    const dayAfter = moment().add(1, 'days').format('YYYY-MM-DD');
    // 获取上周一日期
    const LastMonday = moment().day(-6).format('YYYY-MM-DD');
    // 获取本周一日期
    const monday = moment().day(1).format('YYYY-MM-DD');

    const { Op } = ctx.app.Sequelize;

    // 总文章数
    const total = await ctx.model.Article.count();

    // 今天新增文章
    const num = await ctx.model.Article.count({
      where: {
        createTime: {
          [Op.gte]: now,
          [Op.lt]: dayAfter,
        },
      },
    });

    // 前一天新增文章
    const numBefore = await ctx.model.Article.count({
      where: {
        createTime: {
          [Op.gte]: dayBefore,
          [Op.lt]: now,
        },
      },
    });

    // 日同比%
    const dayCompare = numBefore > 0 ? Math.round((num - numBefore) / numBefore * 10000) / 100 : num * 100;

    // 本周新增文章数
    const week = await ctx.model.Article.count({
      where: {
        createTime: {
          [Op.gte]: monday,
          [Op.lt]: dayAfter,
        },
      },
    });

    // 上周新增文章
    const weekBefore = await ctx.model.Article.count({
      where: {
        createTime: {
          [Op.gte]: LastMonday,
          [Op.lt]: monday,
        },
      },
    });

    // 周同比%
    const weekCompare = weekBefore > 0 ? Math.round((week - weekBefore) / weekBefore * 10000) / 100 : week * 100;


    return {
      total,
      num,
      day: dayCompare,
      week: weekCompare,
    };
  }


}

module.exports = ArticleService;
