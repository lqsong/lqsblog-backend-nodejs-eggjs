'use strict';

/**
 * 站点路由
 * @param {Egg.Application} app - egg application
 * @author LiQingSong
 */
module.exports = app => {
  const { router, controller } = app;

  // Admin路由
  // const adminJwtToken = app.middleware.adminJwtToken();
  const adminv1Router = router.namespace('/admin/v1');
  adminv1Router.get('/guest/validateCodeImg', controller.admin.v1.guest.validateCodeImg);
  adminv1Router.post('/user/login', controller.admin.v1.login.index);
  adminv1Router.get('/user/info', controller.admin.v1.user.info);
  adminv1Router.post('/user/logout', controller.admin.v1.user.logout);

  adminv1Router.get('/articles', controller.admin.v1.article.articleList);
  adminv1Router.post('/articles', controller.admin.v1.article.articleCreate);
  adminv1Router.put('/articles/:id', controller.admin.v1.article.articleUpdate);
  adminv1Router.del('/articles/:id', controller.admin.v1.article.articleDelete);
  adminv1Router.get('/articles/:id', controller.admin.v1.article.articleRead);
  adminv1Router.get('/article/categorys', controller.admin.v1.article.categoryList);
  adminv1Router.post('/article/categorys', controller.admin.v1.article.categoryCreate);
  adminv1Router.put('/article/categorys/:id', controller.admin.v1.article.categoryUpdate);
  adminv1Router.del('/article/categorys/:id', controller.admin.v1.article.categoryDelete);
  adminv1Router.get('/article/categorys/cascader', controller.admin.v1.article.categoryCascader);

  adminv1Router.get('/works', controller.admin.v1.works.worksList);
  adminv1Router.post('/works', controller.admin.v1.works.worksCreate);
  adminv1Router.put('/works/:id', controller.admin.v1.works.worksUpdate);
  adminv1Router.del('/works/:id', controller.admin.v1.works.worksDelete);
  adminv1Router.get('/works/:id', controller.admin.v1.works.worksRead);

  adminv1Router.get('/topics', controller.admin.v1.topics.topicsList);
  adminv1Router.post('/topics', controller.admin.v1.topics.topicsCreate);
  adminv1Router.put('/topics/:id', controller.admin.v1.topics.topicsUpdate);
  adminv1Router.del('/topics/:id', controller.admin.v1.topics.topicsDelete);
  adminv1Router.get('/topics/:id', controller.admin.v1.topics.topicsRead);

  adminv1Router.get('/links', controller.admin.v1.link.linkList);
  adminv1Router.post('/links', controller.admin.v1.link.linkCreate);
  adminv1Router.put('/links/:id', controller.admin.v1.link.linkUpdate);
  adminv1Router.del('/links/:id', controller.admin.v1.link.linkDelete);
  adminv1Router.get('/links/:id', controller.admin.v1.link.linkRead);
  adminv1Router.get('/link/categorys', controller.admin.v1.link.categoryList);
  adminv1Router.post('/link/categorys', controller.admin.v1.link.categoryCreate);
  adminv1Router.put('/link/categorys/:id', controller.admin.v1.link.categoryUpdate);
  adminv1Router.del('/link/categorys/:id', controller.admin.v1.link.categoryDelete);

  adminv1Router.get('/tags', controller.admin.v1.tag.tagsList);
  adminv1Router.post('/tags', controller.admin.v1.tag.tagsCreate);
  adminv1Router.put('/tags/:id', controller.admin.v1.tag.tagsUpdate);
  adminv1Router.del('/tags/:id', controller.admin.v1.tag.tagsDelete);
  adminv1Router.get('/tags/search', controller.admin.v1.tag.tagsSearch);

  adminv1Router.get('/searchs', controller.admin.v1.search.searchList);
  adminv1Router.get('/searchs/keywords', controller.admin.v1.search.keywordsList);

  adminv1Router.get('/stats/articles/dailynew', controller.admin.v1.stats.articlesDailyNew);
  adminv1Router.get('/stats/works/weeknew', controller.admin.v1.stats.worksWeekNew);
  adminv1Router.get('/stats/topics/monthnew', controller.admin.v1.stats.topicsMonthNew);
  adminv1Router.get('/stats/links/annualnew', controller.admin.v1.stats.linksAnnualNew);

  adminv1Router.get('/about', controller.admin.v1.about.aboutRead);
  adminv1Router.post('/about', controller.admin.v1.about.aboutCreate);

  adminv1Router.get('/config', controller.admin.v1.config.configRead);
  adminv1Router.post('/config', controller.admin.v1.config.configCreate);

  adminv1Router.get('/apis', controller.admin.v1.api.apiList);
  adminv1Router.post('/apis', controller.admin.v1.api.apiCreate);
  adminv1Router.put('/apis/:id', controller.admin.v1.api.apiUpdate);
  adminv1Router.del('/apis/:id', controller.admin.v1.api.apiDelete);
  adminv1Router.get('/apis/cascader', controller.admin.v1.api.apiCascader);
  adminv1Router.get('/apis/all', controller.admin.v1.api.apiListAll);

  adminv1Router.get('/menus', controller.admin.v1.menu.menuList);
  adminv1Router.post('/menus', controller.admin.v1.menu.menuCreate);
  adminv1Router.put('/menus/:id', controller.admin.v1.menu.menuUpdate);
  adminv1Router.del('/menus/:id', controller.admin.v1.menu.menuDelete);
  adminv1Router.get('/menus/cascader', controller.admin.v1.menu.menuCascader);
  adminv1Router.get('/menus/all', controller.admin.v1.menu.menuListAll);

  adminv1Router.get('/roles', controller.admin.v1.role.roleList);
  adminv1Router.post('/roles', controller.admin.v1.role.roleCreate);
  adminv1Router.put('/roles/:id', controller.admin.v1.role.roleUpdate);
  adminv1Router.del('/roles/:id', controller.admin.v1.role.roleDelete);

  adminv1Router.get('/accounts', controller.admin.v1.account.accountList);
  adminv1Router.post('/accounts', controller.admin.v1.account.accountCreate);
  adminv1Router.put('/accounts/:id', controller.admin.v1.account.accountUpdate);
  adminv1Router.del('/accounts/:id', controller.admin.v1.account.accountDelete);
  adminv1Router.get('/accounts/:id', controller.admin.v1.account.accountRead);


  adminv1Router.get('/upload/images', controller.admin.v1.upload.imagesList);
  adminv1Router.post('/upload/images', controller.admin.v1.upload.imagesCreate);
  // adminv1Router.get('/upload/images/:id', controller.admin.v1.upload.imagesDown);


  // PC端路由
  const pcv1Router = router.namespace('/pc/v1');
  pcv1Router.get('/index/recommend', controller.pc.v1.home.indexRecommend);
  pcv1Router.get('/index/list', controller.pc.v1.home.indexList);

  pcv1Router.get('/article/category', controller.pc.v1.article.articleCategory);
  pcv1Router.get('/article/list', controller.pc.v1.article.articleList);
  pcv1Router.get('/article/detail', controller.pc.v1.article.articleDetail);
  pcv1Router.get('/article/interest', controller.pc.v1.article.articleInterest);

  pcv1Router.get('/works/list', controller.pc.v1.works.worksList);
  pcv1Router.get('/works/detail', controller.pc.v1.works.worksDetail);

  pcv1Router.get('/tag/list', controller.pc.v1.tag.tagList);
  pcv1Router.get('/tag/detail', controller.pc.v1.tag.tagDetail);

  pcv1Router.get('/topics/list', controller.pc.v1.topics.topicsList);
  pcv1Router.get('/topics/detail', controller.pc.v1.topics.topicsDetail);

  pcv1Router.get('/links/list', controller.pc.v1.link.linksList);
  pcv1Router.get('/links/recommend', controller.pc.v1.link.linksRecommend);

  pcv1Router.get('/search', controller.pc.v1.search.searchList);

  pcv1Router.get('/about', controller.pc.v1.about.aboutRead);

  pcv1Router.get('/config', controller.pc.v1.config.configRead);
  // router.get('/*', controller.home.index);


};
