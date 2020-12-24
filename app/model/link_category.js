'use strict';

/**
 * 左邻右舍分类 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, SMALLINT } = app.Sequelize;

  const LinkCategory = app.model.define('LinkCategory', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    name: STRING(35),
    alias: STRING(35),
    sort: SMALLINT(6),
  }, {
    tableName: `${tablePre}link_category`,
  });


  return LinkCategory;
};
