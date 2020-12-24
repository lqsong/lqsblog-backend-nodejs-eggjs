'use strict';

const BaseController = require('../base');

/**
 * API-Admin 用户控制器
 * @author LiQingSong
 */
class UserController extends BaseController {

  /**
   * 获取当前登录用户信息
   */
  async info() {
    // if (!await this.requiresPermissions('/admin/v1/user/info:query')) return; // 不设置默认所有用户都有权限

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.user.userInfo(this.currentUser);
      ctx.utils.bodyResult.success({
        data: info,
        token: this.newToken,
      });
    } catch (error) {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.UNAUTHENTICATED);
    }
  }

  /**
   * 退出
   */
  async logout() {
    // if (!await this.requiresPermissions('/admin/v1/user/logout:post')) return; // 不设置默认所有用户都有权限

    /**
     * 1、这里后端不做操作，前端直接清空token
     * 2、如果做操作，可以结合数据库做白名单或黑名单
     */
    const { ctx } = this;
    ctx.utils.bodyResult.success({});
  }


}

module.exports = UserController;
