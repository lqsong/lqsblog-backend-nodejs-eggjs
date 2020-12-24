'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 资源 Service
 * @author LiQingSong
 */
class ResourceService extends Service {

  /**
   * 根据pId搜索列表
   * @param {*} pid  父id
   */
  async listByPid(pid) {
    const { ctx } = this;
    if (isNaN(pid) || pid < 0) {
      return [];
    }

    return await ctx.model.Resource.findAll({ where: { pid } });
  }

  /**
   * 插入一条记录
   * @param {Resource} param0 对应字段
   */
  async save({ pid, name, urlcode, type, perms, permsLevel }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ name, urlcode });

    if (pid > 0) {
      const pInfo = await ctx.model.Resource.findOne({ where: { id: pid } });
      if (!pInfo) {
        ctx.throw('父 ID 数据不存在');
      }
    }

    const record = await ctx.model.Resource.create({ pid, name, urlcode, type, perms, permsLevel });
    return record;
  }

  /**
   * 根据 ID 修改 , pid 不修改
   * @param {Resource} param0 对应字段
   */
  async updateById({ id, /* pid, */ name, urlcode, type, perms, permsLevel }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ name, urlcode });

    return await ctx.model.Resource.update({ name, urlcode, type, perms, permsLevel }, { where: { id } });
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

    const count = await ctx.model.Resource.count({ where: { pid: id } });
    if (count > 0) {
      ctx.throw('有子元素无法删除，请先删除子元素');
    }


    return await ctx.model.Resource.destroy({ where: { id } });
  }

  /**
   * 验证
   * @param {Resource} param0 对应字段
   */
  async saveUpdateVerify({ name, urlcode }) {
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
      urlcode: [
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 100) {
              return new Error('权限编号最长100个字');
            }
            return true;
          },
        },
      ],
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { name, urlcode });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    return true;
  }


  /**
   * 根据pid搜索 返回联动列表
   * @param {number} pid 父id
   */
  async selectCascader(pid) {
    const { ctx } = this;
    if (isNaN(pid) || pid < 0) {
      return [];
    }

    const list = await ctx.model.Resource.selectCascaderByPid(pid);

    return list.map(item => {
      item.leaf = item.leaf === 1;
      return item;
    });
  }

  /**
   * 返回所有列表格式 {id,name,pid}
   */
  async selectIdNamePid() {
    return await this.ctx.model.Resource.findAll({
      attributes: [ 'id', 'name', 'pid' ],
    });
  }


}

module.exports = ResourceService;
