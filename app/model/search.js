'use strict';

const moment = require('moment');

/**
 * 搜索 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, DATE, TEXT, SMALLINT, UUID, UUIDV4 } = app.Sequelize;

  const Search = app.model.define('Search', {
    sid: {
      type: UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    id: BIGINT(20),
    type: SMALLINT,
    categoryId: {
      type: BIGINT,
      field: 'category_id',
    },
    title: STRING(155),
    keywords: STRING(205),
    description: STRING,
    thumb: STRING(2000),
    tag: STRING,
    addtime: {
      type: DATE,
      get() {
        const val = this.getDataValue('addtime');
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    keyPrecise: {
      type: TEXT,
      field: 'key_precise',
    },
  }, {
    tableName: `${tablePre}search`,
  });

  return Search;
};
