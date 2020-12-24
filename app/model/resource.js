'use strict';

/**
 * 系统资源（后台菜单、按钮） Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {

  const { tablePre } = app.config.sequelize;
  const { BIGINT, STRING, SMALLINT, QueryTypes } = app.Sequelize;

  const Resource = app.model.define('Resource', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    name: STRING(30),
    urlcode: STRING(100),
    type: SMALLINT(6),
    perms: STRING(255),
    permsLevel: {
      type: STRING(2000),
      field: 'perms_level',
    },
    pid: BIGINT(20),
  }, {
    tableName: `${tablePre}sys_resource`,
  });

  Resource.selectCascaderByPid = async pid => {
    return await Resource.sequelize.query(
      `SELECT  a.id, a.name, ( CASE WHEN (SELECT count(b.id) FROM ${tablePre}sys_resource b WHERE b.pid=a.id)>0 THEN false ELSE true END) as leaf
      FROM ${tablePre}sys_resource a
        WHERE a.pid = :pid`,
      {
        replacements: { pid },
        type: QueryTypes.SELECT,
      }
    );
  };


  return Resource;

};
