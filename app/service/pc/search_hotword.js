'use strict';

const Service = require('egg').Service;

/**
 * API-PC 搜索热词 Service
 * @author LiQingSong
 */
class SearchHotwordService extends Service {

  /**
   * 插入一条关键词,存在则数量+1
   * @param {string} hotWord 热词
   */
  async saveHotWord(hotWord) {
    if (!hotWord || hotWord === '') {
      return false;
    }

    const { ctx } = this;
    const info = await ctx.model.SearchHotword.findOne({ where: { name: hotWord } });
    if (!info) {
      return await ctx.model.SearchHotword.create({ name: hotWord });
    }

    return this.ctx.model.SearchHotword.increment('hit', { where: { name: hotWord } });

  }


}

module.exports = SearchHotwordService;
