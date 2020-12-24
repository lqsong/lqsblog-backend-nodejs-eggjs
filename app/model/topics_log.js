'use strict';

const moment = require('moment');

/**
 * 专题日志 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, DATE } = app.Sequelize;

  const TopicsLog = app.model.define('TopicsLog', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    ip: STRING(20),
    createTime: {
      type: DATE,
      field: 'create_time',
      get() {
        const val = this.getDataValue('create_time');
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    tid: BIGINT,
    topics: STRING(50),
    country: STRING(50),
    region: STRING(50),
    city: STRING(50),
    area: STRING(50),
    isp: STRING(50),
  }, {
    tableName: `${tablePre}topics_log`,
  });

  return TopicsLog;
};
