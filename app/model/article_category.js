'use strict';

/**
 * 文章分类 Model
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { tablePre } = app.config.sequelize;
  const { STRING, BIGINT, QueryTypes } = app.Sequelize;

  const ArticleCategory = app.model.define('ArticleCategory', {
    id: { type: BIGINT, primaryKey: true, autoIncrement: true },
    pId: {
      type: BIGINT(20),
      field: 'p_id',
    },
    name: STRING(35),
    alias: STRING(35),
    title: STRING(115),
    keywords: STRING(205),
    description: STRING,
    hit: BIGINT(20),
  }, {
    tableName: `${tablePre}article_category`,
  });

  /**
   * 自定义查询Cascader
   * @param {number} pId 父id
   */
  ArticleCategory.selectCascaderByPid = async pId => {

    return await ArticleCategory.sequelize.query(
      `SELECT  a.id, a.name, ( CASE WHEN (SELECT count(b.id) FROM ${tablePre}article_category b WHERE b.p_id=a.id)>0 THEN false ELSE true END) as leaf
      FROM ${tablePre}article_category a
      WHERE a.p_id = :pid`,
      {
        replacements: { pid: pId },
        type: QueryTypes.SELECT,
      }
    );

  };

  return ArticleCategory;
};
