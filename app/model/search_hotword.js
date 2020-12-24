'use strict';

/**
 * 搜索热词 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT } = app.Sequelize;

  const SearchHotword = app.model.define('SearchHotword', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    name: STRING(35),
    hit: BIGINT,
  }, {
    tableName: `${tablePre}search_hotword`,
  });

  return SearchHotword;
};
