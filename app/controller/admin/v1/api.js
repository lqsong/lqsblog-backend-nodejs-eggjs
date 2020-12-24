'use strict';

const BaseController = require('../base');

/**
 * API-Admin API控制器
 * @author LiQingSong
 */
class ApiController extends BaseController {

  /**
   * API列表
   */
  async apiList() {
    if (!await this.requiresPermissions('/admin/v1/apis:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.permission.listByPid(ctx.query.pid);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * API添加
   */
  async apiCreate() {
    if (!await this.requiresPermissions('/admin/v1/apis:create')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.permission.save(ctx.request.body);
      ctx.utils.bodyResult.success({ data: { id: info.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * API编辑
   */
  async apiUpdate() {
    if (!await this.requiresPermissions('/admin/v1/apis:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.permission.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * API删除
   */
  async apiDelete() {
    if (!await this.requiresPermissions('/admin/v1/apis:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.permission.removeById(ctx.params.id);
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
   * API联动下拉
   */
  async apiCascader() {
    // if (!await this.requiresPermissions('/admin/v1/apis/cascader')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.permission.selectCascader(ctx.query.pid);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * API列表 - 全部
   */
  async apiListAll() {
    // if (!await this.requiresPermissions('/admin/v1/apis/all:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.permission.selectIdNamePid();
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

}

module.exports = ApiController;
