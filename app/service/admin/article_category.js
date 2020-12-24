'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 文章分类 Service
 * @author LiQingSong
 */
class ArticleCategoryService extends Service {

  /**
   * 根据pId搜索列表
   * @param {number} pId 父id
   */
  async listByPid(pId) {
    const { ctx } = this;
    if (isNaN(pId) || pId < 0) {
      return [];
    }
    return await ctx.model.ArticleCategory.findAll({ where: { pId } });
  }

  /**
   * 插入一条记录
   * @param {category} param0 对应分类字段
   */
  async save({ pid, name, alias, title, keywords, description, hit }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ name, alias, title, keywords, description }, 'save');

    if (pid > 0) {
      const pCategory = await ctx.model.ArticleCategory.findOne({ where: { id: pid } });
      if (!pCategory) {
        ctx.throw('父 ID 数据不存在');
      }
    }

    const record = await ctx.model.ArticleCategory.create({ pId: pid, name, alias, title, keywords, description, hit });
    return record;
  }

  /**
   * 根据 ID 修改 , pid 不修改
   * @param {category} param0 对应分类字段
   */
  async updateById({ id, /* pid, */ name, alias, title, keywords, description, hit }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ id, name, alias, title, keywords, description }, 'update');

    return await ctx.model.ArticleCategory.update({ name, alias, title, keywords, description, hit }, { where: { id } });
  }

  /**
   * 根据 ID 删除
   * @param {number} id 分类id
   */
  async removeById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    const count = await ctx.model.ArticleCategory.count({ where: { pId: id } });
    if (count > 0) {
      ctx.throw('有子元素无法删除，请先删除子元素');
    }

    const aCount = await ctx.model.Article.count({ where: { categoryId: id } });
    if (aCount > 0) {
      ctx.throw('分类下有数据，请先删除分类下数据');
    }

    return await ctx.model.ArticleCategory.destroy({ where: { id } });


  }

  /**
   * 根据pid搜索 返回联动列表
   * @param {number} pId 父id
   */
  async selectCascaderByPid(pId) {
    const { ctx } = this;
    if (isNaN(pId) || pId < 0) {
      return [];
    }

    const list = await ctx.model.ArticleCategory.selectCascaderByPid(pId);

    return list.map(item => {
      item.leaf = item.leaf === 1;
      return item;
    });

  }

  /**
   * 验证
   * @param {category} param0 对应分类字段
   * @param {save|update} type save:插入，update:修改
   */
  async saveUpdateVerify({ id, name, alias, title, keywords, description }, type) {
    const { ctx } = this;

    const rule = {
      name: [
        {
          type: 'string',
          required: true,
          message: '名称不能为空',
        },
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 8 || len < 1) {
              return new Error('名称长度1-8个字');
            }
            return true;
          },
        },
      ],
      alias: [
        {
          type: 'string',
          required: true,
          message: '别名不能为空',
        },
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 10 || len < 1) {
              return new Error('别名1-10个字符');
            }
            return true;
          },
        },
      ],
      title: [
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 30) {
              return new Error('Title最长30个字');
            }
            return true;
          },
        },
      ],
      keywords: [
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 50) {
              return new Error('Keywords最长50个字');
            }
            return true;
          },
        },
      ],
      description: [
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 200) {
              return new Error('Description长度0-200个字');
            }
            return true;
          },
        },
      ],
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { name, alias, title, keywords, description });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    const { Op } = ctx.app.Sequelize;
    const where = {};
    where.alias = {
      [Op.eq]: alias,
    };
    if (type === 'update') {
      where.id = {
        [Op.ne]: id,
      };
    }
    const count = await ctx.model.ArticleCategory.count({ where });
    if (count > 0) {
      ctx.throw('存在相同别名');
    }


    return true;
  }


}

module.exports = ArticleCategoryService;
