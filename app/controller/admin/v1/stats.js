'use strict';

const BaseController = require('../base');

/**
 * API-Admin 统计控制器
 * @author LiQingSong
 */
class StatsController extends BaseController {

  /**
   * 随笔 - 日新增，总量，日同比，周同比
   */
  async articlesDailyNew() {
    const { ctx } = this;
    const info = await ctx.service.admin.article.getArticleDailyNew();
    ctx.utils.bodyResult.success({ data: info, token: this.newToken });
  }

  /**
   * 作品 - 周新增，总量，chart数据
   */
  async worksWeekNew() {
    const { ctx } = this;
    const info = await ctx.service.admin.works.getStatsTotalChart();
    ctx.utils.bodyResult.success({ data: info, token: this.newToken });
  }

  /**
   * 专题 - 月新增，总量，chart数据
   */
  async topicsMonthNew() {
    const { ctx } = this;
    const info = await ctx.service.admin.topics.getStatsTotalChart();
    ctx.utils.bodyResult.success({ data: info, token: this.newToken });
  }

  /**
   * 左邻右舍 - 年新增，总量，chart数据
   */
  async linksAnnualNew() {
    const { ctx } = this;
    const info = await ctx.service.admin.link.getStatsTotalChart();
    ctx.utils.bodyResult.success({ data: info, token: this.newToken });
  }


}

module.exports = StatsController;
