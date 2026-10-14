import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  completionForDay,
  ensureDay,
  getDateKey,
  loadState,
  saveState,
} from "./storage";
import { AddButton, BottomNav, Field, Modal, ProgressPanel, TaskList } from "./components";
import { EditIcon, TrashIcon } from "./icons";
import { WaterCard } from "./WaterCard";
import { addWater, ensureWaterDay, getSevenDayWaterStats, undoLastWater, updateWaterSettings } from "./water";
import { ThemeCenter } from "./features/theme-settings/ThemeCenter";
import { useTheme } from "./hooks/useTheme";
import { DailyLiteraryLine, LuminaLibrary } from "./features/literary/DailyLiteraryLine";
import { toggleLiteraryFavorite } from "./literary.ts";

const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const MODULES = ["生活", "成长", "健身", "语言", "饮水", "护理", "睡眠", "工作", "其他"];

function formatHeaderDate(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS[date.getDay()]}`;
}

function makeId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const emptyTask = { time: "09:00", module: "生活", name: "", note: "" };
const emptyWorkout = { date: getDateKey(), type: "力量训练", exercises: "", sets: "", weight: "", cardioMinutes: "" };

function TaskForm({ initial = emptyTask, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...initial }));
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim(), note: form.note.trim() });
  };

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="form-grid">
        <Field label="时间"><input type="time" value={form.time} onChange={update("time")} required /></Field>
        <Field label="模块">
          <select value={form.module} onChange={update("module")}>{MODULES.map((item) => <option key={item}>{item}</option>)}</select>
        </Field>
      </div>
      <Field label="任务名称"><input value={form.name} onChange={update("name")} placeholder="例如：整理书桌" required autoFocus /></Field>
      <Field label="执行说明"><textarea value={form.note} onChange={update("note")} placeholder="写下清晰、容易开始的一步" rows="3" /></Field>
      <div className="form-actions"><button type="button" className="text-button" onClick={onClose}>取消</button><button className="primary-button">保存安排</button></div>
    </form>
  );
}

function DayPage({ title, date, state, setState, isToday, onLibrary, onFavorite }) {
  const dateKey = getDateKey(date);
  const tasks = state.days[dateKey]?.tasks || [];
  const waterDay = state.waterDays?.[dateKey];
  const progress = completionForDay(state, dateKey);
  const [editing, setEditing] = useState(null);

  const updateTasks = (updater) => setState((current) => {
    const ensured = ensureDay(current, dateKey);
    return {
      ...ensured,
      days: {
        ...ensured.days,
        [dateKey]: { tasks: updater(ensured.days[dateKey].tasks) },
      },
    };
  });

  const toggle = (id) => updateTasks((items) => items.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  const remove = (id) => updateTasks((items) => items.filter((item) => item.id !== id));
  const save = (form) => {
    updateTasks((items) => editing?.id
      ? items.map((item) => item.id === editing.id ? { ...item, ...form } : item)
      : [...items, { ...form, id: makeId(dateKey), completed: false, temporary: true }]);
    setEditing(null);
  };

  return (
    <>
      {isToday ? (
        <header className="lumina-header">
          <div className="date-line">{formatHeaderDate(date)}</div>
          <h1 className="lumina-brand" lang="en">Lumina</h1>
          <DailyLiteraryLine dateKey={dateKey} favorites={state.literaryFavorites} onToggle={onFavorite} onLibrary={onLibrary} />
        </header>
      ) : (
        <header className="page-header">
          <div className="date-line">{formatHeaderDate(date)}</div>
          <h1>{title}</h1>
          <p>提前想好一点，明天就从容一点。</p>
        </header>
      )}
      {isToday ? <ProgressPanel {...progress} /> : null}
      {isToday && waterDay ? (
        <WaterCard
          day={waterDay}
          onAdd={(amountMl) => setState((current) => addWater(current, dateKey, amountMl))}
          onUndo={() => setState((current) => undoLastWater(current, dateKey))}
          onSettings={(settings) => setState((current) => updateWaterSettings(current, dateKey, settings))}
        />
      ) : null}
      <section className="section-block">
        <div className="section-heading"><h2>{isToday ? "今日任务" : "明日安排"}</h2><AddButton onClick={() => setEditing({})} /></div>
        <TaskList tasks={tasks} onToggle={toggle} onEdit={setEditing} onDelete={remove} />
      </section>
      {editing !== null ? <Modal title={editing.id ? "修改安排" : "添加临时安排"} onClose={() => setEditing(null)}><TaskForm initial={editing.id ? editing : emptyTask} onSave={save} onClose={() => setEditing(null)} /></Modal> : null}
    </>
  );
}

function HabitsPage({ state, setState }) {
  const [editing, setEditing] = useState(null);
  const save = (form) => {
    setState((current) => ({
      ...current,
      habits: editing?.id
        ? current.habits.map((habit) => habit.id === editing.id ? { ...habit, ...form } : habit)
        : [...current.habits, { ...form, id: makeId("habit"), active: true }],
    }));
    setEditing(null);
  };
  const toggle = (id) => setState((current) => ({ ...current, habits: current.habits.map((habit) => habit.id === id ? { ...habit, active: !habit.active } : habit) }));
  const remove = (id) => setState((current) => ({ ...current, habits: current.habits.filter((habit) => habit.id !== id) }));

  return (
    <>
      <PageIntro title="固定习惯" text="开启的习惯会自动加入尚未生成的每日计划。" />
      <section className="section-block">
        <div className="section-heading"><h2>{state.habits.filter((item) => item.active).length} 项已开启</h2><AddButton onClick={() => setEditing({})}>添加习惯</AddButton></div>
        <div className="habit-list">
          {state.habits.map((habit) => (
            <article className={`habit-row ${habit.active ? "" : "inactive"}`} key={habit.id}>
              <button className={`habit-toggle ${habit.active ? "on" : ""}`} onClick={() => toggle(habit.id)} aria-label={`${habit.active ? "关闭" : "开启"} ${habit.name}`}><span /></button>
              <div><div className="habit-title"><time>{habit.time}</time><strong>{habit.name}</strong></div><p>{habit.module} · {habit.note}</p></div>
              <div className="row-actions"><button onClick={() => setEditing(habit)} aria-label={`编辑 ${habit.name}`}><EditIcon size={19} /></button><button onClick={() => remove(habit.id)} aria-label={`删除 ${habit.name}`}><TrashIcon size={18} /></button></div>
            </article>
          ))}
        </div>
      </section>
      {editing !== null ? <Modal title={editing.id ? "修改固定习惯" : "添加固定习惯"} onClose={() => setEditing(null)}><TaskForm initial={editing.id ? editing : emptyTask} onSave={save} onClose={() => setEditing(null)} /></Modal> : null}
    </>
  );
}

function WorkoutForm({ initial = emptyWorkout, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...initial }));
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, exercises: form.exercises.trim() });
  };
  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="form-grid">
        <Field label="日期"><input type="date" value={form.date} onChange={update("date")} required /></Field>
        <Field label="训练类型"><input value={form.type} onChange={update("type")} placeholder="力量训练" required /></Field>
      </div>
      <Field label="动作"><textarea value={form.exercises} onChange={update("exercises")} placeholder="深蹲、硬拉、臀桥…" rows="3" required /></Field>
      <div className="form-grid">
        <Field label="组数"><input value={form.sets} onChange={update("sets")} inputMode="numeric" placeholder="4 × 12" /></Field>
        <Field label="重量"><input value={form.weight} onChange={update("weight")} placeholder="20 kg" /></Field>
      </div>
      <Field label="有氧时间（分钟）"><input type="number" min="0" value={form.cardioMinutes} onChange={update("cardioMinutes")} placeholder="30" /></Field>
      <div className="form-actions"><button type="button" className="text-button" onClick={onClose}>取消</button><button className="primary-button">保存记录</button></div>
    </form>
  );
}

function WorkoutsPage({ state, setState }) {
  const [editing, setEditing] = useState(null);
  const save = (form) => {
    setState((current) => ({
      ...current,
      workouts: editing?.id
        ? current.workouts.map((item) => item.id === editing.id ? { ...item, ...form } : item)
        : [{ ...form, id: makeId("workout") }, ...current.workouts],
    }));
    setEditing(null);
  };
  const remove = (id) => setState((current) => ({ ...current, workouts: current.workouts.filter((item) => item.id !== id) }));

  return (
    <>
      <PageIntro title="健身记录" text="把今天做到的写下来，不追求完美，只记录进步。" />
      <section className="section-block">
        <div className="section-heading"><h2>训练日志</h2><AddButton onClick={() => setEditing({})}>记录训练</AddButton></div>
        <div className="workout-list">
          {state.workouts.length ? state.workouts.map((item) => (
            <article className="workout-card" key={item.id}>
              <div className="workout-top"><div><time>{item.date}</time><h3>{item.type}</h3></div><div className="row-actions"><button onClick={() => setEditing(item)} aria-label="编辑健身记录"><EditIcon size={19} /></button><button onClick={() => remove(item.id)} aria-label="删除健身记录"><TrashIcon size={18} /></button></div></div>
              <p className="exercise-list">{item.exercises}</p>
              <dl><div><dt>组数</dt><dd>{item.sets || "—"}</dd></div><div><dt>重量</dt><dd>{item.weight || "—"}</dd></div><div><dt>有氧</dt><dd>{item.cardioMinutes ? `${item.cardioMinutes} 分钟` : "—"}</dd></div></dl>
            </article>
          )) : <div className="empty-state">还没有训练记录。完成一次运动后，就从这里开始。</div>}
        </div>
      </section>
      {editing !== null ? <Modal title={editing.id ? "修改训练记录" : "记录今天的训练"} onClose={() => setEditing(null)}><WorkoutForm initial={editing.id ? editing : emptyWorkout} onSave={save} onClose={() => setEditing(null)} /></Modal> : null}
    </>
  );
}

function WeeklyPage({ state }) {
  const { days, waterStats } = useMemo(() => {
    const recentDays = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(new Date(), index - 6);
      const key = getDateKey(date);
      return { date, key, ...completionForDay(state, key) };
    });
    return {
      days: recentDays,
      waterStats: getSevenDayWaterStats(state, recentDays.map((day) => day.key)),
    };
  }, [state]);
  const average = days.length ? Math.round(days.reduce((sum, day) => sum + day.percent, 0) / days.length) : 0;
  const completed = days.reduce((sum, day) => sum + day.completed, 0);

  return (
    <>
      <PageIntro title="每周回顾" text="看见已经做到的，也给没有完成的留一点余地。" />
      <section className="weekly-summary">
        <div><span>最近7天平均完成率</span><strong>{average}<small>%</small></strong></div>
        <p>一共完成了 {completed} 项任务</p>
      </section>
      <section className="section-block">
        <div className="section-heading"><h2>7天完成情况</h2></div>
        <div className="week-chart" aria-label="最近7天完成率柱状图">
          {days.map((day) => (
            <div className="bar-column" key={day.key}>
              <span className="bar-value">{day.percent}%</span>
              <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(day.percent, 3)}%` }} /></div>
              <span>{["日", "一", "二", "三", "四", "五", "六"][day.date.getDay()]}</span>
              <small>{day.date.getMonth() + 1}/{day.date.getDate()}</small>
            </div>
          ))}
        </div>
        <div className="week-list">
          {days.slice().reverse().map((day) => (
            <div key={day.key}><span>{formatHeaderDate(day.date)}</span><span>{day.completed} / {day.total}</span><strong>{day.percent}%</strong></div>
          ))}
        </div>
      </section>
      <section className="section-block water-week-section">
        <div className="section-heading"><h2>7天饮水回顾</h2></div>
        <div className="water-week-summary">
          <div><span>本周达标</span><strong>{waterStats.targetDays}<small> / 7天</small></strong></div>
          <div><span>日均饮水</span><strong>{waterStats.averageMl}<small>ml</small></strong></div>
          <div><span>连续达标</span><strong>{waterStats.streak}<small>天</small></strong></div>
        </div>
        <div className="water-week-list" aria-label="最近7天饮水完成情况">
          {[...waterStats.days].reverse().map((day) => {
            const date = new Date(`${day.date}T12:00:00`);
            return (
              <div className="water-day-row" key={day.date}>
                <div>
                  <strong>{date.getMonth() + 1}/{date.getDate()}</strong>
                  <span>{day.totalMl} / {day.goalMl} ml</span>
                </div>
                <div className="water-day-progress" aria-hidden="true">
                  <span style={{ width: `${day.visualPercent}%` }} />
                </div>
                <strong className={day.completed ? "met" : ""}>{day.percent}%</strong>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function PageIntro({ title, text }) {
  return <header className="page-header secondary"><h1>{title}</h1><p>{text}</p></header>;
}

export default function App() {
  const [active, setActive] = useState("today");
  const [currentDateKey, setCurrentDateKey] = useState(() => getDateKey());
  const [state, setState] = useState(() => {
    let next = loadState();
    next = ensureDay(next, currentDateKey);
    next = ensureWaterDay(next, currentDateKey);
    next = ensureDay(next, getDateKey(addDays(new Date(), 1)));
    return next;
  });
  const theme = useTheme(state.themeId, (themeId) => setState((current) => ({ ...current, themeId })));
  const favorite = (id) => setState(current => ({ ...current, literaryFavorites: toggleLiteraryFavorite(current.literaryFavorites, id) }));

  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    const syncDate = () => setCurrentDateKey(getDateKey());
    const timer = window.setInterval(syncDate, 30_000);
    document.addEventListener("visibilitychange", syncDate);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", syncDate);
    };
  }, []);
  useEffect(() => {
    setState((current) => {
      let next = ensureDay(current, currentDateKey);
      next = ensureWaterDay(next, currentDateKey);
      next = ensureDay(next, getDateKey(addDays(new Date(), 1)));
      return next;
    });
  }, [currentDateKey]);

  let page;
  if (active === "today") page = <DayPage title="今日" date={new Date(`${currentDateKey}T12:00:00`)} state={state} setState={setState} isToday onLibrary={() => setActive('library')} onFavorite={favorite} />;
  if (active === "tomorrow") page = <DayPage title="明日计划" date={addDays(new Date(), 1)} state={state} setState={setState} />;
  if (active === "habits") page = <HabitsPage state={state} setState={setState} />;
  if (active === "workouts") page = <WorkoutsPage state={state} setState={setState} />;
  if (active === "weekly") page = <WeeklyPage state={state} />;
  if (active === "themes") page = <ThemeCenter theme={theme} />;
  if (active === "library") page = <LuminaLibrary favorites={state.literaryFavorites} onToggle={favorite} onBack={() => setActive('today')} />;

  return (
    <div className="app-shell">
      <main>{page}</main>
      <BottomNav active={active} onChange={setActive} />
    </div>
  );
}
