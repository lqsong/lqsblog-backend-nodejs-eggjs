'use strict';

const BaseController = require('../base');

/**
 * API-Admin 关于控制器
 * @author LiQingSong
 */
class AboutController extends BaseController {

  /**
   * 关于我详情
   */
  async aboutRead() {
    if (!await this.requiresPermissions('/admin/v1/about:read')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.singlePage.getById(1);
      ctx.utils.bodyResult.success({ data: info, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }

  /**
   * 关于我添加(修改)
   */
  async aboutCreate() {
    if (!await this.requiresPermissions('/admin/v1/about:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.singlePage.updateById({ ...ctx.request.body, id: 1 });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }


}

module.exports = AboutController;
