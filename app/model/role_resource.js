'use strict';

/**
 * 系统角色资源关联 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {

  const { tablePre } = app.config.sequelize;
  const { BIGINT } = app.Sequelize;

  const RoleResource = app.model.define('RoleResource', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    role_id: BIGINT(20),
    resource_id: BIGINT(20),
  }, {
    tableName: `${tablePre}sys_role_resource`,
  });


  return RoleResource;

};
