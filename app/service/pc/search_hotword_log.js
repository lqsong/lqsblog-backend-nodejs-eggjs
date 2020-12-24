'use strict';

const Service = require('egg').Service;

/**
 * API-PC 搜索热词日志 Service
 * @author LiQingSong
 */
class SearchHotwordLogService extends Service {

  /**
   * 插入一条关键词、IP记录
   * @param {string} hotWord 热词
   * @param {string} ip ip
   */
  async saveHotWordIp(hotWord, ip) {
    if (!hotWord || !ip) {
      return false;
    }

    return await this.ctx.model.SearchHotwordLog.create({
      hotword: hotWord,
      ip,
      createTime: new Date(),
    });
  }


}

module.exports = SearchHotwordLogService;
