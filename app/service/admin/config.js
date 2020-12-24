'use strict';


const Service = require('egg').Service;

/**
 * API-Admin 站点配置 Service
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

  /**
   * 修改配置
   * @param {json} map 键值对 {'name':'conent'}
   */
  async updateAll(map) {
    const { ctx } = this;
    if (!map) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    for (const key in map) {
      await ctx.model.Config.update({ content: map[key] }, { where: { name: key } });
    }

    return true;

  }

}

module.exports = ConfigService;
