'use strict';


const Service = require('egg').Service;

/**
 * API-Admin 单页面 Service
 * @author LiQingSong
 */
class SinglePageService extends Service {

  /**
   * 根据 ID 详情
   * @param {number} id id
   */
  async getById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    const info = await ctx.model.SinglePage.findOne({ where: { id } });
    if (!info) {
      ctx.throw(ctx.app.enum.resultCode.NOT_FOUND.msg);
    }

    return info;
  }

  /**
   * 根据 ID 修改
   * @param {SinglePage} param0 对应字段
   */
  async updateById({ id, name, alias, title, keywords, description, content, hit }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    return await ctx.model.SinglePage.update({ name, alias, title, keywords, description, content, hit }, { where: { id } });

  }

}

module.exports = SinglePageService;
