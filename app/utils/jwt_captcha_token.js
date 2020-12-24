'use strict';

const captchapng = require('captchapng');

/**
 * Jwt Captcha Token Utils
 * @author LiQingSong
 */
class JwtCaptchaToken {

  constructor(ctx) {
    this.ctx = ctx;
    this.randomString = '0123456789'; // 必须是数字，captchapng目前只支持数字
  }


  /**
     * 获取随机字符
     * @param {number} num 随机个数，默认4
     */
  getRandomString(num) {
    const len = num || 4;
    const strings = this.randomString;
    const maxPos = strings.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += strings.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }

  /**
     * 获取png base64与code
     * @param {object} param0 arguments[0] {len = 随机个数, width = 宽, height = 高}
     */
  getCaptchaBase64Code({ len = 4, width = 160, height = 40 }) {
    const code = this.getRandomString(len);
    const p = new captchapng(width, height, code);
    p.color(0, 0, 0, 0); // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
    const img = p.getBase64();
    // const imgbase64 = new Buffer(img, 'base64');
    return {
      code,
      base64: 'data:image/png;base64,' + img,
    };
  }

  /**
     * 生成 token 图片验证码
     * @param {object} param0 arguments[0] {len = 随机个数, width = 宽, height = 高}
     */
  createCaptcha({ len = 4, width = 160, height = 40 }) {
    const captcha = this.getCaptchaBase64Code({ len, width, height });
    return {
      tokenCode: this.ctx.utils.jwtToken.createJWT(captcha.code),
      base64: captcha.base64,
    };
  }

  /**
     * 解析token图片验证码 返回 验证码字符串
     * @param {string} token 加密的验证码字符串
     */
  parseCaptcha(token) {
    const decoded = this.ctx.utils.jwtToken.parseJWT(token);
    if (decoded === null) {
      return null;
    }
    return decoded.data || null;
  }


}

module.exports = JwtCaptchaToken;
