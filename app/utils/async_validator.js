'use strict';

const Schema = require('async-validator');

/**
 * async validator Utils
 * @author LiQingSong
 */
class AsyncValidator {

  constructor(ctx) {
    this.ctx = ctx;
  }


  /**
   * init Validate
   * @param {Rules} rule 验证条件
   * @param {ValidateSource} data 需要验证数据
   */
  async validate(rule, data) {
    try {
      const validator = new Schema.default(rule);
      return await validator.validate(data);
    } catch ({ errors, fields }) {
      return { errors, fields };
    }
  }

}

module.exports = AsyncValidator;
