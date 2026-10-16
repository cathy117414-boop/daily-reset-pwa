import { useState } from 'react';
import { AddButton, Field, Modal } from '../../components';
import { CareIcon, CheckIcon, EditIcon, TrashIcon } from '../../icons';
import { ThemeSticker } from '../theme-settings/ThemeDecoration';
import { formatLocalDate } from '../../dates';
import { WEEKDAYS, addExtraCare, careForToday, careItemFromInput, completeCareItem, deleteCareItem, frequencyLabel, isCompletedToday, saveCareItem, snoozeCareItemToTomorrow } from './skinCare';
import './skinCare.css';

const freshItem = () => ({ name: '', type: 'routine', frequency: { mode: 'daily', days: null, weekdays: [] }, lastCompletedAt: '', startMode: 'due' });

function CareItemForm({ initial, today, onSave, onClose }) {
  const [form, setForm] = useState(() => initial ? { ...initial, lastCompletedAt: initial.lastCompletedAt || '' } : freshItem());
  const [error, setError] = useState('');
  const update = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  const updateFrequency = event => setForm(current => ({ ...current, frequency: { mode: event.target.value, days: current.frequency.days || 7, weekdays: current.frequency.weekdays.length ? current.frequency.weekdays : [1, 4] } }));
  const changeType = event => setForm(current => ({ ...current, type: event.target.value, lastCompletedAt: '', startMode: 'due', frequency: { mode: event.target.value === 'routine' ? 'daily' : 'interval', days: 7, weekdays: [] } }));
  const preview = careItemFromInput(form, today, initial);
  const submit = event => {
    event.preventDefault();
    if (!form.name.trim()) return setError('请填写项目名称。');
    if (form.frequency.mode === 'weekdays' && !form.frequency.weekdays.length) return setError('请选择至少一个护理日。');
    onSave(form);
  };
  return <form className="form-stack care-form" onSubmit={submit}>
    <Field label="Name · 名称"><input value={form.name} onChange={update('name')} required autoFocus placeholder="例如：Hand Mask" /></Field>
    <Field label="Type · 类型"><select value={form.type} onChange={changeType}><option value="routine">Routine · 固定护理</option><option value="periodic">Periodic · 周期护理</option></select></Field>
    <Field label="Frequency · 频率"><select value={form.frequency.mode} onChange={updateFrequency}>
      {form.type === 'routine' ? <><option value="daily">Daily</option><option value="weekdays">Specific weekdays</option></> : <><option value="interval">Every X days</option><option value="weekly">Weekly · 每次完成后 7 天</option></>}
    </select></Field>
    {form.frequency.mode === 'interval' ? <Field label="Interval · 间隔天数"><input type="number" inputMode="numeric" min="1" max="365" required value={form.frequency.days} onChange={event => setForm(current => ({ ...current, frequency: { ...current.frequency, days: event.target.value } }))} /></Field> : null}
    {form.frequency.mode === 'weekdays' ? <fieldset className="care-weekdays"><legend>护理日</legend><div>{WEEKDAYS.map(({ day, label }) => <label key={day}><input type="checkbox" checked={form.frequency.weekdays.includes(day)} onChange={() => setForm(current => ({ ...current, frequency: { ...current.frequency, weekdays: current.frequency.weekdays.includes(day) ? current.frequency.weekdays.filter(value => value !== day) : [...current.frequency.weekdays, day] } }))} /><span>{label}</span></label>)}</div></fieldset> : null}
    {form.type === 'periodic' ? <>
      <Field label="Last Completed · 上次正式完成（可选）"><input type="date" max={today} value={form.lastCompletedAt} onChange={update('lastCompletedAt')} /></Field>
      {!form.lastCompletedAt ? <><Field label="首次安排"><select value={form.startMode} onChange={update('startMode')}><option value="due">Due Today · 今天就提醒</option><option value="start">Start From Today · 从今天起算</option></select></Field><p className="form-help">起算日期不是完成记录，不需要填写虚构的上次完成日期。</p></> : null}
      {preview?.nextDueAt ? <p className="care-schedule-preview" aria-live="polite">Next · {formatLocalDate(preview.nextDueAt)}<span>以后会从实际完成日自动重新起算。</span></p> : null}
    </> : null}
    {error ? <p className="care-form-error" role="alert">{error}</p> : null}
    <div className="form-actions"><button type="button" className="text-button" onClick={onClose}>取消</button><button className="primary-button">Save Care Item</button></div>
  </form>;
}

function ExtraCareForm({ items, onSave, onClose }) {
  const [careId, setCareId] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('');
  const item = items.find(care => care.id === careId);
  return <form className="form-stack care-form" onSubmit={event => { event.preventDefault(); if (!item && !name.trim()) return; if (item?.type === 'periodic' && !mode) return; onSave({ careId: item?.id, name, countsAsCompletion: mode === 'completed' }); }}>
    <Field label="Care item · 选择项目"><select value={careId} onChange={event => { setCareId(event.target.value); setMode(''); }}><option value="">Custom Care · 自定义</option>{items.filter(care => care.enabled).map(care => <option key={care.id} value={care.id}>{care.name}</option>)}</select></Field>
    {!item ? <Field label="Extra care name · 自定义名称"><input value={name} onChange={event => setName(event.target.value)} required autoFocus placeholder="例如：Foot soak" /></Field> : null}
    {item?.type === 'periodic' ? <fieldset className="care-extra-modes"><legend>这次要调整正式周期吗？</legend>
      <label><input type="radio" name="extra-mode" value="extra" checked={mode === 'extra'} onChange={() => setMode('extra')} required /><span><strong>Just Extra</strong><small>只记录额外护理，不改变原周期。</small></span></label>
      <label><input type="radio" name="extra-mode" value="completed" checked={mode === 'completed'} onChange={() => setMode('completed')} required /><span><strong>Count as Completed</strong><small>这次算正式完成，从今天重新起算。</small></span></label>
    </fieldset> : <p className="form-help">只记录今天，不会自动创建 Routine 或改变周期。</p>}
    <div className="form-actions"><button type="button" className="text-button" onClick={onClose}>取消</button><button className="primary-button">Add Extra Care</button></div>
  </form>;
}

function CareMark({ style }) {
  return <span className="care-card-icon" data-icon-style={style}><CareIcon size={25} /></span>;
}

export function SkinCarePage({ skin, today, onChange, decorations }) {
  const [managing, setManaging] = useState(false);
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const list = careForToday(skin, today);
  const close = () => setModal(null);
  const done = (item, source) => {
    onChange(current => completeCareItem(current, item.id, today, source));
    setMessage(`${item.name} · Done tonight`);
  };
  const save = form => { onChange(current => saveCareItem(current, form, today)); close(); };

  return <div className="skin-care-page">
    <header className="care-page-header">
      <div className="date-line">{formatLocalDate(today, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div className="care-page-heading"><div><span className="care-eyebrow">SKIN CARE</span><h1>{managing ? 'Manage Routine' : 'Tonight’s Care'}</h1></div><ThemeSticker material={decorations?.primarySticker} className="care-header-sticker" /></div>
      <p>{managing ? '把想做的护理留下，日期交给 Lumina。' : '一点温柔的照顾，按今晚的心情来。'}</p>
      {managing ? <button className="text-button care-back" onClick={() => setManaging(false)}>← Tonight’s Care</button> : <button className="text-button care-manage" onClick={() => setManaging(true)}>Manage Routine →</button>}
    </header>
    <p className="care-live-message" role="status">{message}</p>
    {managing ? <section className="care-section" aria-labelledby="care-manage-title">
      <div className="care-section-heading"><h2 id="care-manage-title">Your care items</h2><AddButton onClick={() => setModal({ kind: 'item' })}>Add Care Item</AddButton></div>
      {!skin.items.length ? <div className="care-empty">从一项今晚想做的护理开始。</div> : <div className="care-list">{skin.items.map(item => <article className="care-card care-manage-card" key={item.id}>
        <CareMark style={decorations?.sectionIconStyle} /><div className="care-card-copy"><h3>{item.name}</h3><p>{item.type === 'routine' ? 'Routine' : 'Periodic'} · {frequencyLabel(item.frequency)}</p>{item.type === 'periodic' ? <small>Last · {formatLocalDate(item.lastCompletedAt)}<br />Next · {formatLocalDate(item.nextDueAt)}</small> : null}</div>
        <div className="care-manage-actions"><button aria-label={`Edit ${item.name}`} onClick={() => setModal({ kind: 'item', item })}><EditIcon size={18} /></button><button aria-label={`Delete ${item.name}`} onClick={() => setModal({ kind: 'delete', item })}><TrashIcon size={18} /></button></div>
      </article>)}</div>}
    </section> : <>
      <section className="care-section" aria-labelledby="care-routine-title"><div className="care-section-heading"><h2 id="care-routine-title">Routine</h2><span>今晚的基础护理</span></div>
        {!list.routine.length ? <div className="care-empty"><p>今晚没有固定护理，轻松一点也很好。</p><button className="text-button" onClick={() => setModal({ kind: 'item' })}>Add Care Item</button></div> : <div className="care-routine-grid">{list.routine.map(item => {
          const completed = isCompletedToday(skin, item.id, today);
          return <article className={`care-card care-routine-card ${completed ? 'care-is-done' : ''}`} key={item.id}>
            <CareMark style={decorations?.sectionIconStyle} /><button className="care-check" disabled={completed} aria-label={completed ? `${item.name} · Done tonight` : `Done ${item.name}`} onClick={() => done(item, 'routine')}>{completed ? <CheckIcon size={18} /> : null}</button>
            <div className="care-card-copy"><h3>{item.name}</h3><p>{completed ? 'Done tonight' : frequencyLabel(item.frequency)}</p></div>
          </article>;
        })}</div>}
      </section>
      <section className="care-section" aria-labelledby="care-due-title"><div className="care-section-heading"><h2 id="care-due-title">Due Today</h2><span>到了适合照顾的日子</span></div>
        {!list.due.length ? <div className="care-empty">Nothing extra is due tonight ✦</div> : <div className="care-list">{list.due.map(item => {
          const completed = isCompletedToday(skin, item.id, today);
          const content = <><CareMark style={decorations?.sectionIconStyle} /><div className="care-card-copy"><h3>{item.name}</h3><p>{completed ? 'Done tonight' : frequencyLabel(item.frequency)}</p><small>{completed ? `Next · ${formatLocalDate(item.nextDueAt)}` : `Last · ${formatLocalDate(item.lastCompletedAt)}`}</small>{!completed ? <span className="care-due-label">Due tonight</span> : null}</div><span className="care-due-mark" aria-hidden="true">{completed ? <CheckIcon size={18} /> : '＋'}</span></>;
          return completed ? <article key={item.id} className="care-card care-due-card care-is-done">{content}</article> : <details key={item.id} className="care-card care-due-details"><summary aria-label={`Care options ${item.name}`}>{content}</summary><div className="care-card-actions"><button className="primary-button" onClick={() => done(item, 'due')}>Done</button><button className="text-button" onClick={() => { onChange(current => snoozeCareItemToTomorrow(current, item.id, today)); setMessage(`${item.name} · 明晚再提醒`); }}>Tomorrow</button></div></details>;
        })}</div>}
      </section>
      <section className="care-section" aria-labelledby="care-extra-title"><div className="care-section-heading care-extra-heading"><h2 id="care-extra-title">Extra Care Today</h2><AddButton onClick={() => setModal({ kind: 'extra' })}>Add Extra Care</AddButton></div>
        {!list.extra.length ? <div className="care-empty"><p>Feel like a little extra care?</p><button className="text-button" onClick={() => setModal({ kind: 'extra' })}>＋ Add something</button></div> : <div className="care-list">{list.extra.map(log => <article key={log.id} className="care-card care-extra-card"><span className="care-card-icon"><CheckIcon size={22} /></span><div className="care-card-copy"><h3>{log.name}</h3><p>Extra tonight</p>{log.countsAsCompletion ? <small>Counted as completed</small> : null}</div></article>)}</div>}
      </section>
    </>}
    {modal?.kind === 'item' ? <Modal title={modal.item ? 'Edit Care Item' : 'Add Care Item'} onClose={close}><CareItemForm initial={modal.item} today={today} onSave={save} onClose={close} /></Modal> : null}
    {modal?.kind === 'extra' ? <Modal title="Add Extra Care" onClose={close}><ExtraCareForm items={skin.items} onClose={close} onSave={input => { onChange(current => addExtraCare(current, input, today)); setMessage('Extra care 已记下，今晚温柔一点。'); close(); }} /></Modal> : null}
    {modal?.kind === 'delete' ? <Modal title="Delete Care Item" onClose={close}><div className="form-stack care-form"><p className="care-delete-name">确定删除「{modal.item.name}」吗？过去的完成与额外护理记录会保留。</p><div className="form-actions"><button className="text-button" onClick={close}>取消</button><button className="primary-button" onClick={() => { onChange(current => deleteCareItem(current, modal.item.id)); close(); }}>Delete Care Item</button></div></div></Modal> : null}
  </div>;
}
