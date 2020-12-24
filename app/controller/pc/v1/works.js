'use strict';

const BaseController = require('../base');

/**
 * API-PC 作品控制器
 * @author LiQingSong
 */
class WorksController extends BaseController {


  /**
   * 作品列表
   */
  async worksList() {
    const { ctx } = this;
    const list = await ctx.service.pc.works.listPage(this.getPerPage, ctx.query);
    ctx.utils.bodyResult.success({ data: list });
  }

  /**
   * 作品详情
   */
  async worksDetail() {
    const { ctx } = this;
    const info = await ctx.service.pc.works.detailByIdAndAddHit(ctx.query.id);
    if (!info) {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.NOT_FOUND);
    } else {
      ctx.utils.bodyResult.success({ data: info });
    }
  }


}

module.exports = WorksController;
