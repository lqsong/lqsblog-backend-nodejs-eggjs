'use strict';

const moment = require('moment');

/**
 * 作品 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, DATE, TEXT } = app.Sequelize;

  const Works = app.model.define('Works', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    title: STRING(155),
    keywords: STRING(205),
    description: STRING,
    thumb: STRING(2000),
    content: TEXT('long'),
    tag: STRING,
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
    tableName: `${tablePre}works`,
  });

  return Works;
};
