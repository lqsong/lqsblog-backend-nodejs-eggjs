'use strict';

/**
 * 系统资源权限关联 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {

  const { tablePre } = app.config.sequelize;
  const { BIGINT } = app.Sequelize;

  const ResourcePermission = app.model.define('ResourcePermission', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    resource_id: BIGINT(20),
    permission_id: BIGINT(20),
  }, {
    tableName: `${tablePre}sys_resource_permission`,
  });


  return ResourcePermission;

};
