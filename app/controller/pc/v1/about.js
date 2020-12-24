'use strict';

const BaseController = require('../base');

/**
 * API-PC 关于控制器
 * @author LiQingSong
 */
class AboutController extends BaseController {


  /**
   * 关于我详情
   */
  async aboutRead() {
    const { ctx } = this;
    const info = await ctx.service.pc.singlePage.getByIdAndAddHit(1);
    ctx.utils.bodyResult.success({ data: info });
  }


}

module.exports = AboutController;
