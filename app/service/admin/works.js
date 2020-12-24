'use strict';

const moment = require('moment');

const Service = require('egg').Service;

/**
 * API-Admin 作品 Service
 * @author LiQingSong
 */
class WorksService extends Service {

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
   * 获取分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   * @param {object} param1 { keywords, addtimestart, addtimeend, tags, sort = 排序字段下标[id,hit,addtime], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { keywords, addtimestart, addtimeend, tags, sort, order }) {
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

    const { count, rows } = await ctx.model.Works.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      where,
      order: [
        this.getSequelizeOrder({ sort, order }),
      ],
      attributes: { exclude: [ 'content' ] },
    });


    return {
      total: count,
      currentPage,
      list: rows,
    };


  }

  /**
   * 插入一条记录
   * @param {Works} param0 对应字段
   */
  async save({ title, keywords, description, thumb, content, tag, addtime, hit, creatorId }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ title, keywords, description, addtime });

    // 创建事务
    const t = await ctx.model.transaction();
    let record;
    try {
      record = await ctx.model.Works.create({
        title, keywords, description,
        thumb, content, tag, addtime, hit, creatorId, createTime: new Date(),
      }, { transaction: t });

      // await ctx.service.admin.search.save(ctx.service.admin.search.worksToSearch(record));
      await ctx.model.Search.create(ctx.service.admin.search.worksToSearch(record), { transaction: t });

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
   * @param {Works} param0 对应字段
   */
  async updateById({ id, title, keywords, description, thumb, content, tag, addtime, hit }) {

    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ title, keywords, description, addtime });

    // 创建事务
    const t = await ctx.model.transaction();
    try {

      const record = arguments[0];

      await ctx.model.Works.update({
        title, keywords, description,
        thumb, content, tag, addtime, hit,
      }, {
        where: { id },
        transaction: t,
      });

      // await ctx.service.admin.search.updateById(ctx.service.admin.search.worksToSearch(record));
      const searchParam = ctx.service.admin.search.worksToSearch(record);
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
   * @param {number} id 作品id
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
      response = await ctx.model.Works.destroy({
        where: { id },
        transaction: t,
      });

      // await ctx.service.admin.search.remove(ctx.service.admin.search.worksToSearch({id}));
      const searchParam = ctx.service.admin.search.worksToSearch({ id });
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
   * 根据 ID 详情
   * @param {number} id 作品id
   */
  async getById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    const works = await ctx.model.Works.findOne({ where: { id } });
    if (!works) {
      ctx.throw(ctx.app.enum.resultCode.NOT_FOUND.msg);
    }

    return works;
  }


  /**
   * 验证
   * @param {Works} param0 对应字段
   */
  async saveUpdateVerify({ title, keywords, description, addtime }) {
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
      addtime: [
        {
          type: 'string',
          required: true,
          message: '添加时间不能为空',
        },
      ],
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { title, keywords, description, addtime });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    return true;
  }

  /**
   * 统计 - 周新增，总量，chart数据
   */
  async getStatsTotalChart() {

    const { ctx } = this;

    // 当前日期
    const now = moment().format('YYYY-MM-DD');
    // 后一天日期
    const dayAfter = moment().add(1, 'days').format('YYYY-MM-DD');
    // 获取本周一日期
    const monday = moment().day(1).format('YYYY-MM-DD');
    // 7天前日期
    const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');


    const { Op } = ctx.app.Sequelize;

    // 总数
    const total = await ctx.model.Works.count();

    // 本周新增数
    const week = await ctx.model.Article.count({
      where: {
        createTime: {
          [Op.gte]: monday,
          [Op.lt]: dayAfter,
        },
      },
    });

    const day = [
      sevenDaysAgo, // 7天前
      moment().subtract(6, 'days').format('YYYY-MM-DD'), // 6天前
      moment().subtract(5, 'days').format('YYYY-MM-DD'), // 5天前
      moment().subtract(4, 'days').format('YYYY-MM-DD'), // 4天前
      moment().subtract(3, 'days').format('YYYY-MM-DD'), // 3天前
      moment().subtract(2, 'days').format('YYYY-MM-DD'), // 2天前
      moment().subtract(1, 'days').format('YYYY-MM-DD'), // 1天前
    ];


    const statsDayTotal = await ctx.model.Works.findAll({
      attributes: [
        [ ctx.model.Works.sequelize.fn('DATE_FORMAT', ctx.model.Works.sequelize.col('create_time'), '%Y-%m-%d'), 'day' ],
        [ ctx.model.Works.sequelize.fn('COUNT', ctx.model.Works.sequelize.col('id')), 'num' ],
      ],
      where: {
        createTime: {
          [Op.gte]: sevenDaysAgo,
          [Op.lt]: now,
        },
      },
      group: 'day',
    });
    const list = {};
    const len = statsDayTotal.length;
    for (let index = 0; index < len; index++) {
      const item = statsDayTotal[index];
      list[item.getDataValue('day')] = item.getDataValue('num');
    }

    // 设置最近7天对应的数量
    const num = [];
    const dayLen = day.length;
    for (let index = 0; index < dayLen; index++) {
      if (list[day[index]]) {
        num.push(list[day[index]]);
      } else {
        num.push(0);
      }
    }


    return {
      total,
      num: week,
      chart: {
        day,
        num,
      },
    };
  }


}

module.exports = WorksService;
