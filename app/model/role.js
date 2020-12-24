'use strict';

/**
 * 系统用户角色 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {

  const { tablePre } = app.config.sequelize;
  const { BIGINT, STRING } = app.Sequelize;

  const Role = app.model.define('Role', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    name: STRING(30),
    description: STRING(100),
    resources: STRING(255),
    resourcesLevel: {
      type: STRING(2000),
      field: 'resources_level',
    },
  }, {
    tableName: `${tablePre}sys_role`,
  });


  return Role;

};
