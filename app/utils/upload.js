'use strict';
const crypto = require('crypto');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const pump = require('mz-modules/pump');
const sendToWormhole = require('stream-wormhole');

/**
 * Upload Utils
 * @author LiQingSong
 */
class Upload {

  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 基于stream 单文件上传
   * @param {stream} stream 文件stream
   * @param {Array} type 运行文件上传的类型 如图片[ 'image/png', 'image/gif', 'image/jpg', 'image/jpeg' ]
   */
  async streamCreateFile(stream, type) {

    // 获取文件类型
    const mimeType = stream.mimeType;
    if (!type.includes(mimeType)) {
      throw new Error('文件上传类型要求：' + type.join(','));
    }

    // 获取原文件名
    const originalFileName = stream.filename;
    // 获取文件后缀名
    const suffixName = path.extname(originalFileName).toLowerCase();
    // 重新生成文件名
    const newFileName = crypto.randomBytes(16).toString('hex') + suffixName;
    // 文件子目录
    const subdirectory = moment().format('YYYYMMDD');
    // 文件本地存储位置
    const fileStorageLocation = path.join(this.getFileStorageLocation(), subdirectory);
    // 创建目录
    this.mkdirsSync(fileStorageLocation);
    // 生成写入路径
    const target = path.join(fileStorageLocation, newFileName);
    // 写入
    try {
      const writeStream = fs.createWriteStream(target);
      await pump(stream, writeStream);
    } catch (err) {
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      await sendToWormhole(stream);
      throw err;
    }

    return {
      type: mimeType,
      suffix: suffixName,
      originalFileName,
      fileName: newFileName,
      subDir: subdirectory,
    };

  }

  /**
   * stream 读取文件
   * @param {string} subDir 子目录
   * @param {string} fileName 文件名
   */
  streamReadFile(subDir, fileName) {
    const filePath = this.getFilePath(subDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error('文件不存在');
    }
    return fs.createReadStream(filePath);
  }

  /**
   * 获取文件决定路径
   * @param {string} subDir 子目录
   * @param {string} fileName 文件名
   */
  getFilePath(subDir, fileName) {
    return path.join(this.getFileStorageLocation(), subDir, fileName);
  }

  /**
   * 获取文件在本地存储的地址
   */
  getFileStorageLocation() {
    const { ctx } = this;
    return ctx.app.config.multipart.uploadDir !== '' ? ctx.app.config.multipart.uploadDir : path.join(ctx.app.config.baseDir, 'app/public/uploads/');
  }

  /**
   * 递归同步生成目录
   * @param {string} dirname 绝对地址
   */
  mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    }
    if (this.mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }

  }


}

module.exports = Upload;
