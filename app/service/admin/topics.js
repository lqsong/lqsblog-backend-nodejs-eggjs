'use strict';

const moment = require('moment');

const Service = require('egg').Service;

/**
 * API-Admin 专题 Service
 * @author LiQingSong
 */
class TopicsService extends Service {

  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'id', 'hit' ];
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
   * @param {object} param1 { keywords, sort = 排序字段下标[id,hit,addtime], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { keywords, sort, order }) {

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

    const { count, rows } = await ctx.model.Topics.findAndCountAll({
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
   * @param {Topics} param0 对应字段
   */
  async save({ title, keywords, description, alias, content, addtime, hit, creatorId }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ title, keywords, description, alias, addtime }, 'save');

    const record = await ctx.model.Topics.create({
      title, keywords, description, alias,
      addtime, hit, creatorId, content, createTime: new Date(),
    });
    return record;
  }

  /**
   * 根据 ID 修改
   * @param {Topics} param0 对应字段
   */
  async updateById({ id, title, keywords, description, alias, content, addtime, hit }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ id, title, keywords, description, alias, addtime }, 'update');

    return await ctx.model.Topics.update({
      title, keywords, description, alias,
      addtime, hit, content,
    }, {
      where: { id },
    });

  }

  /**
   * 根据 ID 删除
   * @param {number} id 专题id
   */
  async removeById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    return await ctx.model.Topics.destroy({ where: { id } });
  }

  /**
   * 根据 ID 详情
   * @param {number} id 专题id
   */
  async getById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    const info = await ctx.model.Topics.findOne({ where: { id } });
    if (!info) {
      ctx.throw(ctx.app.enum.resultCode.NOT_FOUND.msg);
    }

    return info;
  }

  /**
   * 验证
   * @param {topics} param0 对应字段
   * @param {save|update} type save:插入，update:修改
   */
  async saveUpdateVerify({ id, title, alias, keywords, description, addtime }, type) {
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
            if (len > 50 || len < 3) {
              return new Error('标题长度3-50个字');
            }
            return true;
          },
        },
      ],
      alias: [
        {
          type: 'string',
          required: true,
          message: '别名不能为空',
        },
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 10 || len < 1) {
              return new Error('别名长度1-10个字');
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
    const va = await ctx.utils.asyncValidator.validate(rule, { title, alias, keywords, description, addtime });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    const { Op } = ctx.app.Sequelize;
    const where = {};
    where.alias = {
      [Op.eq]: alias,
    };
    if (type === 'update') {
      where.id = {
        [Op.ne]: id,
      };
    }
    const count = await ctx.model.Topics.count({ where });
    if (count > 0) {
      ctx.throw('存在相同别名');
    }


    return true;
  }


  /**
   * 统计 - 月新增，总量，chart数据
   */
  async getStatsTotalChart() {

    const { ctx } = this;

    // 当前日期
    const now = moment().format('YYYY-MM-DD');
    // 后一天日期
    const dayAfter = moment().add(1, 'days').format('YYYY-MM-DD');
    // 获取本1号日期
    const monday = moment().startOf('month').format('YYYY-MM-DD');


    const { Op } = ctx.app.Sequelize;

    // 总数
    const total = await ctx.model.Topics.count();

    // 本月新增
    const month = await ctx.model.Topics.count({
      where: {
        createTime: {
          [Op.gte]: monday,
          [Op.lt]: dayAfter,
        },
      },
    });

    const day = [];
    // 设置最近30天数组
    for (let index = 30; index > 0; index--) {
      day.push(moment().subtract(index, 'days').format('YYYY-MM-DD')); // index天前
    }

    // 读取最近30天数据
    const statsDayTotal = await ctx.model.Topics.findAll({
      attributes: [
        [ ctx.model.Topics.sequelize.fn('DATE_FORMAT', ctx.model.Topics.sequelize.col('create_time'), '%Y-%m-%d'), 'day' ],
        [ ctx.model.Topics.sequelize.fn('COUNT', ctx.model.Topics.sequelize.col('id')), 'num' ],
      ],
      where: {
        createTime: {
          [Op.gte]: day[0],
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

    // 设置最近30天对应的数量
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
      num: month,
      chart: {
        day,
        num,
      },
    };


  }


}

module.exports = TopicsService;
