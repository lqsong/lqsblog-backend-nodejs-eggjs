'use strict';


const Service = require('egg').Service;

/**
 * API-PC 站点配置 Service
 * @author LiQingSong
 */
class ConfigService extends Service {

  /**
   * 获取配置
   */
  async getAll() {
    const { ctx } = this;
    const list = await ctx.model.Config.findAll();
    const response = {};
    const listLen = list.length;
    for (let index = 0; index < listLen; index++) {
      const item = list[index];
      response[item.getDataValue('name')] = item.getDataValue('content');
    }

    return response;

  }


}

module.exports = ConfigService;
