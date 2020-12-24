'use strict';

/**
 * body result Utils
 * @author LiQingSong
 */
class BodyResult {

  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 处理成功响应
   * @param {object} param0 { data = undefined, msg = null, code = null, token = undefined }
   * @author LiQingSong
   */
  success({ data = undefined, msg = null, code = null, token = undefined }) {
    const { ctx } = this;
    ctx.body = this.jsonSuccess({ data, msg, code, token });
    ctx.status = 200;
  }

  /**
   * 处理错误响应
   * @param {object} param0 { msg = null, code = null }
   * @author LiQingSong
   */
  error({ msg = null, code = null, errors }) {
    const { ctx } = this;
    ctx.body = this.jsonError({ msg, code, errors });
    ctx.status = 200;
  }

  /**
   * 验证参数字段
   * @param {object} param0 {rule = {}, body, tips = false}
   * @author LiQingSong
   */
  async validate({ rule = {}, data, tips = false }) {
    const { ctx } = this;

    const vaJson = await this.jsonValidate({ rule, data, tips });
    if (vaJson === true) {
      return true;
    }

    ctx.body = vaJson;
    ctx.status = 200;
    return false;

  }

  /**
   * 返回错误json
   * @param {object} param0 { msg = null, code = null }
   * @author LiQingSong
   */
  jsonError({ msg = null, code = null, errors }) {
    const { ctx } = this;
    return {
      code: code || ctx.app.enum.resultCode.FAIL.code,
      msg: msg || ctx.app.enum.resultCode.FAIL.msg,
      errors,
    };
  }

  /**
   * 返回成功json
   * @param {object} param0  { data = undefined, msg = null, code = null, token = undefined }
   * @author LiQingSong
   */
  jsonSuccess({ data = undefined, msg = null, code = null, token = undefined }) {
    const { ctx } = this;
    return {
      code: code || ctx.app.enum.resultCode.SUCCESS.code,
      data,
      msg: msg || ctx.app.enum.resultCode.SUCCESS.msg,
      token,
    };
  }

  /**
   * 返回验证json
   * @param {object} param0  { rule = {}, data, tips = true }
   * @author LiQingSong
   */
  async jsonValidate({ rule = {}, data, tips = true }) {
    const { ctx } = this;
    const va = await ctx.utils.asyncValidator.validate(rule, data || ctx.request.body);
    if (!va) {
      return true;
    }
    if (!tips) {
      return ctx.app.enum.resultCode.VERIFICATION_FAILED;
    }
    return {
      code: ctx.app.enum.resultCode.VERIFICATION_FAILED.code,
      msg: ctx.app.enum.resultCode.VERIFICATION_FAILED.msg,
      errors: va.errors || {},
    };
  }


}

module.exports = BodyResult;
