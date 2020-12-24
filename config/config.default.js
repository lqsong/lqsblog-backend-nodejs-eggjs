'use strict';

const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_http://liqingsong.cc';

  // cluster
  config.cluster = {
    listen: {
      port: 7001,
      hostname: '127.0.0.1', // 不建议设置 hostname 为 '0.0.0.0'，它将允许来自外部网络和来源的连接，请在知晓风险的情况下使用
      // path: '/var/run/egg.sock',
    },
  };

  // sequelize
  config.sequelize = {
    dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
    host: '127.0.0.1',
    port: '3306',
    database: 'lqsblog',
    tablePre: 'lqs_',
    username: '',
    password: '',
    timezone: '+08:00', // 东八时区
    define: {
      freezeTableName: false, // 当未提供表名时: false, 自动将模型名复数并将其用作表名 |  true,所有表将使用与模型名称相同的名称
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_general_ci',
      },
      timestamps: false,
    },
  };

  // log
  config.logger = {
    // 日志分为 NONE，DEBUG，INFO，WARN 和 ERROR 5 个级别。
    // 默认只会输出 INFO 及以上（WARN 和 ERROR）的日志到文件中。
    level: 'INFO',
    dir: path.join(appInfo.baseDir, 'logs'),
  };

  // add your middleware config here
  config.middleware = [
    'errorHandler',
    'notfoundHandler',
  ];

  /*
  // 只对 /api 前缀的 url 路径生效
  config.errorHandler = {
    match: '/api',
  }
  */

  // security
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: false, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    },
    domainWhiteList: [ 'http://127.0.0.1:8081' ],
  };

  // cors
  config.cors = {
    // {string|Function} origin: '*', // 不设置将以config.security.domainWhiteList为准
    // {string|Array} allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };

  // jwt
  config.jwt = {
    secret: 'lqsblog', // 签名私钥
    expiresIn: 3600, // 签名失效时间 - 秒 3600（1小时）
    restExpiresIn: 1800, // 距离签名失效时间多少内可以重置签名- 秒 1800（0.5小时）
    headerTokenKey: 'lqsblog-token', // Header头 Token 名称
  };

  // multipart
  config.multipart = {
    fileSize: '1mb',
    mode: 'stream',
    /**
     * 自定义允许图片上传的类型
     * 注意：此参数是基于 config.multipart.whitelist 与 config.multipart.fileExtensions 配置的基础上进行的限制。
     */
    imgType: [ 'image/png', 'image/gif', 'image/jpg', 'image/jpeg' ],
    /**
     * 自定义文件上传目录绑定的网址,必须设置，(必须 / 结尾)，如下格式：
     * uploadWeburl: 'http://127.0.0.1:7001/public/uploads/'
     * 注意：如果 config.multipart.uploadDir 为空，此项可设置为 http://当前项目域名/public/uploads/
     *      若 config.multipart.uploadDir 不为空，此项设置自定义上传目录绑定的网址
     */
    uploadWeburl: 'http://127.0.0.1:7001/public/uploads/',
    /**
     * 自定义文件上传的目录(注意必须 / 结尾) 绝对地址（注意Linux和Windows上的目录结构不同）
     * uploadDir: 'E:/uploads/'
     * 注意：如果为空，系统默认上传目录 path.join(ctx.app.config.baseDir, 'app/public/uploads/')
     */
    uploadDir: '',
  };

  // customLoader https://github.com/eggjs/egg-core/blob/master/lib/loader/mixin/custom_loader.js
  config.customLoader = {
    // 定义在 ctx 上的属性名 ctx.utils
    utils: {
      // 相对于 app.config.baseDir
      directory: 'app/utils',
      // 如果是 app 则使用 loadToApp
      inject: 'ctx',
      // 是否加载框架和插件的目录
      loadunit: false,
    },
    // 定义在 app 上的属性名 app.enum
    enum: {
      // 相对于 app.config.baseDir
      directory: 'app/enum',
      // 如果是 ctx 则使用 loadToContext
      inject: 'app',
      // 是否加载框架和插件的目录
      loadunit: false,
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
