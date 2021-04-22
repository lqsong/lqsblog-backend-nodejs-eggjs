'use strict';

const Service = require('egg').Service;

/**
 * API-Admin 文件附件 Service
 * @author LiQingSong
 */
class AttachmentService extends Service {


  /**
   * 获取图片列表分页信息
   * @param {object} param0 { per = 分页数, page = 页码 }
   */
  async imageListPage({ per = 10, page = 1 }) {
    const { ctx } = this;
    const pageSize = parseInt(per) || 10;
    const currentPage = parseInt(page) || 1;

    const { Op } = ctx.app.Sequelize;
    const where = {};

    const types = ctx.app.config.multipart.imgType;
    where.file_type = {
      [Op.in]: types,
    };

    const { count, rows } = await ctx.model.Attachment.findAndCountAll({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      where,
      order: [
        [ 'id', 'DESC' ],
      ],
    });

    // 设置返回响应
    const response = {
      total: count,
      currentPage,
      list: [],
    };
    const rowsLen = rows.length;
    if (rowsLen < 1) {
      return response;
    }

    // 设置返回数据列表
    const list = [];
    for (let index = 0; index < rowsLen; index++) {
      list.push({
        id: rows[index].id,
        imgurl: ctx.app.config.multipart.uploadWeburl + rows[index].file_sub_dir + '/' + rows[index].file_name,
        size: (rows[index].file_size / 1024).toFixed(2) + 'KB',
      });
    }

    response.list = list;
    return response;

  }


  /**
   * 图片 stream 上传创建
   * @param {stream} stream 文件stream
   * @param {number} contentLength 文件stream 长度 content-length
   * @param {number} userId 用户id
   */
  async imgSaveStream(stream, contentLength, userId) {
    const { ctx } = this;
    let file;
    try {
      file = await ctx.utils.upload.streamCreateFile(stream, ctx.app.config.multipart.imgType);
    } catch (error) {
      throw error;
    }

    await ctx.model.Attachment.create({
      file_old_name: file.originalFileName,
      file_name: file.fileName,
      file_sub_dir: file.subDir,
      file_type: file.type,
      file_suffix: file.suffix,
      file_size: contentLength, // contentLength/1024 + "KB"
      creator_id: userId,
      create_time: new Date(),
    });

    // 设置返回响应
    const response = {
      title: file.fileName,
      url: ctx.app.config.multipart.uploadWeburl + file.subDir + '/' + file.fileName,
    };
    return response;


  }

  /**
   * 获取图片详情
   * @param {number} id 数据库id
   */
  async getImgStreamById(id) {
    const { ctx } = this;

    const { Op } = ctx.app.Sequelize;
    const where = {};

    const types = ctx.app.config.multipart.imgType;
    where.file_type = {
      [Op.in]: types,
    };

    where.id = {
      [Op.eq]: id,
    };
    const file = await ctx.model.Attachment.findOne({
      where,
    });
    if (!file) {
      ctx.throw('数据不存在');
    }

    const stream = ctx.utils.upload.streamReadFile(file.file_sub_dir, file.file_name);

    return {
      file_name: file.file_name,
      file_stream: stream,
    };

  }


}

module.exports = AttachmentService;
