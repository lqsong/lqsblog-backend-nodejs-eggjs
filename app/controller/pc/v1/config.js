'use strict';

const BaseController = require('../base');

/**
 * API-PC 站点配置控制器
 * @author LiQingSong
 */
class ConfigController extends BaseController {


  /**
   * 站点配置详情
   */
  async configRead() {
    const { ctx } = this;
    const list = await ctx.service.pc.config.getAll();
    ctx.utils.bodyResult.success({ data: list });
  }


}

module.exports = ConfigController;
