'use strict';

const moment = require('moment');

/**
 * 文件 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, DATE } = app.Sequelize;

  const Attachment = app.model.define('Attachment', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    file_old_name: STRING(100),
    file_name: STRING(100),
    file_sub_dir: STRING(25),
    file_type: STRING(100),
    file_size: BIGINT(20),
    file_suffix: STRING(20),
    creator_id: BIGINT(20),
    create_time: {
      type: DATE,
      get() {
        const val = this.getDataValue('create_time');
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  }, {
    tableName: `${tablePre}attachment`,
  });

  return Attachment;
};
