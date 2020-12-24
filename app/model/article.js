'use strict';

const moment = require('moment');

/**
 * 文章 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, DATE, TEXT } = app.Sequelize;

  const Article = app.model.define('Article', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    categoryId: {
      type: BIGINT,
      field: 'category_id',
    },
    categoryIds: {
      type: STRING(205),
      field: 'category_ids',
    },
    title: STRING(105),
    keywords: STRING(205),
    description: STRING,
    thumb: STRING(2000),
    content: TEXT('long'),
    tag: STRING,
    interestIds: {
      type: STRING(205),
      field: 'interest_ids',
    },
    addtime: {
      type: DATE,
      get() {
        const val = this.getDataValue('addtime');
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    hit: BIGINT,
    creatorId: {
      type: BIGINT,
      field: 'creator_id',
    },
    createTime: {
      type: DATE,
      field: 'create_time',
      get() {
        const val = this.getDataValue('create_time');
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  }, {
    tableName: `${tablePre}article`,
  });

  return Article;
};
