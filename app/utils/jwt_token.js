'use strict';

/**
 * Jwt Token Utils
 * @author LiQingSong
 */
class JwtToken {

  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 设置认证token
   * @param {string|number|Array|object} data 数据{id: 0, name: '', ...}
   */
  createJWT(data) {
    const { ctx } = this;
    return ctx.app.jwt.sign({ data }, ctx.app.config.jwt.secret, { expiresIn: ctx.app.config.jwt.expiresIn });
  }

  /**
   * 解析token字符串
   * @param {string} token token
   */
  parseJWT(token) {
    const { ctx } = this;
    try {
      const decoded = ctx.app.jwt.verify(token, ctx.app.config.jwt.secret);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * 根据过期时间与重置时间，重置认证token
   * @param {string} token token
   * @param {string|number|Array|object} data 数据{id: 0, name: '', ...}
   */
  restJwt(token, data) {
    const bool = this.expirationNewJWT(token);
    if (bool) {
      return this.createJWT(data);
    }

    return null;
  }

  /**
   * 解析token字符串, 判断失效时间，返回是否生成新的token
   * @param {string} token token
   */
  expirationNewJWT(token) {
    const { ctx } = this;
    const decoded = this.parseJWT(token);
    if (decoded !== null) {
      const exp = decoded.exp;
      const now = Date.now() / 1000;
      if (exp - now <= ctx.app.config.jwt.restExpiresIn) {
        return true;
      }
    }
    return false;

  }


}


module.exports = JwtToken;
