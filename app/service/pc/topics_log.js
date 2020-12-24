'use strict';

const Service = require('egg').Service;

/**
 * API-PC 专题日志 Service
 * @author LiQingSong
 */
class TopicsLogService extends Service {

  /**
   * 插入一条专题、IP记录
   * @param {Topics} param0  专题字段 {id, title}
   * @param {string} ip ip地址
   */
  async saveTopicsIp({ id, title }, ip) {

    if (!id || !ip) {
      return false;
    }

    return await this.ctx.model.TopicsLog.create({
      tid: id,
      topics: title,
      ip,
      createTime: new Date(),
    });

  }


}

module.exports = TopicsLogService;
