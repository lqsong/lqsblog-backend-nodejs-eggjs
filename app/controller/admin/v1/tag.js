'use strict';

const BaseController = require('../base');

/**
 * API-Admin 标签控制器
 * @author LiQingSong
 */
class TagController extends BaseController {


  /**
   * 标签列表
   */
  async tagsList() {
    if (!await this.requiresPermissions('/admin/v1/tags:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.tag.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 标签添加
   */
  async tagsCreate() {
    if (!await this.requiresPermissions('/admin/v1/tags:create')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.tag.save(ctx.request.body);
      ctx.utils.bodyResult.success({ data: { id: info.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 标签编辑
   */
  async tagsUpdate() {
    if (!await this.requiresPermissions('/admin/v1/tags:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.tag.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 标签删除
   */
  async tagsDelete() {
    if (!await this.requiresPermissions('/admin/v1/tags:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.tag.removeById(ctx.params.id);
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
   * 标签搜索下拉列表
   */
  async tagsSearch() {
    // if (!await this.requiresPermissions('/admin/v1/tags/search')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.tag.searchKeywordsLimit(ctx.query.keywords);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }


}

module.exports = TagController;
