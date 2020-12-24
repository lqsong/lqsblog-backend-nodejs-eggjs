'use strict';

/** @type Egg.EggPlugin */
/*
module.exports = {
  // static: {
  //   enable: true,
  // },
};
*/

// static
exports.static = {
  enable: true,
};

// router
exports.routerPlus = {
  enable: true,
  package: 'egg-router-plus',
};

// sequelize
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};

// jwt
exports.jwt = {
  enable: true,
  package: 'egg-jwt',
};

// cors
exports.cors = {
  enable: true,
  package: 'egg-cors',
};
