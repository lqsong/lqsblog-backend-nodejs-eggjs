'use strict';

/**
 * 站点配置 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT } = app.Sequelize;

  const Config = app.model.define('Config', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    name: STRING(50),
    title: STRING(50),
    content: STRING,
  }, {
    tableName: `${tablePre}config`,
  });

  return Config;
};
