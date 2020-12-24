'use strict';

/**
 * 系统api服务权限 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {

  const { tablePre } = app.config.sequelize;
  const { BIGINT, STRING, QueryTypes } = app.Sequelize;

  const Permission = app.model.define('Permission', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    name: STRING(30),
    permission: STRING(100),
    description: STRING(50),
    pid: BIGINT(20),
  }, {
    tableName: `${tablePre}sys_permission`,
  });

  Permission.selectCascaderByPid = async pid => {
    return await Permission.sequelize.query(
      `SELECT  a.id, a.name, ( CASE WHEN (SELECT count(b.id) FROM ${tablePre}sys_permission b WHERE b.pid=a.id)>0 THEN false ELSE true END) as leaf
      FROM ${tablePre}sys_permission a
        WHERE a.pid = :pid`,
      {
        replacements: { pid },
        type: QueryTypes.SELECT,
      }
    );
  };


  return Permission;

};
