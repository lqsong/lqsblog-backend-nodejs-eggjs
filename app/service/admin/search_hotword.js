'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 搜索热词 Service
 * @author LiQingSong
 */
class SearchHotwordService extends Service {

  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'hit', 'id' ];
    const len = sort.length - 1;
    return i > len ? sort[0] : sort[i];
  }

  /**
   * 返回 Sequelize 排序
   * @param {object} param0 {sort = 排序字段下标[id,hit], order = 下标[desc 降序，asc 升序]}
   */
  getSequelizeOrder({ sort, order }) {
    const sortVal = (!sort || isNaN(sort)) ? this.getSort(0) : this.getSort(sort);
    const orderVal = (!order || isNaN(sort) || order === 0) ? 'DESC' : 'ASC';
    return [ sortVal, orderVal ];
  }

  /**
   * 获取分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   * @param {object} param1 { sort = 排序字段下标[hit,id], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { sort, order }) {
    const { ctx } = this;
    const pageSize = parseInt(per) || 10;
    const currentPage = parseInt(page) || 1;


    const { count, rows } = await ctx.model.SearchHotword.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      order: [
        this.getSequelizeOrder({ sort, order }),
      ],
    });

    return {
      total: count,
      currentPage,
      list: rows,
    };

  }


}

module.exports = SearchHotwordService;
