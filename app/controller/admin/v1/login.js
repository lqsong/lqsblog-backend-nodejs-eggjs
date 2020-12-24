'use strict';

const Controller = require('egg').Controller;

/**
 * API-Admin 登录控制器
 * @author LiQingSong
 */
class LoginController extends Controller {

  /**
   * 登录
   */
  async index() {
    const { ctx } = this;
    const loginRule = {
      username: {
        type: 'string',
        required: true,
      },
      password: {
        type: 'string',
        required: true,
      },
      imgCode: {
        type: 'string',
        required: true,
      },
      imgCodeToken: {
        type: 'string',
        required: true,
      },
    };
    // 校验参数字段
    if (!await ctx.utils.bodyResult.validate({ rule: loginRule/* , tips: true */ })) {
      return;
    }

    const code = ctx.utils.jwtCaptchaToken.parseCaptcha(ctx.request.body.imgCodeToken);
    if (ctx.request.body.imgCode !== code) {
      ctx.utils.bodyResult.error({ msg: '验证码不正确' });
      return;
    }

    try {
      const user = await ctx.service.admin.user.loginUser(ctx.request.body);
      const token = ctx.utils.jwtToken.createJWT(user);
      ctx.utils.bodyResult.success({ data: { token } });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: '用户名或密码错误' });
    }

  }


}

module.exports = LoginController;
