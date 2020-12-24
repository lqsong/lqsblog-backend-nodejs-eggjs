'use strict';

const BaseController = require('../base');

/**
 * API-PC 首页控制器
 * @author LiQingSong
 */
class HomeController extends BaseController {


  /**
   * 首页推荐
   */
  async indexRecommend() {
    const { ctx } = this;
    const list = await ctx.service.pc.search.getRecommend(5);
    ctx.utils.bodyResult.success({ data: list });
  }


  /**
   * 首页列表
   */
  async indexList() {
    const { ctx } = this;
    const noSid = ctx.query.noSid ? ctx.query.noSid.split(',') : [];
    const list = await ctx.service.pc.search.listPage(this.getPerPage(), { ...ctx.query, noSid });
    ctx.utils.bodyResult.success({ data: list });
  }


}

module.exports = HomeController;
