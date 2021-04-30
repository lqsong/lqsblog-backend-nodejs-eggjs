# lqsblog-backend-nodejs-eggjs

 它（[Github](https://github.com/lqsong/lqsblog-backend-nodejs-eggjs) 、 [Gitee](https://gitee.com/lqsong/lqsblog-backend-nodejs-eggjs)）是一个Node.js API后端服务，它基于 [Egg](https://eggjs.org) 实现（Egg + Sequelize + RBAC + Jwt（+ 自动刷新） + Restful）。


## 开发文档

- [lqsBlog官方文档](http://docs.liqingsong.cc/guide/backendservice/nodejs-eggjs.html)。

- [ADMIN DEMO](http://lqsblog-demo.admin-element-vue.liqingsong.cc/)

- [PC DEMO](http://liqingsong.cc/)

## 功能

```sh
- 登录 / 注销 (RBAC + jwt 验证，自动刷新jwt)
- 首页 / 统计
- 随笔
- 作品
- 专题
- 左邻右舍
- 设置
  - 关于我
  - 标签
  - 账号
  - 角色
  - 后台菜单
  - 后台API
  - 站点配置
```

## 技术选型

- 核心框架：Koa + Egg 
- 安全框架：自定义 RBAC
- ORM： Sequelize
- 会话管理: JWT
- api风格：restful

## 基础环境

- Node.js 8 +
- MySQL5.7 +


## QuickStart

### Development

```bash
$ npm i
$ npm run dev
```

### Deploy

```bash
$ npm start
$ npm stop
```


## 捐赠

如果你觉得这个项目帮助到了你，你可以请作者喝咖啡表示鼓励.

**ALIPAY**             |  **WECHAT**
:-------------------------:|:-------------------------:
![Alipay](http://uploads.liqingsong.cc/20210430/f62d2436-8d92-407d-977f-35f1e4b891fc.png)  |  ![Wechat](http://uploads.liqingsong.cc/20210430/3e24efa9-8e79-4606-9bd9-8215ce1235ac.png)

