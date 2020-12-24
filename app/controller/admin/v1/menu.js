'use strict';

const BaseController = require('../base');

/**
 * API-Admin 菜单控制器
 * @author LiQingSong
 */
class MenuController extends BaseController {

  /**
   * 菜单列表
   */
  async menuList() {
    if (!await this.requiresPermissions('/admin/v1/menus:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.resource.listByPid(ctx.query.pid);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 菜单添加
   */
  async menuCreate() {
    if (!await this.requiresPermissions('/admin/v1/menus:create')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.resource.save(ctx.request.body);
      ctx.utils.bodyResult.success({ data: { id: info.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 菜单编辑
   */
  async menuUpdate() {
    if (!await this.requiresPermissions('/admin/v1/menus:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.resource.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 菜单删除
   */
  async menuDelete() {
    if (!await this.requiresPermissions('/admin/v1/menus:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.resource.removeById(ctx.params.id);
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
   * 菜单联动下拉
   */
  async menuCascader() {
    // if (!await this.requiresPermissions('/admin/v1/menus/cascader')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.resource.selectCascader(ctx.query.pid);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 菜单列表 - 全部
   */
  async menuListAll() {
    // if (!await this.requiresPermissions('/admin/v1/menus/all:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.resource.selectIdNamePid();
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

}

module.exports = MenuController;
