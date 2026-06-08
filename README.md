# GitHub 每日热点

一个自动抓取和展示 GitHub 每日热门仓库的项目。

## 功能特点

- 自动抓取 GitHub 最近 7 天创建的热门仓库
- 美观的卡片式展示界面
- 支持自动每日更新
- 支持 GitHub Pages 部署

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 抓取数据：
   ```bash
   npm run scrape
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 访问 http://localhost:3000 查看效果

## 部署到 GitHub Pages

1. 将代码推送到你的 GitHub 仓库

2. 在仓库设置中启用 GitHub Pages：
   - 进入仓库的 Settings > Pages
   - 源选择 "gh-pages" 分支

3. GitHub Actions 会自动在每次推送时和每天午夜执行抓取和部署

## 手动构建

```bash
npm run build
```

构建产物会生成在 `dist` 目录中。

## 项目结构

```
.
├── public/              # 前端资源
│   └── index.html      # 主页面
├── scripts/            # 脚本文件
│   ├── scrape.js       # 数据抓取脚本
│   └── build.js        # 构建脚本
├── server.js           # 开发服务器
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions 配置
```
