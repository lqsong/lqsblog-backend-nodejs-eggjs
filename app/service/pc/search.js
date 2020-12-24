'use strict';

const Service = require('egg').Service;

/**
 * API-PC 搜索 Service
 * @author LiQingSong
 */
class SearchService extends Service {

  /**
   * 获取推荐列表
   * @param {number} limit 条数
   */
  async getRecommend(limit) {
    const { ctx } = this;
    const { Op } = ctx.app.Sequelize;
    return ctx.model.Search.findAll({
      limit,
      attributes: [ 'sid', 'id', 'type', 'title', 'thumb' ],
      where: {
        thumb: {
          [Op.ne]: '',
          [Op.not]: null,
        },
      },
      order: [
        [ 'addtime', 'DESC' ],
      ],
    });

  }

  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'addtime', 'sid' ];
    const len = sort.length - 1;
    return i > len ? sort[0] : sort[i];
  }

  /**
   * 返回 Sequelize 排序
   * @param {object} param0 {sort = 排序字段下标[addtime, sid], order = 下标[desc 降序，asc 升序]}
   */
  getSequelizeOrder({ sort, order }) {
    const sortVal = (!sort || isNaN(sort)) ? this.getSort(0) : this.getSort(sort);
    const orderVal = (!order || isNaN(sort) || order === 0) ? 'DESC' : 'ASC';
    return [ sortVal, orderVal ];
  }

  /**
   * 获取分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   * @param {object} param1 { keywords, noSid, categoryId, tag, sort = 排序字段下标[addtime, sid], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { keywords, noSid = [], categoryId, tag, sort, order }) {


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
    if
    (noSid && noSid.length > 0) {
      where.sid = {
        [Op.notIn]: noSid,
      };
    }

    const againstArr = [];
    let againstWhere = {};
    if (categoryId && categoryId !== 0) {
      againstArr.push('+category_' + categoryId);
    }
    if (tag && tag !== '') {
      againstArr.push('+tag_' + tag);
    }
    if (againstArr.length > 0) {
      const join = againstArr.join(' ');
      againstWhere = {
        [Op.and]: [
          ctx.model.Search.sequelize.literal("match(key_precise) against ('" + join + "' IN BOOLEAN MODE) "),
        ],
      };
    }


    const { count, rows } = await ctx.model.Search.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      where: {
        ...where,
        ...againstWhere,
      },
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
      if (rows[index].categoryId && rows[index].categoryId !== 0) {
        cIds.push(rows[index].categoryId);
      }
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
        type: rows[index].type,
        title: rows[index].title,
        description: rows[index].description,
        thumb: rows[index].thumb.split('|'),
        category: (rows[index].categoryId && rows[index].categoryId !== 0) ? (categorys[rows[index].categoryId] || {}) : {},
        addtime: rows[index].addtime,
      });
    }

    response.list = list;
    return response;

  }

}

module.exports = SearchService;
