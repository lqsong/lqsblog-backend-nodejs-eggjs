'use strict';


const Service = require('egg').Service;

/**
 * API-PC 单页面 Service
 * @author LiQingSong
 */
class SinglePageService extends Service {

  /**
   * 根据id查找详情 ，并添加浏览量
   * @param {number} id id
   */
  async getByIdAndAddHit(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      return null;
    }

    const info = await ctx.model.SinglePage.findOne({ where: { id } });
    if (!info) {
      return null;
    }

    // 点击量+1
    await ctx.model.SinglePage.increment('hit', { where: { id } });

    return info;
  }

}

module.exports = SinglePageService;
