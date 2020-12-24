'use strict';

const moment = require('moment');

const Service = require('egg').Service;

/**
 * API-Admin 左邻右舍 Service
 * @author LiQingSong
 */
class LinkService extends Service {

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
   * @param {object} param1 { keywords, categoryid, sort = 排序字段下标[id,hit], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { keywords, categoryid, sort, order }) {

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

    const { count, rows } = await ctx.model.Link.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      where,
      order: [
        this.getSequelizeOrder({ sort, order }),
      ],
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
    const linkCategories = await ctx.model.LinkCategory.findAll({
      where: {
        id: cIds,
      },
    });
    const categorys = {};
    for (let index = 0; index < linkCategories.length; index++) {
      categorys[linkCategories[index].id] = {
        id: linkCategories[index].id,
        name: linkCategories[index].name,
        alias: linkCategories[index].alias,
      };
    }

    // 设置返回数据列表
    const list = [];
    for (let index = 0; index < rowsLen; index++) {
      list.push({
        id: rows[index].id,
        title: rows[index].title,
        category: categorys[rows[index].categoryId] || {},
        hit: rows[index].hid,
      });
    }

    response.list = list;
    return response;


  }

  /**
   * 插入一条记录
   * @param {Link} param0 对应字段
   */
  async save({ title, description, categoryId, logo, href, hit, creatorId }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ title, description, categoryId });

    return await ctx.model.Link.create({ title, description, categoryId, logo, href, hit, creatorId, createTime: new Date() });

  }

  /**
   * 根据 ID 修改
   * @param {Link} param0 对应字段
   */
  async updateById({ id, title, description, categoryId, logo, href, hit }) {

    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ title, description, categoryId });

    return await ctx.model.Link.update({
      title, description, categoryId, logo, href, hit,
    }, {
      where: { id },
    });

  }

  /**
   * 根据 ID 删除
   * @param {number} id id
   */
  async removeById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    return await ctx.model.Link.destroy({ where: { id } });

  }

  /**
   * 根据 ID 获取 详情
   * @param {number} id id
   */
  async getLinkById(id) {

    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    const info = await ctx.model.Link.findOne({ where: { id } });
    if (!info) {
      ctx.throw(ctx.app.enum.resultCode.NOT_FOUND.msg);
    }

    return info;

  }

  /**
   * 验证
   * @param {Link} param0 对应Link字段
   */
  async saveUpdateVerify({ title, description, categoryId }) {
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
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { title, description, categoryId });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    return true;
  }

  /**
   * 统计 - 年新增，总量，chart数据
   */
  async getStatsTotalChart() {

    const { ctx } = this;

    // 获取当前年
    const nowYear = moment().year();
    // 去年
    const nowYearBefore = nowYear - 1;
    // 明年
    const nowYearAfter = nowYear + 1;

    // 获取当前月
    const nowMonthValue = moment().month() + 1;
    const nowMonthValueStr = nowMonthValue < 10 ? '0' + nowMonthValue : nowMonthValue + '';

    // 今年1月1日
    const year = nowYear + '-01-01';
    // 今年当月1日
    const yearMonth = nowYear + '-' + nowMonthValueStr + '-01';
    // 明年1月1日
    const yearAfter = nowYearAfter + '-01-01';
    // 12 月前日期
    // const twelveMothsAgo = moment().subtract(1, 'years').format('YYYY-MM-DD');
    // 12 月前 1号日期
    const twelveMothsDays = nowYearBefore + '-' + nowMonthValueStr + '-01';

    const { Op } = ctx.app.Sequelize;

    // 总数
    const total = await ctx.model.Link.count();

    // 本年新增
    const yearCount = await ctx.model.Link.count({
      where: {
        createTime: {
          [Op.gte]: year,
          [Op.lt]: yearAfter,
        },
      },
    });

    // 设置最近12月数组
    const day = [];
    for (let index = 12; index > 0; index--) {
      day.push(moment().subtract(index, 'months').format('YYYY-MM')); // index月前
    }

    // 读取最近12月数据
    const statsDayTotal = await ctx.model.Link.findAll({
      attributes: [
        [ ctx.model.Link.sequelize.fn('DATE_FORMAT', ctx.model.Link.sequelize.col('create_time'), '%Y-%m'), 'day' ],
        [ ctx.model.Link.sequelize.fn('COUNT', ctx.model.Link.sequelize.col('id')), 'num' ],
      ],
      where: {
        createTime: {
          [Op.gte]: twelveMothsDays,
          [Op.lt]: yearMonth,
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

    // 设置最近12月对应的数量
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
      num: yearCount,
      chart: {
        day,
        num,
      },
    };

  }


}

module.exports = LinkService;
