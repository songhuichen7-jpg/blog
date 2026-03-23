# The Curator

一个基于参考设计稿落地的全栈个人博客项目。前端延续了 `参考/` 里的 Quiet Editorial 风格，后端使用 `Next.js App Router + Prisma + PostgreSQL`，适合继续扩展并上线部署。

## 技术栈

- `Next.js 15` + `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `PostgreSQL`
- Markdown 文章渲染：`react-markdown + remark-gfm`

## 已完成内容

- 首页、文章详情、归档页、关于页、写作后台
- 文章发布 / 草稿保存
- 邮箱订阅接口
- 基于 Cookie 的单管理员登录
- PostgreSQL schema、种子数据、初始 migration SQL

## 本地启动

1. 安装依赖

```bash
npm install --script-shell=/bin/sh
```

2. 启动数据库

```bash
npm run db:up
```

3. 生成 Prisma Client 并同步数据库

```bash
npx prisma migrate deploy
npx prisma db seed
```

4. 启动开发环境

```bash
npm run dev -- -H 127.0.0.1 -p 3000
```

5. 访问

- 前台首页：`http://127.0.0.1:3000`
- 后台登录：`http://127.0.0.1:3000/login`

## 本地默认管理员

当前仓库里我已经放了一份本地 `.env` 方便你直接启动。

- 邮箱：`admin@example.com`
- 密码：`change-me-please`

上线前请务必改掉：

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `BLOB_READ_WRITE_TOKEN`（如果你要用后台图片上传）

## 生成管理员密码哈希

```bash
npm run hash-password -- your-new-password
```

把输出结果填进 `.env` 里的 `ADMIN_PASSWORD_HASH`。

## 常用命令

```bash
npm run lint
npm run typecheck
npm run build
npm run db:down
npx prisma studio
```

## 数据模型

- `Post`: 文章
- `Category`: 分类
- `Tag`: 标签
- `PostTag`: 文章标签关联
- `NewsletterSubscriber`: 订阅邮箱

## 上线建议

推荐直接部署到：

- Vercel: 部署 Next.js
- Neon / Supabase / RDS: 托管 PostgreSQL

生产环境建议流程：

1. 配置线上 `DATABASE_URL`
2. 执行 `npx prisma migrate deploy`
3. 配置 `ADMIN_EMAIL`、`ADMIN_PASSWORD_HASH`、`SESSION_SECRET`
4. 如果你要在后台上传图片，配置 `BLOB_READ_WRITE_TOKEN`
5. 如需首批内容，可在预发布环境执行 `npx prisma db seed`

## Railway 部署

推荐做法是一个 Railway Project 里放两个服务：

- Web 服务：当前 Next.js 博客
- PostgreSQL 服务：Railway 自带数据库

### Web 服务变量

在 Web 服务里至少配置这些变量：

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_SITE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD_HASH=your-password-hash
SESSION_SECRET=your-long-random-secret
```

如果你要继续使用后台图片上传，再额外配置：

```bash
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### Railway 服务设置

- Start Command: `npm run start`
- Pre-Deploy Command: `npx prisma migrate deploy`
- Healthcheck Path: `/api/health`

### 首次上线顺序

1. 在 Railway 里创建项目并连接 GitHub 仓库
2. 给项目添加 PostgreSQL 服务
3. 在 Web 服务 Variables 里填入上面的变量
4. 在 Web 服务 Networking 里生成域名
5. 设置 `Pre-Deploy Command` 为 `npx prisma migrate deploy`
6. 设置 `Healthcheck Path` 为 `/api/health`
7. 触发一次部署
8. 如需初始化演示内容，在 Railway Shell 或临时 Job 里执行 `npx prisma db seed`

## 当前说明

- 图片目前使用远程链接，后续如果你准备长期上线，建议把封面图迁到自己的对象存储或 CDN。
- 后台上传图片现在依赖 Vercel Blob；如果你暂时不配对象存储，也可以继续直接粘贴图片 URL。
- 写作后台当前是单管理员模式，适合个人博客；如果后面你想做多账号，我可以继续帮你扩展用户表和权限系统。
