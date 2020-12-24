'use strict';

/**
 * result code enum
 * @author LiQingSong
 */

exports.NOT_FOUND = {
  code: 404,
  msg: '资源不存在',
};

exports.SUCCESS = {
  code: 0,
  msg: '操作成功',
};

// ---系统错误返回码-----
exports.FAIL = {
  code: 10001,
  msg: '操作失败',
};

exports.UNAUTHENTICATED = {
  code: 10002,
  msg: '当前用户登录信息无效,请重新登录!',
};

exports.UNAUTHORISE = {
  code: 10003,
  msg: '权限不足',
};

exports.ACCOUNT_LOCKOUT = {
  code: 10004,
  msg: '账号锁定',
};

exports.INCORRECT_PARAMETER = {
  code: 10005,
  msg: '参数不正确',
};

exports.VERIFICATION_FAILED = {
  code: 10006,
  msg: '验证不通过',
};


// ---服务器错误返回码-----
exports.SERVER_ERROR = {
  code: 99999,
  msg: '抱歉，系统繁忙，请稍后重试',
};
