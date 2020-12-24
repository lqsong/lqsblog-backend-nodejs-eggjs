'use strict';

const moment = require('moment');

/**
 * 标签日志 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, DATE } = app.Sequelize;

  const TagLog = app.model.define('TagLog', {
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
    tag: STRING(50),
    country: STRING(50),
    region: STRING(50),
    city: STRING(50),
    area: STRING(50),
    isp: STRING(50),
  }, {
    tableName: `${tablePre}tag_log`,
  });

  return TagLog;
};
