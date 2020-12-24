'use strict';

const BaseController = require('../base');

/**
 * API-Admin 文章控制器
 * @author LiQingSong
 */
class ArticleController extends BaseController {

  /**
   * 文章列表
   */
  async articleList() {
    if (!await this.requiresPermissions('/admin/v1/articles:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.article.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 文章添加
   */
  async articleCreate() {
    if (!await this.requiresPermissions('/admin/v1/articles:create')) return;

    const { ctx } = this;
    try {
      const article = await ctx.service.admin.article.save({ ...ctx.request.body, creatorId: this.currentUser.id });
      ctx.utils.bodyResult.success({ data: { id: article.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }

  }

  /**
   * 文章编辑
   */
  async articleUpdate() {
    if (!await this.requiresPermissions('/admin/v1/articles:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.article.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }

  }

  /**
   * 文章删除
   */
  async articleDelete() {
    if (!await this.requiresPermissions('/admin/v1/articles:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.article.removeById(ctx.params.id);
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
   * 文章详情
   */
  async articleRead() {
    if (!await this.requiresPermissions('/admin/v1/articles:read')) return;

    const { ctx } = this;
    try {
      const article = await ctx.service.admin.article.getArticleInterestById(ctx.params.id);
      ctx.utils.bodyResult.success({ data: article, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }

  /**
   * 文章分类列表
   */
  async categoryList() {
    if (!await this.requiresPermissions('/admin/v1/articles/categorys:list')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.articleCategory.listByPid(ctx.query.pid);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 文章分类添加
   */
  async categoryCreate() {
    if (!await this.requiresPermissions('/admin/v1/articles/categorys:create')) return;

    const { ctx } = this;
    try {
      const category = await ctx.service.admin.articleCategory.save(ctx.request.body);
      ctx.utils.bodyResult.success({ data: { id: category.id }, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }

  }

  /**
   * 文章分类编辑
   */
  async categoryUpdate() {
    if (!await this.requiresPermissions('/admin/v1/articles/categorys:update')) return;

    const { ctx } = this;
    try {
      await ctx.service.admin.articleCategory.updateById({ ...ctx.request.body, id: ctx.params.id });
      ctx.utils.bodyResult.success({ token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message, errors: error.errors });
    }
  }

  /**
   * 文章分类删除
   */
  async categoryDelete() {
    if (!await this.requiresPermissions('/admin/v1/articles/categorys:delete')) return;

    const { ctx } = this;
    try {
      const rowNum = await ctx.service.admin.articleCategory.removeById(ctx.params.id);
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
   * 文章分类联动下拉
   */
  async categoryCascader() {
    // if (!await this.requiresPermissions('/admin/v1/articles/categorys/cascader')) return;

    const { ctx } = this;
    const list = await ctx.service.admin.articleCategory.selectCascaderByPid(ctx.query.pid);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }


}

module.exports = ArticleController;
