# 生活重启计划 PWA

一个为小学英语教师设计的手机优先每日计划与习惯打卡应用。它不需要账号，所有数据保存在当前浏览器的 `localStorage` 中。

公开版本：<https://cathy117414-boop.github.io/daily-reset-pwa/>

## 已实现

- 今日日期、任务清单、完成状态和实时完成百分比
- 明日计划与临时安排的新增、修改、删除
- 8 项默认固定习惯，以及自定义习惯的新增、开关、修改、删除
- 健身记录：训练类型、动作、组数、重量、有氧时间
- 最近 7 天完成率、每日明细和平均完成率
- `localStorage` 本地持久化
- PWA manifest、Service Worker 和离线应用壳
- 手机竖屏、安全区、触控尺寸与键盘操作适配

## 本地运行

需要 Node.js 18 或更高版本。

```bash
cd apps/daily-reset-pwa
npm install
npm run dev
```

浏览器打开终端显示的地址（通常为 `http://127.0.0.1:5173`）。

## 生产构建

```bash
npm run build
npm run start
```

GitHub Pages 静态构建：

```bash
npm run build:pages
```

生产文件会生成到 `dist/`。Service Worker 只在生产构建中注册，避免开发期间缓存旧文件。

## 添加到手机主屏幕

PWA 安装和 Service Worker 需要 HTTPS，`localhost` 除外。

1. 把 `dist/` 部署到支持 HTTPS 的静态网站服务。
2. 用手机浏览器打开网址。
3. iPhone Safari：分享 → “添加到主屏幕”。
4. Android Chrome：浏览器菜单 → “安装应用”或“添加到主屏幕”。

## 数据说明

- 数据仅保存在当前浏览器和当前域名下。
- 清除浏览器网站数据会同时清除计划记录。
- 更换手机或浏览器不会自动同步，这是最小可用版本的有意设计。
- 固定习惯会在某一天首次生成计划时写入当天任务；之后修改习惯不会回写已经生成的历史计划。

## 项目结构

```text
daily-reset-pwa/
├─ public/
│  ├─ app-icon.svg
│  ├─ manifest.json
│  └─ sw.js
├─ src/
│  ├─ App.jsx
│  ├─ components.jsx
│  ├─ icons.jsx
│  ├─ storage.js
│  ├─ styles.css
│  └─ main.jsx
├─ index.html
├─ package.json
└─ vite.config.js
```

## 后续可选升级

数据导入导出、提醒通知、30 天总览和云端同步都可以在后续版本增加；当前版本刻意不包含登录、社交和付费功能。
