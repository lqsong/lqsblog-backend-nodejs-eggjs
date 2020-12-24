'use strict';

const Controller = require('egg').Controller;

/**
 * API-Admin 来宾控制器
 * @author LiQingSong
 */
class GuestController extends Controller {

  /**
   * 图片验证码
   */
  async validateCodeImg() {
    const { ctx } = this;
    ctx.utils.bodyResult.success({ data: ctx.utils.jwtCaptchaToken.createCaptcha({}) });
  }


}

module.exports = GuestController;
