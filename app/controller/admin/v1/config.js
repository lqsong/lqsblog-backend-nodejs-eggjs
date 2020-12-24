'use strict';

const BaseController = require('../base');

/**
 * API-Admin 站点配置控制器
 * @author LiQingSong
 */
class ConfigController extends BaseController {

  /**
   * 站点配置详情
   */
  async configRead() {
    if (!await this.requiresPermissions('/admin/v1/config:read')) return;

    const { ctx } = this;
    const info = await ctx.service.admin.config.getAll();
    ctx.utils.bodyResult.success({ data: info, token: this.newToken });
  }

  /**
   * 站点配置添加(修改)
   */
  async configCreate() {
    if (!await this.requiresPermissions('/admin/v1/config:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.config.updateAll(ctx.request.body);
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }

}

module.exports = ConfigController;
