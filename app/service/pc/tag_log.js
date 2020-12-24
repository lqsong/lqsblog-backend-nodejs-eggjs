'use strict';

const Service = require('egg').Service;

/**
 * API-PC 标签日志 Service
 * @author LiQingSong
 */
class TagLogService extends Service {

  /**
   * 插入一条标签、IP记录
   * @param {string} tag  标签名称
   * @param {string} ip ip地址
   */
  async saveTagIp(tag, ip) {

    if (!tag || !ip) {
      return false;
    }

    return await this.ctx.model.TagLog.create({
      tag,
      ip,
      createTime: new Date(),
    });

  }


}

module.exports = TagLogService;
