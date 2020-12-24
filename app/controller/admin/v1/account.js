'use strict';

const BaseController = require('../base');

/**
 * API-Admin 账号控制器
 * @author LiQingSong
 */
class AccountController extends BaseController {

  /**
   * 账号列表
   */
  async accountList() {
    if (!await this.requiresPermissions('/admin/v1/accounts:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.user.userPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 账号添加
   */
  async accountCreate() {
    if (!await this.requiresPermissions('/admin/v1/accounts:create')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.user.save(ctx.request.body);
      ctx.utils.bodyResult.success({ data: { id: info.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 账号编辑
   */
  async accountUpdate() {
    if (!await this.requiresPermissions('/admin/v1/accounts:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.user.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 账号删除
   */
  async accountDelete() {
    if (!await this.requiresPermissions('/admin/v1/accounts:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.user.removeById(ctx.params.id);
      if (rowNum > 0) {
        ctx.utils.bodyResult.success({ token: this.newToken });
      } else {
        ctx.utils.bodyResult.error({});
      }
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }

  /**
   * 账号详情
   */
  async accountRead() {
    if (!await this.requiresPermissions('/admin/v1/accounts:read')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.user.getUserById(ctx.params.id);
      ctx.utils.bodyResult.success({ data: info, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }

}

module.exports = AccountController;
