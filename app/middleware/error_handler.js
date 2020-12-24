'use strict';

/**
 * 自定义统一异常处理 middleware
 * @param {any} option 参数
 * @param {Egg.Application} app app
 * @author LiQingSong
 */
module.exports = (option, app) => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      app.emit('error', err, this);
      const status = err.status || 500;
      // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
      const error = status === 500 && app.config.env === 'prod' ? 'Internal Server Error' : err.message;
      // 从 error 对象上读出各个属性，设置到响应中body
      ctx.utils.bodyResult.error({ msg: error, code: status });
    }
  };
};
