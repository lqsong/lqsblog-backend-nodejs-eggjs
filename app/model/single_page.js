'use strict';

/**
 * 单页面 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, TEXT } = app.Sequelize;

  const SinglePage = app.model.define('SinglePage', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    name: STRING(50),
    alias: STRING(50),
    title: STRING(155),
    keywords: STRING(205),
    description: STRING,
    content: TEXT('long'),
    hit: BIGINT,
  }, {
    tableName: `${tablePre}single_page`,
  });

  return SinglePage;
};
