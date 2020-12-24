'use strict';

const BaseController = require('../base');

/**
 * API-Admin 搜索控制器
 * @author LiQingSong
 */
class SearchController extends BaseController {

  /**
   * 搜索列表
   */
  async searchList() {
    const { ctx } = this;
    const list = await ctx.service.admin.search.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 搜索热门关键词列表
   */
  async keywordsList() {
    const { ctx } = this;
    const list = await ctx.service.admin.searchHotword.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }


}

module.exports = SearchController;
