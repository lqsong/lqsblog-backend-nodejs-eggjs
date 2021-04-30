'use strict';


const Service = require('egg').Service;

/**
 * API-PC 左邻右舍 Service
 * @author LiQingSong
 */
class LinkService extends Service {

  /**
   * 获取所有分类链接列表
   */
  async selectLinkCategoryAll() {
    const { ctx } = this;

    const list = await ctx.model.Link.findAll();
    const listMap = {};
    const listLen = list.length;
    for (let index = 0; index < listLen; index++) {
      const item = list[index];

      const newItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        href: item.href,
        logo: item.logo,
      };

      if (listMap[item.categoryId]) {
        listMap[item.categoryId].push(newItem);
      } else {
        listMap[item.categoryId] = [ newItem ];
      }

    }

    const cList = await ctx.model.LinkCategory.findAll();
    const linkCategory = [];
    const cListLen = cList.length;
    for (let index = 0; index < cListLen; index++) {
      const element = cList[index];
      linkCategory.push({
        name: element.name,
        children: listMap[element.id] || [],
      });
    }

    return linkCategory;


  }

  /**
   * 根据id查询列表
   * @param {Array} id id
   */
  async getByCategoryId(id) {
    const { ctx } = this;
    if (!id || !Array.isArray(id) || id.length < 1) {
      return [];
    }

    return ctx.model.Link.findAll({
      attributes: [ 'id', 'title', 'description', 'logo', 'href' ],
      where: { id },
    });
  }


}

module.exports = LinkService;
