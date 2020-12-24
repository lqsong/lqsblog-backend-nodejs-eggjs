'use strict';

/**
 * 标签 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT } = app.Sequelize;

  const Tag = app.model.define('Tag', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    name: STRING(35),
    pinyin: STRING(65),
    hit: BIGINT,
  }, {
    tableName: `${tablePre}tag`,
  });

  return Tag;
};
