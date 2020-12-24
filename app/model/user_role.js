'use strict';

/**
 * 系统用户角色关系 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {

  const { tablePre } = app.config.sequelize;
  const { BIGINT } = app.Sequelize;

  const UserRole = app.model.define('UserRole', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    user_id: BIGINT(20),
    role_id: BIGINT(20),
  }, {
    tableName: `${tablePre}sys_user_role`,
  });


  return UserRole;

};
