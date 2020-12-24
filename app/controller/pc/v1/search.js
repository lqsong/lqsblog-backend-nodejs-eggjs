'use strict';

const BaseController = require('../base');

/**
 * API-PC 搜索控制器
 * @author LiQingSong
 */
class SearchController extends BaseController {


  /**
   * 搜索
   */
  async searchList() {
    const { ctx } = this;
    const noSid = ctx.query.noSid ? ctx.query.noSid.split(',') : [];
    const list = await ctx.service.pc.search.listPage(this.getPerPage(), { ...ctx.query, noSid });

    // 添加Log
    await ctx.service.pc.searchHotword.saveHotWord(ctx.query.keywords);
    await ctx.service.pc.searchHotwordLog.saveHotWordIp(ctx.query.keywords, ctx.request.ip);

    ctx.utils.bodyResult.success({ data: list });
  }


}

module.exports = SearchController;
