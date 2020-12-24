'use strict';

const BaseController = require('../base');

/**
 * API-PC 专题控制器
 * @author LiQingSong
 */
class TopicsController extends BaseController {


  /**
   * 专题列表
   */
  async topicsList() {
    const { ctx } = this;
    const list = await ctx.service.pc.topics.listPage(this.getPerPage(), ctx.query);
    ctx.utils.bodyResult.success({ data: list });
  }

  /**
   * 专题详情
   */
  async topicsDetail() {
    const { ctx } = this;
    const info = await ctx.service.pc.topics.detailByAliasAndAddHit(ctx.query.alias);
    if (!info) {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.NOT_FOUND);
    } else {

      // 添加Log
      await ctx.service.pc.topicsLog.saveTopicsIp(info, ctx.request.ip);

      ctx.utils.bodyResult.success({ data: info });
    }
  }


}

module.exports = TopicsController;
