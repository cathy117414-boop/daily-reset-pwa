# 生活重启计划 PWA

一个为小学英语教师设计的手机优先每日计划与习惯打卡应用。它不需要账号，所有数据保存在当前浏览器的 `localStorage` 中。

公开版本：<https://cathy117414-boop.github.io/daily-reset-pwa/>

## 已实现

- Lumina Daily Literary Line：Logo 下方每日显示一条英文文学原句，点击展开中文释义与收藏；Library 可按主题筛选和取消收藏。
- 原作核验：[Shakespeare’s Sonnets](https://www.gutenberg.org/ebooks/1041)、[Pride and Prejudice](https://www.gutenberg.org/ebooks/1342)、[A Christmas Carol](https://www.gutenberg.org/ebooks/46)。条目同时记录具体诗号、章节或分节；保留所用版本的文字和标点。
- 30 条原句内置在 `src/data/literaryQuotes.ts`，记录作品、年份、篇章定位与核验来源。英文原文选自莎士比亚《十四行诗集》(1609)、奥斯汀《傲慢与偏见》(1813)、狄更斯《圣诞颂歌》(1843)，使用 Project Gutenberg 公版原文；中文为本项目自写释义，不复制现代译本。诗歌条目可能是逐字节选的诗行，人物对白不代表作者本人主张。
- 按设备本地日期与固定基准日计算索引，同日稳定、次日顺序切换；30 条循环，支持增至 365 条。收藏 ID 保存到现有版本化本地数据；首轮新增空数组无需更换存储 key。应用打开时每 30 秒和回到前台时检查日期，离线无需请求名言接口。扩展句库时须保留已有 ID 与顺序；新增后循环长度改变会影响每日分配。

- 今日日期、任务清单、完成状态和实时完成百分比
- 明日计划与临时安排的新增、修改、删除
- 8 项默认固定习惯，以及自定义习惯的新增、开关、修改、删除
- 健身记录：训练类型、动作、组数、重量、有氧时间
- 最近 7 天完成率、每日明细和平均完成率
- 每日喝水记录：默认目标 2200ml、默认杯量 600ml、快捷添加、自定义容量和撤销
- 动态水杯、水位进度、达标与超额提示，并尊重“减少动态效果”系统设置
- 7 天饮水量、目标百分比、达标天数、日均饮水量和连续达标统计
- 饮水目标与常用杯量设置；历史日期保留各自目标和记录
- 主题中心：黄色布丁狗和朋友、粉色 Kitty、Miffy、小熊虫 bearisbug 四套主题
- 主题统一控制封面、卡片、按钮、标签、进度、水杯、底部导航和完成提示
- 点击主题卡即时预览，可保存或恢复默认；选择会保存在当前设备
- `localStorage` 本地持久化
- PWA manifest、Service Worker 和离线应用壳
- 手机竖屏、安全区、触控尺寸与键盘操作适配

## 本地运行

需要 Node.js 22.13 或更高版本，并推荐使用 pnpm。

```bash
cd apps/daily-reset-pwa
pnpm install
pnpm run dev
```

浏览器打开终端显示的地址（通常为 `http://127.0.0.1:5173`）。

## 生产构建

### PWA 更新与离线

- 请使用 `pnpm run build:pages`（GitHub Pages）或 `pnpm run build`（Sites），构建末尾自动生成带内容哈希的 `sw.js` 和离线资源清单。不要仅运行原始 `vite build` / `vinext build` 后直接发布，也不要把 `public/sw.js` 源模板单独上传。
- 每次实际资源或 Service Worker 内容改变，缓存版本自动改变；无需手改 `CACHE_NAME`。新版本资源全部安装成功后才 `skipWaiting()`，激活时删除本应用旧缓存并 `clients.claim()`，不清除 localStorage 或其他应用缓存。
- 首页 HTML 与 manifest 联网优先、请求绕过 HTTP 缓存；断网或超时后回退到已保存版本。带哈希的 JS/CSS 缓存优先；未缓存的资源不会错误回退为 HTML。
- 启动、回到前台、网络恢复及前台每 60 秒检查 Service Worker 更新，使用 `updateViaCache: 'none'`。切换到新 worker 后自动刷新一次；正在输入或打开编辑弹窗时延迟到操作结束，避免打断编辑。
- `public/_headers` 给支持该文件的托管设置更新头；GitHub Pages 不支持自定义 `_headers`，仍可能返回 `max-age=600`。应用通过 `cache: 'no-store'` / `cache: 'reload'` 与显式更新检查处理此限制，不承诺 CDN 尚未完成发布时立即取得新文件。
- 从旧版首次迁移：联网打开一次，等待新 worker 安装，再重新打开或刷新页面。以后版本自动更新。无需删除主屏幕图标、卸载或清除网站数据；清除数据会丢失本地计划和收藏。

```bash
pnpm run build
pnpm run start
```

GitHub Pages 静态构建：

```bash
pnpm run build:pages
```

GitHub Pages 文件会生成到 `pages-dist/`；vinext 生产构建会生成到 `dist/`。Service Worker 只在静态生产入口注册，避免开发期间缓存旧文件。

## 测试

```bash
pnpm test
pnpm run build:pages
pnpm run build
```

自动化测试覆盖 v1/v2 → v3 数据迁移、饮水记录、主题配置、主题持久化、旧数据保留和七天统计。

## 主题图片素材

项目不会下载或内置网络角色图片。请只放入你已确认拥有个人使用权或相应授权的 WebP 素材：

```text
public/themes/
├── cream-puppy/
├── pink-kitten/
├── minimal-rabbit/
└── bear-bug/
```

每个目录包含 `cover.webp`、`mascot.webp`、`completed.webp` 和 `thumbnail.webp`。首页使用封面图，主题中心使用缩略图，100% 完成提示使用完成插画，空状态使用角色图。所有图片按完整比例显示，不裁掉主体；图片不可用时会自动显示安全的 CSS 配色占位，不会出现损坏图片图标。Service Worker 会预缓存这 16 张图片，确保首次在线加载后可离线显示。默认主题为“小熊虫 bearisbug”。

## 添加到手机主屏幕

PWA 安装和 Service Worker 需要 HTTPS，`localhost` 除外。

1. 把 `dist/` 部署到支持 HTTPS 的静态网站服务。
2. 用手机浏览器打开网址。
3. iPhone Safari：分享 → “添加到主屏幕”。
4. Android Chrome：浏览器菜单 → “安装应用”或“添加到主屏幕”。

## 数据说明

- 数据仅保存在当前浏览器和当前域名下。
- 当前存储版本为 `daily-reset-pwa:v3`；首次打开时会自动读取并迁移 `daily-reset-pwa:v2` 或 `daily-reset-pwa:v1`，原任务、习惯、健身、饮水和回顾数据保持不变。
- 已保存的主题 ID 与其他数据一起保存在版本化存储中；仅预览但未保存的主题不会覆盖当前选择。
- 每个日期的饮水记录分别保存在 `waterDays` 中，包含当天目标、杯量、总量和逐次饮水条目。
- 清除浏览器网站数据会同时清除计划记录。
- 更换手机或浏览器不会自动同步，这是最小可用版本的有意设计。
- 固定习惯会在某一天首次生成计划时写入当天任务；之后修改习惯不会回写已经生成的历史计划。
- “起床后喝水”等饮水节点是普通习惯提醒；只有首页饮水模块的容量按钮会增加今日饮水量。

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
│  ├─ WaterCard.jsx
│  ├─ water.js
│  ├─ storage.js
│  ├─ styles.css
│  └─ pages-main.jsx
├─ tests/
│  └─ water.test.mjs
├─ index.html
├─ package.json
└─ vite.pages.config.js
```

## 后续可选升级

数据导入导出、提醒通知、30 天总览和云端同步都可以在后续版本增加；当前版本刻意不包含登录、社交和付费功能。

## 主题装饰 · 第一阶段

装饰仅应用于主题中心、首页 A Line for Today、今日进度卡，不扩展到其他页面。
在 `src/config/themes.js` 的每套主题中配置 `decorations`：

```js
decorations: {
  tape: { style: 'gingham', color: '#D8E9EF', ink: '#94B7C7' },
  primarySticker: { shape: 'star', color: '#C28A36' },
  sectionIconStyle: 'rounded',
  quoteDecorationStyle: { style: 'handwritten', color: '#B87932', doodle: 'star', divider: 'dashed' },
  progressCardDecoration: { shape: 'star', color: '#C28A36' },
}
```

胶带支持 `gingham / washi / paper / kraft`；贴纸支持 `star / bow / heart / dot / leaf`；
标题图标支持 `rounded / fine / minimal / natural`；引号支持 `handwritten / slender / minimal`。
渲染组件只识别这些通用样式，不按主题 ID 写判断。新增主题可复用相同配置。
缺省或未知材料不会渲染，恢复原有纯色布局。第一阶段全部素材为本地 CSS 和内联 SVG，
不请求网络图片，不引入动画（包括 reduced motion 模式），随构建后的 CSS/JS 一起离线缓存。
所有装饰均 `aria-hidden`、`pointer-events: none`，不遮挡操作区域；切换仍使用原有预览、保存和 localStorage 机制。
