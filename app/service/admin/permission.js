'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 权限 Service
 * @author LiQingSong
 */
class PermissionService extends Service {

  /**
     * 根据用户id获取权限列表
     * @param {number} userId 用户id
     */
  async listPermissionByUserId(userId) {
    const { ctx } = this;
    if (!userId || isNaN(userId) || userId < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }


    const UserRoleModel = ctx.model.UserRole;
    const RoleResourceModel = ctx.model.RoleResource;
    // 创建关联
    UserRoleModel.belongsTo(RoleResourceModel, { foreignKey: 'role_id', targetKey: 'role_id' });
    const userRoleList = await UserRoleModel.findAll({
      include: [{ model: RoleResourceModel }],
      where: {
        user_id: userId,
      },
    });

    const resourceIds = [];
    for (let index = 0; index < userRoleList.length; index++) {
      const rid = userRoleList[index].RoleResource.resource_id;
      if (!resourceIds.includes(rid)) {
        resourceIds.push(rid);
      }
    }

    const ResourcePermissionModel = ctx.model.ResourcePermission;
    const PermissionModel = ctx.model.Permission;
    // 创建关联
    ResourcePermissionModel.belongsTo(PermissionModel, { foreignKey: 'permission_id', targetKey: 'id' });
    // 获取资源对应的权限列表
    const resourcePermissionList = await ResourcePermissionModel.findAll({
      include: [{ model: PermissionModel, attributes: [ 'permission' ] }],
      where: {
        resource_id: resourceIds,
      },
    });

    const perms = [];
    for (let index = 0; index < resourcePermissionList.length; index++) {
      perms.push(resourcePermissionList[index].Permission.permission);
    }

    return perms;

  }

  /**
   * 根据pId搜索列表
   * @param {*} pid  父id
   */
  async listByPid(pid) {
    const { ctx } = this;
    if (isNaN(pid) || pid < 0) {
      return [];
    }

    return await ctx.model.Permission.findAll({ where: { pid } });

  }

  /**
   * 插入一条记录
   * @param {Permission} param0 对应字段
   */
  async save({ pid, name, permission, description }) {
    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ name, permission });

    if (pid > 0) {
      const pInfo = await ctx.model.Permission.findOne({ where: { id: pid } });
      if (!pInfo) {
        ctx.throw('父 ID 数据不存在');
      }
    }

    const record = await ctx.model.Permission.create({ pid, name, permission, description });
    return record;
  }

  /**
   * 根据 ID 修改 , pid 不修改
   * @param {Permission} param0 对应字段
   */
  async updateById({ id, /*  pid, */ name, permission, description }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ name, permission });

    return await ctx.model.Permission.update({ name, permission, description }, { where: { id } });
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

    const count = await ctx.model.Permission.count({ where: { pid: id } });
    if (count > 0) {
      ctx.throw('有子元素无法删除，请先删除子元素');
    }


    return await ctx.model.Permission.destroy({ where: { id } });
  }


  /**
   * 验证
   * @param {Permission} param0 对应字段
   */
  async saveUpdateVerify({ name, permission }) {
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
      permission: [
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
    const va = await ctx.utils.asyncValidator.validate(rule, { name, permission });
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

    const list = await ctx.model.Permission.selectCascaderByPid(pid);

    return list.map(item => {
      item.leaf = item.leaf === 1;
      return item;
    });
  }

  /**
   * 返回所有列表格式 {id,name,pid}
   */
  async selectIdNamePid() {

    return await this.ctx.model.Permission.findAll({
      attributes: [ 'id', 'name', 'pid' ],
    });

  }

}

module.exports = PermissionService;
