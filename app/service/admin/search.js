'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 搜索 Service
 * @author LiQingSong
 */
class SearchService extends Service {

  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'sid', 'addtime' ];
    const len = sort.length - 1;
    return i > len ? sort[0] : sort[i];
  }

  /**
   * 返回 Sequelize 排序
   * @param {object} param0 {sort = 排序字段下标[sid,addtime], order = 下标[desc 降序，asc 升序]}
   */
  getSequelizeOrder({ sort, order }) {
    const sortVal = (!sort || isNaN(sort)) ? this.getSort(0) : this.getSort(sort);
    const orderVal = (!order || isNaN(sort) || order === 0) ? 'DESC' : 'ASC';
    return [ sortVal, orderVal ];
  }

  /**
   * 插入一条记录
   * @param {search} search 对应表字段
   */
  async save(search) {
    const { ctx } = this;

    if (!search) {
      return false;
    }

    const record = await ctx.model.Search.create(search);

    return record;
  }

  /**
   * 根据 ID 修改
   * @param {search} search 对应表字段
   */
  async updateById(search) {
    if (!search) {
      return false;
    }

    await this.remove(search);

    return this.save(search);

  }

  /**
   * 删除根据id,type
   * @param {search} search 对应表字段
   */
  async remove(search) {
    const { ctx } = this;
    return await ctx.model.Search.destroy({
      where: {
        id: search.id,
        type: search.type,
      },
    });
  }

  /**
   * 文章字段生成对应搜索字段
   * @param {Artilce} article 对应文章字段
   */
  articleToSearch(article) {
    return {
      id: article.id,
      type: 1,
      categoryId: article.categoryId,
      title: article.title,
      keywords: article.keywords,
      description: article.description,
      thumb: article.thumb,
      tag: article.tag,
      addtime: article.addtime,
      keyPrecise: this.getKeyPrecise(article.categoryIds, article.tag),
    };
  }


  /**
   * 作品字段生成对应搜索字段
   * @param {Works} works  对应作品字段
   */
  worksToSearch(works) {
    return {
      id: works.id,
      type: 2,
      categoryId: '',
      title: works.title,
      keywords: works.keywords,
      description: works.description,
      thumb: works.thumb,
      tag: works.tag,
      addtime: works.addtime,
      keyPrecise: this.getKeyPrecise('', works.tag),
    };
  }

  /**
   * 生成 搜索关键词
   * @param {string} categoryIds 分类id , 链接
   * @param {string} tag 标签 , 链接
   */
  getKeyPrecise(categoryIds, tag) {

    const keyArr = [];

    if (categoryIds && categoryIds !== '') {
      const catArr = categoryIds.split(',');
      const catArrLen = catArr.length - 1;
      for (let index = catArrLen; index >= 0; index--) {
        keyArr.push('category_' + catArr[index]);
      }
    }

    if (tag && tag !== '') {
      const tagArr = tag.split(',');
      const tagArrLen = tagArr.length - 1;
      for (let index = tagArrLen; index >= 0; index--) {
        keyArr.push('tag_' + tagArr[index]);
      }
    }

    return keyArr.join(' ');

  }


  /**
   * 获取分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   * @param {object} param1 { keywords, sort = 排序字段下标[sid,addtime], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async listPage({ per = 10, page = 1 }, { keywords, sort, order }) {
    const { ctx } = this;
    const pageSize = parseInt(per) || 10;
    const currentPage = parseInt(page) || 1;

    const { Op } = ctx.app.Sequelize;
    const where = {};
    if (keywords && keywords !== '') {
      where.title = {
        [Op.like]: '%' + keywords + '%',
      };
    }

    const { count, rows } = await ctx.model.Search.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      where,
      order: [
        this.getSequelizeOrder({ sort, order }),
      ],
    });

    // 设置返回响应
    const response = {
      total: count,
      currentPage,
      list: [],
    };
    const rowsLen = rows.length;
    if (rowsLen < 1) {
      return response;
    }

    // 取出分类id
    const cIds = [];
    for (let index = 0; index < rowsLen; index++) {
      if (rows[index].categoryId && rows[index].categoryId !== 0) {
        cIds.push(rows[index].categoryId);
      }
    }
    const articleCategories = await ctx.model.ArticleCategory.findAll({
      where: {
        id: cIds,
      },
    });
    const categorys = {};
    for (let index = 0; index < articleCategories.length; index++) {
      categorys[articleCategories[index].id] = {
        id: articleCategories[index].id,
        name: articleCategories[index].name,
        alias: articleCategories[index].alias,
      };
    }

    // 设置返回数据列表
    const list = [];
    for (let index = 0; index < rowsLen; index++) {
      list.push({
        id: rows[index].id,
        type: rows[index].type,
        title: rows[index].title,
        description: rows[index].description,
        thumb: rows[index].thumb,
        category: (rows[index].categoryId && rows[index].categoryId !== 0) ? (categorys[rows[index].categoryId] || {}) : {},
        addtime: rows[index].addtime,
      });
    }

    response.list = list;
    return response;


  }


}

module.exports = SearchService;
