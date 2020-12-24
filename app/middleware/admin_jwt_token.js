'use strict';

/**
 * admin jwt token verfiy middleware
 * 演示用，项目 Admin 直接在 BaseController中进行了判断
 * @author LiQingSong
 */
module.exports = () => {
  return async function adminJwtToken(ctx, next) {

    const token = ctx.get(ctx.app.config.jwt.headerTokenKey);
    if (token) {
      const user = ctx.utils.jwtToken.parseJWT(token);
      if (user === null) {
        ctx.utils.bodyResult.error(ctx.app.enum.resultCode.UNAUTHENTICATED);
        return; // exit;
      }
    } else {
      ctx.utils.bodyResult.error(ctx.app.enum.resultCode.UNAUTHENTICATED);
      return; // exit;
    }

    await next();

  };
};
