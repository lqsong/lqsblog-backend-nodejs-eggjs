'use strict';

/**
 * 404 not found middleware
 * @author LiQingSong
 */
module.exports = () => {
  return async function notFoundHandler(ctx, next) {
    await next();
    if (ctx.status === 404 && !ctx.body) {
      if (ctx.acceptJSON) {
        ctx.utils.bodyResult.error(ctx.app.enum.resultCode.NOT_FOUND);
      } else {
        ctx.body = '<h1>Page Not Found</h1>';
      }
    }
  };
};
