'use strict';

const BaseController = require('../base');

/**
 * API-Admin 左邻右舍控制器
 * @author LiQingSong
 */
class LinkController extends BaseController {

  /**
   * 左邻右舍列表
   */
  async linkList() {
    if (!await this.requiresPermissions('/admin/v1/links:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.link.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 左邻右舍添加
   */
  async linkCreate() {
    if (!await this.requiresPermissions('/admin/v1/links:create')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.link.save({ ...ctx.request.body, creatorId: this.currentUser.id });
      ctx.utils.bodyResult.success({ data: { id: info.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 左邻右舍编辑
   */
  async linkUpdate() {
    if (!await this.requiresPermissions('/admin/v1/links:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.link.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 左邻右舍删除
   */
  async linkDelete() {
    if (!await this.requiresPermissions('/admin/v1/links:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.link.removeById(ctx.params.id);
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
   * 左邻右舍详情
   */
  async linkRead() {
    if (!await this.requiresPermissions('/admin/v1/links:read')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.link.getLinkById(ctx.params.id);
      ctx.utils.bodyResult.success({ data: info, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }

  /**
   * 左邻右舍分类列表
   */
  async categoryList() {
    if (!await this.requiresPermissions('/admin/v1/links/categorys:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.linkCategory.list(1, 1);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 左邻右舍分类添加
   */
  async categoryCreate() {
    if (!await this.requiresPermissions('/admin/v1/links/categorys:create')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.linkCategory.save(ctx.request.body);
      ctx.utils.bodyResult.success({ data: { id: info.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 左邻右舍分类编辑
   */
  async categoryUpdate() {
    if (!await this.requiresPermissions('/admin/v1/links/categorys:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.linkCategory.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 左邻右舍分类删除
   */
  async categoryDelete() {
    if (!await this.requiresPermissions('/admin/v1/links/categorys:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.linkCategory.removeById(ctx.params.id);
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

module.exports = LinkController;
