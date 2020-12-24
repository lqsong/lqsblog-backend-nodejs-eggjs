'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 标签 Service
 * @author LiQingSong
 */
class TagService extends Service {

  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'id', 'hit' ];
    const len = sort.length - 1;
    return i > len ? sort[0] : sort[i];
  }

  /**
   * 返回 Sequelize 排序
   * @param {object} param0 {sort = 排序字段下标[id,hit], order = 下标[desc 降序，asc 升序]}
   */
  getSequelizeOrder({ sort, order }) {
    const sortVal = (!sort || isNaN(sort)) ? this.getSort(0) : this.getSort(sort);
    const orderVal = (!order || isNaN(sort) || order === 0) ? 'DESC' : 'ASC';
    return [ sortVal, orderVal ];
  }

  /**
   * 获取分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   * @param {object} param1 { keywords, sort = 排序字段下标[id,hit], order = 下标[desc 降序，asc 升序]} 搜索字段
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

    const { count, rows } = await ctx.model.Tag.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      where,
      order: [
        this.getSequelizeOrder({ sort, order }),
      ],
    });

    return {
      total: count,
      currentPage,
      list: rows,
    };

  }

  /**
   * 插入一条记录
   * @param {Tag} param0 对应字段
   */
  async save({ name, pinyin, hit }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ name, pinyin }, 'save');

    return await ctx.model.Tag.create({ name, pinyin, hit });
  }

  /**
   * 根据 ID 修改
   * @param {Tag} param0 对应字段
   */
  async updateById({ id, name, pinyin, hit }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ id, name, pinyin }, 'update');

    return await ctx.model.Tag.update({ name, pinyin, hit }, { where: { id } });
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

    return await ctx.model.Tag.destroy({ where: { id } });
  }

  /**
   * 验证
   * @param {Tag} param0 对应字段
   * @param {save|update} type save:插入，update:修改
   */
  async saveUpdateVerify({ id, name, pinyin }, type) {
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
            if (len > 10 || len < 1) {
              return new Error('名称长度1-10个字');
            }
            return true;
          },
        },
      ],
      pinyin: [
        {
          type: 'string',
          required: true,
          message: '拼音不能为空',
        },
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 10 || len < 1) {
              return new Error('拼音1-10个字符');
            }
            return true;
          },
        },
      ],
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { name, pinyin });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    const { Op } = ctx.app.Sequelize;
    const where = {};
    where.name = {
      [Op.eq]: name,
    };
    if (type === 'update') {
      where.id = {
        [Op.ne]: id,
      };
    }
    const count = await ctx.model.Tag.count({ where });
    if (count > 0) {
      ctx.throw('存在相同名称');
    }


    return true;
  }


  /**
   * 根据搜索返回列表
   * @param {string} keywords 搜索关键词
   */
  async searchKeywordsLimit(keywords) {
    const { ctx } = this;

    const { Op } = ctx.app.Sequelize;
    let where = {};
    if (keywords && keywords !== '') {
      where = {
        [Op.or]: [
          {
            name: {
              [Op.like]: '%' + keywords + '%',
            },
          },
          {
            pinyin: {
              [Op.like]: '%' + keywords + '%',
            },
          },
        ],
      };
    }

    return await ctx.model.Tag.findAll({
      where,
      limit: 10,
    });

  }

}

module.exports = TagService;
