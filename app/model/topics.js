'use strict';

const moment = require('moment');

/**
 * 专题 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, DATE, TEXT } = app.Sequelize;

  const Topics = app.model.define('Topics', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    title: STRING(50),
    alias: STRING(60),
    keywords: STRING(205),
    description: STRING,
    content: {
      type: TEXT('long'),
      get() {
        const val = this.getDataValue('content');
        return JSON.parse(val);
      },
      set(value) {
        this.setDataValue('content', JSON.stringify(value));
      },
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
    tableName: `${tablePre}topics`,
  });

  return Topics;
};
