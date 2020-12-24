'use strict';

const BaseController = require('../base');

/**
 * API-Admin 作品控制器
 * @author LiQingSong
 */
class WorksController extends BaseController {

  /**
   *作品列表
   */
  async worksList() {
    if (!await this.requiresPermissions('/admin/v1/works:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.works.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 作品添加
   */
  async worksCreate() {
    if (!await this.requiresPermissions('/admin/v1/works:create')) return;

    const { ctx } = this;
    try {
      const works = await ctx.service.admin.works.save({ ...ctx.request.body, creatorId: this.currentUser.id });
      ctx.utils.bodyResult.success({ data: { id: works.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 作品编辑
   */
  async worksUpdate() {
    if (!await this.requiresPermissions('/admin/v1/works:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.works.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 作品删除
   */
  async worksDelete() {
    if (!await this.requiresPermissions('/admin/v1/works:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.works.removeById(ctx.params.id);
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
   * 作品详情
   */
  async worksRead() {
    if (!await this.requiresPermissions('/admin/v1/works:read')) return;

    const { ctx } = this;
    try {
      const works = await ctx.service.admin.works.getById(ctx.params.id);
      ctx.utils.bodyResult.success({ data: works, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }


}

module.exports = WorksController;
