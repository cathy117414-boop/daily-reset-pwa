import { useEffect } from "react";
import {
  CalendarIcon,
  ChartIcon,
  CheckIcon,
  CloseIcon,
  DumbbellIcon,
  EditIcon,
  HabitIcon,
  ListIcon,
  PlusIcon,
  TrashIcon,
} from "./icons";

export const NAV_ITEMS = [
  { id: "today", label: "今日", Icon: CalendarIcon },
  { id: "tomorrow", label: "明日计划", Icon: ListIcon },
  { id: "habits", label: "固定习惯", Icon: HabitIcon },
  { id: "workouts", label: "健身记录", Icon: DumbbellIcon },
  { id: "weekly", label: "每周回顾", Icon: ChartIcon },
];

export function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="主要页面">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-item ${active === id ? "active" : ""}`}
          onClick={() => onChange(id)}
          aria-current={active === id ? "page" : undefined}
        >
          <span className="nav-icon"><Icon /></span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export function ProgressPanel({ completed, total, percent }) {
  const progressStyle = { "--progress": `${percent * 3.6}deg` };
  return (
    <section className="progress-panel" aria-label={`今日完成进度 ${percent}%`}>
      <div>
        <h2>今日进度</h2>
        <p className="progress-count"><strong>{completed}</strong> / {total} <span>已完成</span></p>
        <div className="linear-progress" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
      </div>
      <div className="progress-ring" style={progressStyle}><span>{percent}<small>%</small></span></div>
    </section>
  );
}

export function TaskList({ tasks, onToggle, onEdit, onDelete, emptyText = "这一天还没有安排" }) {
  if (!tasks.length) return <div className="empty-state">{emptyText}</div>;

  return (
    <div className="timeline">
      {[...tasks].sort((a, b) => a.time.localeCompare(b.time)).map((task) => (
        <article className={`task-row ${task.completed ? "completed" : ""}`} key={task.id}>
          <div className="time-cell">
            <button className="timeline-check" onClick={() => onToggle(task.id)} aria-label={`${task.completed ? "取消完成" : "标记完成"} ${task.name}`}>
              {task.completed ? <CheckIcon size={17} /> : null}
            </button>
            <time>{task.time}</time>
          </div>
          <div className="task-main">
            <div className="task-title-line">
              <span className={`module module-${task.module}`}>{task.module}</span>
              <span className="divider" />
              <h3>{task.name}</h3>
            </div>
            <p>{task.note}</p>
          </div>
          <div className="row-actions">
            <button onClick={() => onEdit(task)} aria-label={`编辑 ${task.name}`}><EditIcon size={19} /></button>
            <button onClick={() => onDelete(task.id)} aria-label={`删除 ${task.name}`}><TrashIcon size={18} /></button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function AddButton({ children = "添加安排", onClick }) {
  return <button className="outline-button" onClick={onClick}><PlusIcon size={19} />{children}</button>;
}

export function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handleKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header><h2 id="modal-title">{title}</h2><button onClick={onClose} aria-label="关闭"><CloseIcon /></button></header>
        {children}
      </section>
    </div>
  );
}

export function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
