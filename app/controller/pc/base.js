'use strict';

const Controller = require('egg').Controller;

/**
 * API-PC BaseController
 * @author LiQingSong
 */
class BaseController extends Controller {

  /*
  constructor(ctx) {
    super(ctx);

  }
  */

  /**
   * 获取分页数量和当前页码
   */
  getPerPage() {
    const { ctx } = this;
    const body = ctx.body || {};
    const query = ctx.query || {};

    let per = body.per || query.per;
    let page = body.page || query.page;
    per = isNaN(per) || per < 1 ? 10 : parseInt(per);
    page = isNaN(page) || page < 1 ? 1 : parseInt(page);

    return {
      per,
      page,
    };

  }


}

module.exports = BaseController;
