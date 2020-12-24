'use strict';

const BaseController = require('../base');

/**
 * API-Admin 专题控制器
 * @author LiQingSong
 */
class TopicsController extends BaseController {

  /**
   * 专题列表
   */
  async topicsList() {
    if (!await this.requiresPermissions('/admin/v1/topics:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.topics.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 专题添加
   */
  async topicsCreate() {
    if (!await this.requiresPermissions('/admin/v1/topics:create')) return;

    const { ctx } = this;
    try {
      const topics = await ctx.service.admin.topics.save({ ...ctx.request.body, creatorId: this.currentUser.id });
      ctx.utils.bodyResult.success({ data: { id: topics.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 专题编辑
   */
  async topicsUpdate() {
    if (!await this.requiresPermissions('/admin/v1/topics:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.topics.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 专题删除
   */
  async topicsDelete() {
    if (!await this.requiresPermissions('/admin/v1/topics:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.topics.removeById(ctx.params.id);
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
   * 专题详情
   */
  async topicsRead() {
    if (!await this.requiresPermissions('/admin/v1/topics:read')) return;

    const { ctx } = this;
    try {
      const info = await ctx.service.admin.topics.getById(ctx.params.id);
      ctx.utils.bodyResult.success({ data: info, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }


}

module.exports = TopicsController;
