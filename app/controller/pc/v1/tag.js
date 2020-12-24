'use strict';

const BaseController = require('../base');

/**
 * API-PC 标签控制器
 * @author LiQingSong
 */
class TagController extends BaseController {


  /**
   * 标签下内容列表
   */
  async tagList() {
    const { ctx } = this;
    const name = ctx.query.name || '';
    if (name === '') {
      ctx.utils.bodyResult.success({ data: [] });
    } else {
      const list = await ctx.service.pc.search.listPage(this.getPerPage(), { tag: name });

      // 添加Log
      await ctx.service.pc.tagLog.saveTagIp(name, ctx.request.ip);

      ctx.utils.bodyResult.success({ data: list });
    }

  }

  /**
   * 标签详情
   */
  async tagDetail() {
    const { ctx } = this;
    const info = await ctx.service.pc.tag.getByNameAndAddHit(ctx.query.name);
    if (!info) {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.NOT_FOUND);
    } else {
      ctx.utils.bodyResult.success({ data: info });
    }
  }


}

module.exports = TagController;
