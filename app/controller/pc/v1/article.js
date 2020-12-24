'use strict';

const BaseController = require('../base');

/**
 * API-PC 随笔控制器
 * @author LiQingSong
 */
class ArticleController extends BaseController {


  /**
   * 文章分类信息
   */
  async articleCategory() {
    const { ctx } = this;
    const info = await ctx.service.pc.articleCategory.selectByAliasAndAddHit(ctx.query.alias);
    if (!info) {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.NOT_FOUND);
    } else {
      ctx.utils.bodyResult.success({ data: info });
    }
  }

  /**
   * 文章列表
   */
  async articleList() {
    const { ctx } = this;
    const list = await ctx.service.pc.article.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list });
  }

  /**
   * 文章详情
   */
  async articleDetail() {
    const { ctx } = this;
    const info = await ctx.service.pc.article.detailByIdAndAddHit(ctx.query.id);
    if (!info) {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.NOT_FOUND);
    } else {
      ctx.utils.bodyResult.success({ data: info });
    }
  }

  /**
   * 文章详情可能感兴趣
   */
  async articleInterest() {
    const { ctx } = this;
    const list = await ctx.service.pc.article.listByIds(ctx.query.ids);
    ctx.utils.bodyResult.success({ data: list });
  }


}

module.exports = ArticleController;
