'use strict';

const BaseController = require('../base');

/**
 * API-Admin 角色控制器
 * @author LiQingSong
 */
class RoleController extends BaseController {

  /**
   * 角色列表
   */
  async roleList() {
    if (!await this.requiresPermissions('/admin/v1/roles:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.role.listAll();
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 角色添加
   */
  async roleCreate() {
    if (!await this.requiresPermissions('/admin/v1/roles:create')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.role.save(ctx.request.body);
      ctx.utils.bodyResult.success({ data: { id: info.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 角色编辑
   */
  async roleUpdate() {
    if (!await this.requiresPermissions('/admin/v1/roles:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.role.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 角色删除
   */
  async roleDelete() {
    if (!await this.requiresPermissions('/admin/v1/roles:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.role.removeById(ctx.params.id);
      if (rowNum > 0) {
        ctx.utils.bodyResult.success({ token: this.newToken });
      } else {
        ctx.utils.bodyResult.error({});
      }
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }

}

module.exports = RoleController;
