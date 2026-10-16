# Skin Care v1

入口位于底部 **Skin Care**。首次为空，由用户建立自己的护理项目；不导入现有“涂身体乳”等任务，也不与任务打卡重复联动。

## 页面

- **Tonight’s Care**：本地日期、Routine、Due Today、Extra Care Today。
- **Manage Routine**：新增、编辑和删除；删除定义时保留带名称快照的历史日志。
- Routine 支持 Daily / Specific weekdays；周期项目支持 Every X days（1–365 天）/ Weekly。Weekly 是完成后 +7 天，不是固定星期几。
- Due 卡点击展开 Done / Tomorrow，完成后当晚保留 Done / Next 卡片。过期项目继续温和显示 Due tonight，不出现红色逾期、分数或连续打卡压力。
- Extra 可选已有项目或自定义；选择周期项目时必须明确选择 Just Extra 或 Count as Completed。

## 本地数据

沿用 `daily-reset-pwa:v3`，根版本不变，新增独立字段：

```js
skinCare: {
  schemaVersion: 1,
  items: [],
  completionLogs: [],
  extraCareLogs: []
}
```

旧版本迁移只增加空 Skin Care 区，不改变任务、习惯、饮水、健身、收藏或主题记录。

```js
// Care Item
{
  id, name, type: 'routine' /* 或 periodic */,
  frequency: { mode: 'daily' /* weekdays | interval | weekly */, days: null, weekdays: [] },
  lastCompletedAt: null, nextDueAt: null, snoozedUntil: null,
  cycleStartedAt: '2026-10-15', startMode: 'due' /* 或 start */,
  icon: 'care', enabled: true
}
// Completion Log（careId + 本地 date 唯一）
{ id, careId, careName, date: '2026-10-15', source: 'routine' /* due | extra */ }
// Extra Care Log
{ id, careId: null, name, date: '2026-10-15', countsAsCompletion: false }
```

日期字段均为本地 YYYY-MM-DD；`cycleStartedAt` 区分“起算”与真正完成，不创建虚假的上次完成记录。

## 规则

- `src/dates.js` 统一提供 getLocalDateKey / addLocalDays / getLocalWeekday / formatLocalDate。日期加减用本地正午与 setDate，不使用 UTC 日期截取或固定 24 小时毫秒数，避免时区与夏令时偏移。原有 getDateKey API 转发到同一 helper。
- 周期项目正式完成后，`lastCompletedAt = today`，`nextDueAt = today + interval`，清空 snoozedUntil；延迟完成也从实际完成日重新起算。
- 同一 careId / date 的正式完成只记一次；重复 Done 或 Extra 正式完成不会再次推进周期。
- `nextDueAt <= today` 且当日未正式完成时到期；`snoozedUntil > today` 时隐藏。Tomorrow 只写明天的 snoozedUntil，不改 nextDueAt / lastCompletedAt，不写完成日志。
- 无 Last Completed：Due Today 设 nextDueAt 为今天；Start From Today 设为今天 + interval，Last 保持空。首次周期起点会持久化，刷新不会滑动到期日。
- 修改频率或 Last Completed 时，从有效 Last 重新计算；无 Last 的 Start 项目按持久化起点计算。改起算方式或清空 Last 时重新选定本地起点。
- Just Extra 仅增加额外日志；Count as Completed 同时调用统一正式完成函数。自定义额外护理不会变成 recurring 项目。已有 Routine 的 Extra 也只作为额外记录。
- Routine 完成日志保留历史，但每日勾选由 careId + today 判断；每日星期筛选、额外日志筛选也按本地 today。复用 App 的每 30 秒 / 回到前台 / focus 日期同步，无需联网或每日重写历史。
- UI 不提供周期固定星期的复杂规则；底层对已存在的 weekdays 周期定义仍保留未完成 due，避免跨日静默丢失。

## 视觉、输入与离线

复用主题变量、现有主题贴纸、低对比纸纹及细线瓶子图标；每张护理卡只有一个功能图标，不叠加装饰。新增 Skin Care 导航入口，原六页保留。名称自动换行，页面预留底部导航和 safe area。

所有新增 / 编辑 / 自定义表单使用既有 Modal 与 useModalViewport，支持 visualViewport、100dvh、内部滚动及底部确认操作。键盘回归采用浏览器视口模拟，不代表实体 iPhone Safari 键盘已实测。

无新远程请求、依赖或外部素材。现有构建流程自动更新离线资源与内容版本，manifest、SW 策略和安装机制不变。

## 验证

`node --test tests/*.test.mjs` 包含用户列出的 11 个日期场景，以及 Weekly、首次起算、持久化迁移、自定义额外护理、防重复和日志保留测试。

浏览器测试覆盖 390×844 / 桌面、四套主题与深色模式、CRUD、两种 Extra、Tomorrow、跨午夜、刷新、离线新增 / 刷新、长名称、键盘视口模拟及原有页面。浏览器脚本和截图保存在项目外，不随源码提交测试运行数据。

v1 不包含产品库存、成分分析、统计图表、连续打卡、系统通知或日历引擎。清除浏览器网站数据会同时清除这些本地记录；本版没有账号与云同步。
