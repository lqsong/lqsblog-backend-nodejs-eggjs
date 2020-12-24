'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 系统用户 Service
 * @author LiQingSong
 */
class UserService extends Service {


  /**
   * 用户登录
   * @param {object} param0 { username, password }
   */
  async loginUser({ username, password }) {
    const { ctx } = this;
    const rule = {
      username: [
        {
          type: 'string',
          required: true,
          message: '用户名不能为空',
        },
      ],
      password: {
        type: 'string',
        required: true,
        message: '密码不能为空',
      },
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { username, password });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    const user = await ctx.model.User.selectByUserName(username);
    if (!user) {
      ctx.throw('用户名不存在');
    }

    const passwordMd5 = this.passWordSimpleHash(password, user.salt);
    if (passwordMd5 !== user.password) {
      ctx.throw('密码错误');
    }

    delete user.dataValues.salt;
    delete user.dataValues.password;

    return user;
  }

  /**
   * 用户信息包括角色权限等
   * @param {object} param0 user {id, nickname}
   */
  async userInfo({ id, nickname }) {
    const { ctx } = this;

    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    const { Op } = ctx.app.Sequelize;

    const UserRoleModel = ctx.model.UserRole;
    const RoleModel = ctx.model.Role;
    // 创建关联
    UserRoleModel.belongsTo(RoleModel, { foreignKey: 'role_id', targetKey: 'id' });
    // 获取用户角色列表
    const userRoleList = await UserRoleModel.findAll({
      include: [{ model: RoleModel, attributes: [ 'name' ] }],
      where: {
        user_id: id,
      },
    });

    const roleIds = [];
    const roles = [];
    for (let index = 0; index < userRoleList.length; index++) {
      roleIds.push(userRoleList[index].role_id);
      roles.push(userRoleList[index].Role.name);
    }

    const resources = [];
    if (roleIds.length > 0) {
      const RoleResourceModel = ctx.model.RoleResource;
      const ResourceModel = ctx.model.Resource;
      // 创建关联
      RoleResourceModel.belongsTo(ResourceModel, { foreignKey: 'resource_id', targetKey: 'id' });
      // 获取用户资源列表
      const userResourceList = await RoleResourceModel.findAll({
        include: [{ model: ResourceModel, attributes: [ 'name', 'urlcode' ] }],
        where: {
          role_id: {
            [Op.in]: roleIds,
          },
        },
      });

      for (let index = 0; index < userResourceList.length; index++) {
        resources.push(userResourceList[index].Resource.urlcode);
      }
    }


    return {
      name: nickname,
      avatar: '',
      resources,
      roles,
      msgtotal: 0,
    };

  }

  /**
   * 随机盐
   */
  saltRandom() {
    return this.ctx.utils.md5Hash.saltRandom(4);
  }

  /**
   * 密码二进制md5加密3次
   * @param {string} password 密码
   * @param {string} salt 盐
   */
  passWordSimpleHash(password, salt) {
    return this.ctx.utils.md5Hash.simpleHash(password, salt, 3);
  }


  /**
   * 获取排序字段
   * @param {number} i 下标
   */
  getSort(i) {
    const sort = [ 'id' ];
    const len = sort.length - 1;
    return i > len ? sort[0] : sort[i];
  }

  /**
   * 返回 Sequelize 排序
   * @param {object} param0 {sort = 排序字段下标[id], order = 下标[desc 降序，asc 升序]}
   */
  getSequelizeOrder({ sort, order }) {
    const sortVal = (!sort || isNaN(sort)) ? this.getSort(0) : this.getSort(sort);
    const orderVal = (!order || isNaN(sort) || order === 0) ? 'DESC' : 'ASC';
    return [ sortVal, orderVal ];
  }


  /**
   * 获取用户分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   * @param {object} param1 { keywords, , sort = 排序字段下标[id], order = 下标[desc 降序，asc 升序]} 搜索字段
   */
  async userPage({ per = 10, page = 1 }, { keywords, sort, order }) {
    const { ctx } = this;
    const pageSize = parseInt(per) || 10;
    const currentPage = parseInt(page) || 1;

    const { Op } = ctx.app.Sequelize;
    let where = {};
    if (keywords && keywords !== '') {
      where = {
        [Op.or]: {
          username: {
            [Op.like]: '%' + keywords + '%',
          },
          nickname: {
            [Op.like]: '%' + keywords + '%',
          },
        },

      };
    }

    const { count, rows } = await ctx.model.User.findAndCountAll({
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

    // 取出user_id
    const userIds = [];
    for (let index = 0; index < rowsLen; index++) {
      userIds.push(rows[index].id);
    }

    // 设置用户对应角色
    const userRoleMap = {};
    const UserRoleModel = ctx.model.UserRole;
    const RoleModel = ctx.model.Role;
    // 创建关联
    UserRoleModel.belongsTo(RoleModel, { foreignKey: 'role_id', targetKey: 'id' });
    // 获取用户角色列表
    const userRoleList = await UserRoleModel.findAll({
      include: [
        {
          model: RoleModel,
          attributes: [ 'name' ],
        },
      ],
      where: {
        user_id: userIds,
      },
    });
    const userRoleListLen = userRoleList.length;
    for (let index = 0; index < userRoleListLen; index++) {
      const userId = userRoleList[index].user_id;
      const listvo = userRoleMap[userId] || [];
      listvo.push({
        id: userRoleList[index].role_id,
        name: userRoleList[index].Role.name,
      });

      userRoleMap[userId] = listvo;

    }

    // 设置返回数据列表
    const list = [];
    for (let index = 0; index < rowsLen; index++) {
      list.push({
        id: rows[index].id,
        username: rows[index].username,
        nickname: rows[index].nickname,
        locked: rows[index].locked,
        roles: userRoleMap[rows[index].id] || [],
      });
    }

    response.list = list;
    return response;


  }


  /**
   * 插入一条记录
   * @param {User} param0 对应字段 roles：角色id 数组
   */
  async save({ username, password, nickname, roles = [] }) {

    const { ctx } = this;

    // 验证
    await this.saveUpdateVerify({ username, password }, 'save');

    const salt = this.saltRandom();
    const passwordMD5 = this.passWordSimpleHash(password, salt);

    // 创建事务
    const t = await ctx.model.transaction();
    let record;
    try {
      record = await ctx.model.User.create({ username, password: passwordMD5, salt, nickname }, { transaction: t });

      // 修改角色资源关联表
      await this.saveBatchUserRole({ id: record.id, roles }, t);

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
   * @param {User} param0 对应字段 roles：角色id 数组
   */
  async updateById({ id, username, password, nickname, roles = [] }) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    // 验证
    await this.saveUpdateVerify({ username, password }, 'update');
    // 创建事务
    const t = await ctx.model.transaction();
    try {
      // const record = arguments[0];

      const update = { username, nickname };
      if (password && password !== '') {
        const salt = this.saltRandom();
        const passwordMD5 = this.passWordSimpleHash(password, salt);
        update.salt = salt;
        update.password = passwordMD5;
      }

      await ctx.model.User.update(update, {
        where: { id },
        transaction: t,
      });

      // 修改角色资源关联表
      await this.saveBatchUserRole({ id, roles }, t);


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

      response = await ctx.model.User.destroy({
        where: { id },
        transaction: t,
      });

      await ctx.model.UserRole.destroy({ where: { user_id: id }, transaction: t });

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
   * 批量修改用户角色关联表
   * @param {{id, roles}} param0 {用户id, 角色id数组}
   * @param {transaction} t 事务
   */
  async saveBatchUserRole({ id, roles = [] }, t) {
    const { ctx } = this;
    if (!id || !roles) {
      ctx.throw('参数出错');
    }

    // 先清空同用户ID下 user role数据
    await ctx.model.UserRole.destroy({ where: { user_id: id }, transaction: t });
    // 再批量添加
    const rolesLen = roles.length;
    if (rolesLen > 0) {
      const urlist = [];
      for (let index = 0; index < rolesLen; index++) {
        const element = roles[index];
        urlist.push({
          user_id: id,
          role_id: element,
        });
      }
      return await ctx.model.UserRole.bulkCreate(urlist, { transaction: t });
    }

  }

  /**
   * 验证
   * @param {User} param0 对应字段
   * @param {save|update} type save:插入，update:修改
   */
  async saveUpdateVerify({ username, password }, type) {
    const { ctx } = this;

    const rule = {
      username: [
        {
          type: 'string',
          required: true,
          message: '用户名不能为空',
        },
        {
          validator: (rule, value) => {
            const len = value.length;
            if (len > 30 || len < 6) {
              return new Error('用户名6-30个字符');
            }
            return true;
          },
        },
      ],
      password: [
        {
          validator: (rule, value) => {
            if (type === 'save' || value !== '') {
              const len = value.length;
              if (len > 15 || len < 6) {
                return new Error('密码6-15个字符');
              }
            }
            return true;
          },
        },
      ],
    };
    const va = await ctx.utils.asyncValidator.validate(rule, { username, password });
    if (va && va.errors) {
      ctx.throw({ message: 'validator error', errors: va.errors });
    }

    return true;
  }

  /**
   * 根据 ID 获取 详情
   * @param {number} id id
   */
  async getUserById(id) {
    const { ctx } = this;
    if (!id || isNaN(id) || id < 1) {
      ctx.throw(ctx.app.enum.resultCode.INCORRECT_PARAMETER.msg);
    }

    const info = await ctx.model.User.findOne({ where: { id } });
    if (!info) {
      ctx.throw(ctx.app.enum.resultCode.NOT_FOUND.msg);
    }


    const UserRoleModel = ctx.model.UserRole;
    const RoleModel = ctx.model.Role;
    // 创建关联
    UserRoleModel.belongsTo(RoleModel, { foreignKey: 'role_id', targetKey: 'id' });
    // 获取用户角色列表
    const userRoleList = await UserRoleModel.findAll({
      include: [
        {
          model: RoleModel,
          attributes: [ 'name' ],
        },
      ],
      where: {
        user_id: info.id,
      },
    });
    const roles = [];
    const userRoleListLen = userRoleList.length;
    for (let index = 0; index < userRoleListLen; index++) {
      roles.push({
        id: userRoleList[index].role_id,
        name: userRoleList[index].Role.name,
      });
    }


    return {
      id: info.id,
      locked: info.locked,
      nickname: info.nickname,
      username: info.username,
      roles,
    };


  }

}

module.exports = UserService;
