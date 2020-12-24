'use strict';

const BaseController = require('../base');

/**
 * API-PC 左邻右舍控制器
 * @author LiQingSong
 */
class LinkController extends BaseController {


  /**
   * 左邻右舍列表
   */
  async linksList() {
    const { ctx } = this;
    const list = await ctx.service.pc.link.selectLinkCategoryAll();
    ctx.utils.bodyResult.success({ data: list });
  }

  /**
   * 左邻右舍推荐
   */
  async linksRecommend() {
    const { ctx } = this;
    const ids = ctx.query.ids ? ctx.query.ids.split(',') : [];
    const list = await ctx.service.pc.link.getByCategoryId(ids);
    ctx.utils.bodyResult.success({ data: list });
  }


}

module.exports = LinkController;
