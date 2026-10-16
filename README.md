# 生活重启计划 PWA

一个为小学英语教师设计的手机优先每日计划与习惯打卡应用。它不需要账号，所有数据保存在当前浏览器的 `localStorage` 中。

公开版本：<https://cathy117414-boop.github.io/daily-reset-pwa/>

## 已实现

- 手机任务卡标题允许完整换行，保留原字号，描述始终跟在标题下方；卡片自然增高，编辑与删除操作固定显示。
- 所有共用弹窗通过 `useModalViewport` 监听 Visual Viewport 的 resize / scroll，适配虚拟键盘造成的高度缩小与视口平移；字段聚焦后即时及 120/320ms 再检查，仅在必要时滚动弹窗内容，避开底部确认按钮。保留安全区、触控滚动和 16px 输入字号；无 Visual Viewport 时使用 window resize 回退。关闭弹窗时清理监听和定时器、释放背景滚动锁并恢复页面位置。
- 手机输入回归使用 390×844 浏览器及模拟 Visual Viewport 验证，不等同于实体 iPhone Safari 键盘测试。

- 首页 Hydration Cup：奶油随行杯、粉色珍珠杯、极简外带咖啡杯、自然陶瓷马克杯；四种独立内联 SVG 杯型共用原有饮水记录和按钮，不新增存储字段。
- `src/config/themes.js` 中的 `hydrationCup` 配置包含 `type`、`bodyColor`、`bodySecondaryColor`、`rimColor`、`lidColor`、`handleColor`、`strawColor`、`accentColor`、`waterColor`、`outlineColor`、`straw`、`handle`、`pearls`、`progressWindow`、`sticker`、`secondaryDecoration`、`completion`。组件只按杯型选择 renderer，不判断主题名称。
- 水位按实际总量 / 当日目标精确计算，裁切至 0–100%；随行杯细长圆角窗口、咖啡杯中部偏左窄窗、珍珠杯与马克杯内部切面各自显示动态水位。超过目标仍保留真实总量、百分比和超额提示；珍珠固定 9 颗，不代表饮水量。
- v1 视觉精修：修长奶油随行杯与宽 C 型把手、淡奶粉色珍珠杯、圆润盖沿与纸纹咖啡杯、低对比釉面陶瓷杯。各自设置 SVG viewBox 平衡视觉重量，不改数据或动画逻辑。
- 最后一轮精修：随行杯纵向拉长 6%，奶茶杯收窄 4%，咖啡杯窄窗改为 9px 且更淡，陶瓷杯口与把手更圆润；四杯型共享轻描边、白边与阴影，无新增贴纸或 doodle。
- 展示区固定 216px（比前版增加约 6%，给杯子更多显示空间），通过压缩卡片内边距与文字留白，390×844 下卡片从前版 579px 再缩短至 547px；四种杯型和各水位保持相同卡片高度、按钮位置。水位过渡 400ms、杯型淡入 200ms，遵循 reduced motion。保留 aria-live 数字播报，杯子有文字标签，装饰不参与读屏与点击。
- 复用现有布丁 / 星星、蝴蝶结 / 小花 / 爱心、太阳 / 线花、蘑菇 / 叶子 SVG，无新增图片、字体、动画库或网络依赖。缺失装饰安全隐藏，杯子与数字仍正常工作；生产构建自动将相关本地素材纳入离线缓存。

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

视觉层仅应用于 App 主背景、主题中心、首页 A Line for Today、今日进度卡；不改变其他页面的内容卡片。
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
缺省或未知材料不会渲染，恢复原有纯色布局。素材为本地 CSS 和 SVG，
不请求外部图片，不引入动画（包括 reduced motion 模式），随生产构建一起离线缓存。
所有装饰均 `aria-hidden`、`pointer-events: none`，不遮挡操作区域；切换仍使用原有预览、保存和 localStorage 机制。

### 首页贴纸素材包

`public/decorations/` 包含 29 个原创透明 SVG（已有 12 个，新增纸片贴纸 1 个和细线 doodle 16 个），均无字体、外部引用或脚本：

| 目录 | 主贴纸 / 辅助素材 | 胶带 |
| --- | --- | --- |
| cream | star.svg、pudding.svg | 浅蓝格纹 tape.svg |
| pink | bow.svg、hearts.svg | 粉色和纸 tape.svg |
| minimal | sun.svg、paper-note.svg、flower.svg（保留） | 米白纸 tape.svg |
| nature | leaf.svg、mushroom.svg | 牛皮纸 tape.svg |

主题中心保留 CSS 胶带，调整至统一轻透明度；预览区角落使用一张真实贴纸和一个低透明度 doodle，不改 4:3 比例和选中态尺寸。
`quoteDecorationStyle.sticker` 与 `quoteDecorationStyle.doodle` 接受 `{ asset: 'decorations/pink/bow.svg', size: 36 }`；
`progressCardDecoration` 使用相同结构。`size` 限定 12–48px，路径仅允许上述本地 SVG 目录。
旧的 `{ shape, color }` 写法仍兼容；素材加载失败时移除该图片，不显示破图。
文学句子标题行内最多 1 主贴纸 + 1 辅助 doodle，保留 Library 触控区；进度卡保留 section icon，边缘使用 1 贴纸 + 1 doodle。
贴纸统一轻白边、轻阴影；doodle 无投影、透明度更低。不修改引文、进度、饮水、导航或本地数据逻辑；构建自动将全部 SVG 加入 Service Worker 离线清单。

### 材质 / 贴纸 / doodle 三层系统

`decorations.texture` 配置主材质、辅助材质、色彩、强度和缩放，例如：

```js
texture: {
  primaryType: 'gingham', secondaryType: 'paper-fiber',
  opacity: 0.06, secondaryOpacity: 0.035, scale: 1, color: '#8CAEBB',
}
```

`src/config/textures.js` 生成 CSS 渐变变量，不按主题 ID 分支，不需要网络材质图。
主底纹支持 `gingham / pin-dots / horizontal-grain / speckles`，辅助底纹支持
`paper-fiber / washi-fiber / fine-grid / botanical-fiber`。主强度限制 0–0.14、辅助强度 0–0.09，缺少或无效配置回退 `none`。
App 背景使用 0.7 层透明度，文学区 0.42，进度与主题卡 0.36；材质通过绝对定位伪元素铺在内容下方，不改变高度或点击区域。

`decorations.doodles` 保存四个小素材描述；`previewDoodle`、`progressDoodle` 仅引用其键值，
`primarySticker` 用于主题卡，`quoteDecorationStyle` 与 `progressCardDecoration` 继续控制首页两处装饰。

| 主题 | 主材质 + 辅助材质 | 文学区 | 进度卡 | 四个 doodle 文件（均以 doodle- 开头） |
| --- | --- | --- | --- | --- |
| cream | 浅蓝宽格 + 纸颗粒短纤维 | 布丁 + 星星线稿 | 星星 + 三点 | star、dots、curve、heart |
| pink | 小针点 + 和纸短纤维 | 蝴蝶结 + 心线稿 | 心组合 + 小花 | heart、flower、curve、dots |
| minimal | 哑光横纹 + 稀疏细格 | 小太阳 + 单线花 | 小纸片 + 短横线 | flower、dots、line、corner |
| nature | 再生纸颗粒 + 短植物纤维 | 叶贴纸 + 小枝条 | 蘑菇 + 叶片线稿 | leaf、branch、dots、curve |

仅从上述素材选择组合，不把全部 doodle 同时铺满页面。App 背景没有贴纸；饮水、健身和回顾内容未加入材质或装饰。所有层均为静态，尊重 reduced motion。
