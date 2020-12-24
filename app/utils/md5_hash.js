'use strict';

const crypto = require('crypto');

/**
 * md5 hash Utils
 * @author LiQingSong
 */
class Md5Hash {

  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 随机盐
   * @param {number} len 长度 返回长度len 2倍
   */
  saltRandom(len) {
    return crypto.randomBytes(len || 4).toString('hex');
  }


  /**
   * 密码二进制md5加密{hashIterations}次
   * @param {object} source 加密的数据
   * @param {object} salt 盐
   * @param {number} hashIterations 加密次数 默认1
   */
  simpleHash(source, salt, hashIterations) {
    const iterations = (!hashIterations || isNaN(hashIterations) || hashIterations < 1) ? 0 : hashIterations - 1;

    const saltBuf = Buffer.from(salt);
    const sourceBuf = Buffer.from(source);
    let hashed = crypto.createHash('md5').update(saltBuf).update(sourceBuf)
      .digest(sourceBuf);

    for (let index = 0; index < iterations; index++) {
      hashed = crypto.createHash('md5').update(hashed).digest(hashed);
    }
    return hashed.toString('hex');
  }


}

module.exports = Md5Hash;
