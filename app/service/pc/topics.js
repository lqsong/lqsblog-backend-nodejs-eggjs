'use strict';

const Service = require('egg').Service;

/**
 * API-PC 专题 Service
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
   * @param {object} param1 { sort = 排序字段下标[id,hit,addtime], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { sort, order }) {

    const { ctx } = this;
    const pageSize = parseInt(per) || 10;
    const currentPage = parseInt(page) || 1;

    const { count, rows } = await ctx.model.Topics.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
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


    // 设置返回数据列表
    const list = [];
    for (let index = 0; index < rowsLen; index++) {

      const item = {
        id: rows[index].id,
        title: rows[index].title,
        alias: rows[index].alias,
      };

      const content = rows[index].content;
      item.quantity = content.length;
      if (item.quantity > 3) {

        item.conlist = [];
        for (let index = 0; index < 3; index++) {
          const element = content[index];
          item.conlist.push(element);
        }

      } else {
        item.conlist = content;
      }

      list.push(item);
    }

    response.list = list;
    return response;


  }

  /**
   * 根据别名查询信息
   * @param {string} alias 别名
   */
  async detailByAlias(alias) {
    const { ctx } = this;
    if (!alias || alias === '') {
      return null;
    }

    const info = await ctx.model.Topics.findOne({ where: { alias } });
    if (!info) {
      return null;
    }

    return {
      id: info.id,
      title: info.title,
      keywords: info.keywords,
      description: info.description,
      addtime: info.addtime,
      hit: info.hit,
      list: info.content,
    };

  }

  /**
   * 根据别名查询信息，并添加浏览量
   * @param {string} alias 别名
   */
  async detailByAliasAndAddHit(alias) {
    const info = await this.detailByAlias(alias);
    if (!info) {
      return null;
    }

    // 点击量+1
    await this.ctx.model.Topics.increment('hit', { where: { alias } });

    return info;

  }


}

module.exports = TopicsService;
