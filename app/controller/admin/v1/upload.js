'use strict';
const BaseController = require('../base');

/**
 * API-Admin 上传控制器
 * @author LiQingSong
 */
class UploadController extends BaseController {

  /**
   * 图片列表
   */
  async imagesList() {
    const { ctx } = this;
    const list = await ctx.service.admin.attachment.imageListPage(this.getPerPage());
    ctx.utils.bodyResult.success({ data: list, token: this.newToken });
  }

  /**
   * 图片上传
   */
  async imagesCreate() {
    const { ctx } = this;
    try {
      const contentLength = ctx.request.header['content-length'];
      const stream = await ctx.getFileStream();
      const file = await ctx.service.admin.attachment.imgSaveStream(stream, contentLength, this.currentUser.id);
      ctx.utils.bodyResult.success({ data: file, token: this.newToken });
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }
  }

  /**
   * 图片下载
   */
  async imagesDown() {
    const { ctx } = this;
    try {
      const file = await ctx.service.admin.attachment.getImgStreamById(ctx.params.id);
      ctx.attachment(file.file_name);
      ctx.set('Content-Type', 'application/octet-stream');
      ctx.body = file.file_stream;
    } catch (error) {
      ctx.utils.bodyResult.error({ msg: error.message });
    }

  }


}

module.exports = UploadController;
