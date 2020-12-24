'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 左邻右舍 Service
 * @author LiQingSong
 */
class LinkCategoryService extends Service {

  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'id', 'sort' ];
    const len = sort.length - 1;
    return i > len ? sort[0] : sort[i];
  }

  /**
   * 返回 Sequelize 排序
   * @param {object} param0 {sort = 排序字段下标[id,hit,addtime], order = 下标[desc 降序，asc 升序]}
   */
  getSequelizeOrder({ sort, order }) {
    const sortVal = (!sort || isNaN(sort)) ? this.getSort(0) : this.getSort(sort);
    const orderVal = (!order || isNaN(sort) || order === 0) ? 'DESC' : 'ASC';
    return [ sortVal, orderVal ];
  }

  /**
   * 获取列表信息
   * @param {number} sort 排序字段下标[id,hit]
   * @param {number} order 下标[desc 降序，asc 升序]
   */
  async list(sort, order) {

    const { ctx } = this;

    return await ctx.model.LinkCategory.findAll({
      order: [
        this.getSequelizeOrder({ sort, order }),
      ],
    });
  }

  /**
   * 插入一条记录
   * @param {LinkCategory} param0 对应字段
   */
  async save({ name, alias, sort }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ name, alias }, 'save');

    return await ctx.model.LinkCategory.create({ name, alias, sort });
  }

  /**
   * 根据 ID 修改
   * @param {LinkCategory} param0 对应字段
   */
  async updateById({ id, name, alias, sort }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ id, name, alias }, 'update');

    return await ctx.model.LinkCategory.update({ name, alias, sort }, { where: { id } });
  }

  /**
   * 根据 ID 删除
   * @param {number} id id
   */
  async removeById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }


    const aCount = await ctx.model.Link.count({ where: { categoryId: id } });
    if (aCount > 0) {
      ctx.throw('分类下有数据，请先删除分类下数据');
    }

    return await ctx.model.LinkCategory.destroy({ where: { id } });
  }


  /**
   * 验证
   * @param {LinkCategory} param0 对应字段
   * @param {save|update} type save:插入，update:修改
   */
  async saveUpdateVerify({ id, name, alias }, type) {

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
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { name, alias });
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
    const count = await ctx.model.LinkCategory.count({ where });
    if (count > 0) {
      ctx.throw('存在相同别名');
    }


    return true;

  }

}

module.exports = LinkCategoryService;
