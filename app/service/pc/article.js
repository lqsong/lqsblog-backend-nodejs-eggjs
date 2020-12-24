'use strict';

const Service = require('egg').Service;

/**
 * API-PC 文章 Service
 * @author LiQingSong
 */
class ArticleService extends Service {

  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'addtime', 'id', 'hit' ];
    const len = sort.length - 1;
    return i > len ? sort[0] : sort[i];
  }

  /**
   * 返回 Sequelize 排序
   * @param {object} param0 {sort = 排序字段下标[addtime, id,hit], order = 下标[desc 降序，asc 升序]}
   */
  getSequelizeOrder({ sort, order }) {
    const sortVal = (!sort || isNaN(sort)) ? this.getSort(0) : this.getSort(sort);
    const orderVal = (!order || isNaN(sort) || order === 0) ? 'DESC' : 'ASC';
    return [ sortVal, orderVal ];
  }

  /**
   * 获取分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   * @param {object} param1 { categoryId, sort = 排序字段下标[addtime,id,hit], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { categoryId, sort, order }) {
    const { ctx } = this;
    const pageSize = parseInt(per) || 10;
    const currentPage = parseInt(page) || 1;

    const { Op } = ctx.app.Sequelize;
    const where = {};
    if (categoryId && !isNaN(categoryId) && categoryId > 0) {
      where.categoryId = {
        [Op.eq]: categoryId,
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
        description: rows[index].description,
        thumb: rows[index].thumb.split('|'),
        addtime: rows[index].addtime,
        category: categorys[rows[index].categoryId] || {},
        tag: rows[index].tag,
        hit: rows[index].hid,
      });
    }

    response.list = list;
    return response;


  }

  /**
   * 根据id查找详情
   * @param {number} id id
   */
  async detailById(id) {

    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      return null;
    }

    const info = await ctx.model.Article.findOne({ where: { id } });
    if (!info) {
      return null;
    }

    const cateInfo = await ctx.model.ArticleCategory.findOne({ where: { id: info.categoryId } });

    return {
      id: info.id,
      title: info.title,
      keywords: info.keywords,
      description: info.description,
      addtime: info.addtime,
      hit: info.hit,
      tag: info.tag,
      interestIds: info.interestIds,
      content: info.content,
      category: cateInfo ? {
        id: cateInfo.id,
        name: cateInfo.name,
        alias: cateInfo.alias,
      } : {},
    };


  }


  /**
   * 根据id查找详情 ，并添加浏览量
   * @param {number} id id
   */
  async detailByIdAndAddHit(id) {

    const info = await this.detailById(id);
    if (!info) {
      return null;
    }


    // 点击量+1
    await this.ctx.model.Article.increment('hit', { where: { id: info.id } });

    return info;

  }


  /**
   * 根据ids查找列表
   * @param {string} ids id ,链接字符串
   */
  async listByIds(ids) {
    if (!ids || ids === '') {
      return [];
    }
    const { ctx } = this;

    const rows = await ctx.model.Article.findAll({ where: { id: ids.split(',') } });
    const rowsLen = rows.length;
    if (rowsLen < 1) {
      return [];
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
        description: rows[index].description,
        thumb: rows[index].thumb.split('|'),
        addtime: rows[index].addtime,
        category: categorys[rows[index].categoryId] || {},
        tag: rows[index].tag,
        hit: rows[index].hid,
      });
    }

    return list;


  }


}


module.exports = ArticleService;
