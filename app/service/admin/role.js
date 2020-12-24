'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 角色 Service
 * @author LiQingSong
 */
class RoleService extends Service {

  /**
   * 读取所有列表
   */
  async listAll() {
    return this.ctx.model.Role.findAll();
  }

  /**
   * 插入一条记录
   * @param {Role} param0 对应字段
   */
  async save({ name, description, resources, resourcesLevel }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ name });
    // 创建事务
    const t = await ctx.model.transaction();
    let record;
    try {
      record = await ctx.model.Role.create({ name, description, resources, resourcesLevel }, { transaction: t });

      // 修改角色资源关联表
      await this.saveBatchRoleResource(record, t);

      // 提交事务
      await t.commit();

    } catch (error) {

      // 回滚事务
      await t.rollback();

      throw error;

    }


    return record;
  }

  /**
   * 根据 ID 修改
   * @param {Role} param0 对应字段
   */
  async updateById({ id, name, description, resources, resourcesLevel }) {

    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ name });
    // 创建事务
    const t = await ctx.model.transaction();
    try {
      const record = arguments[0];

      await ctx.model.Role.update({ name, description, resources, resourcesLevel }, {
        where: { id },
        transaction: t,
      });

      // 修改角色资源关联表
      await this.saveBatchRoleResource(record, t);


      // 提交事务
      await t.commit();


    } catch (error) {

      // 回滚事务
      await t.rollback();

      throw error;

    }


    return true;

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

    // 创建事务
    const t = await ctx.model.transaction();
    // 返回删除记录行数
    let response = 0;
    try {

      response = await ctx.model.Role.destroy({
        where: { id },
        transaction: t,
      });

      await ctx.model.RoleResource.destroy({ where: { role_id: id }, transaction: t });

      // 提交事务
      await t.commit();

    } catch (error) {
      // 回滚事务
      await t.rollback();

      throw error;

    }

    return response;


  }

  /**
   * 验证
   * @param {Role} param0 对应字段
   */
  async saveUpdateVerify({ name }) {
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
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { name });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    return true;
  }

  /**
   * 批量修改角色资源关联表
   * @param {Role} record 角色字段
   * @param {transaction} t 事务
   */
  async saveBatchRoleResource(record, t) {
    const { ctx } = this;
    if (!record || !record.id) {
      ctx.throw('角色数据为空');
    }

    // 先清空同角色ID下role resource数据
    await ctx.model.RoleResource.destroy({ where: { role_id: record.id }, transaction: t });
    // 再批量添加
    if (record && record.resources) {
      const resourcesArr = record.resources.split(',');
      const rrlist = [];
      const resourcesArrLen = resourcesArr.length;
      for (let index = 0; index < resourcesArrLen; index++) {
        const element = resourcesArr[index];
        rrlist.push({
          role_id: record.id,
          resource_id: element,
        });
      }

      if (rrlist.length > 0) {
        return await ctx.model.RoleResource.bulkCreate(rrlist, { transaction: t });
      }
    }
  }


}

module.exports = RoleService;
