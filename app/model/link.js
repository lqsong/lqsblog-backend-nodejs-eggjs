'use strict';

const moment = require('moment');

/**
 * 左邻右舍 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, DATE } = app.Sequelize;

  const Link = app.model.define('Link', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    categoryId: {
      type: BIGINT,
      field: 'category_id',
    },
    title: STRING(100),
    description: STRING,
    logo: STRING,
    href: STRING,
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
    tableName: `${tablePre}link`,
  });

  return Link;
};
