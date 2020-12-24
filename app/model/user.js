'use strict';

/**
 * 系统用户 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {

  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT } = app.Sequelize;

  const User = app.model.define('User', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    username: STRING(50),
    password: STRING(50),
    salt: STRING(50),
    nickname: STRING(20),
    locked: BIGINT(1),
  }, {
    tableName: `${tablePre}sys_user`,
  });

  /**
   * 根据用户名获取数据
   * @param {string} username 用户名
   */
  User.selectByUserName = async username => {
    return await User.findOne({ where: { username } });
  };

  return User;

};
