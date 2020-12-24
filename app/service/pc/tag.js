'use strict';


const Service = require('egg').Service;

/**
 * API-PC 标签 Service
 * @author LiQingSong
 */
class TagService extends Service {

  /**
   * 根据名称查询信息，并添加浏览量
   * @param {string} name 名称
   */
  async getByNameAndAddHit(name) {
    const { ctx } = this;
    if (!name || name === '') {
      return null;
    }

    const info = await ctx.model.Tag.findOne({ where: { name } });
    if (!info) {
      return null;
    }

    // 点击量+1
    await ctx.model.Tag.increment('hit', { where: { name } });

    return info;
  }


}

module.exports = TagService;
