'use strict';

const Service = require('egg').Service;

/**
 * API-PC 文章分类 Service
 * @author LiQingSong
 */
class ArticleCategoryService extends Service {

  /**
   * 根据别名查询信息，并添加浏览量
   * @param {string} alias  别名
   */
  async selectByAliasAndAddHit(alias) {
    const { ctx } = this;
    // 如果为空 读取 默认配置的父分类说明
    if (!alias || alias === '') {

      const id = 2;
      const info = await ctx.model.SinglePage.findOne({ where: { id } });
      if (!info) {
        return null;
      }

      // 点击量+1
      await ctx.model.SinglePage.increment('hit', { where: { id } });

      return {
        name: info.name,
        title: info.title,
        keywords: info.keywords,
        description: info.description,
      };

    }

    const cateInfo = await ctx.model.ArticleCategory.findOne({ where: { alias } });
    if (!cateInfo) {
      return null;
    }

    // 点击量+1
    await ctx.model.ArticleCategory.increment('hit', { where: { alias } });

    return cateInfo;

  }

}

module.exports = ArticleCategoryService;
