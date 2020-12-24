'use strict';

const Controller = require('egg').Controller;

/**
 * API-Admin BaseController
 * @author LiQingSong
 */
class BaseController extends Controller {

  constructor(ctx) {
    super(ctx);

    const token = ctx.get(ctx.app.config.jwt.headerTokenKey);
    const decoded = ctx.utils.jwtToken.parseJWT(token);

    // 登录认证验证
    if (decoded === null) {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.UNAUTHENTICATED);
      return ctx; // exit;
      /* // exit;
        注: 此处不能用:
        1、return; --- 只会不执行constructor后面的代码;
        2、return false;return null; --- 报错 Derived constructors may only return object or undefined
        3、所以 return object，可以终止后面所有代码，包括继承。
      */
    }

    // 获取用户信息
    this.currentUser = decoded.data || {};

    // 设置新的token
    this.newToken = ctx.utils.jwtToken.restJwt(token, this.currentUser);


  }

  /**
   * 验证权限
   * @param {string} permission 权限编号
   */
  async requiresPermissions(permission) {
    const { ctx } = this;
    try {
      const perms = await ctx.service.admin.permission.listPermissionByUserId(this.currentUser.id);
      if (!perms.includes(permission)) {
        ctx.utils.bodyResult.error(ctx.app.enum.resultCode.UNAUTHORISE);
        return false;
      }
    } catch (error) {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.UNAUTHENTICATED);
      return false;
    }

    return true;

  }

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
