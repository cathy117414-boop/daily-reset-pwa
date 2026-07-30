import { useState } from "react";
import { CheckIcon } from "./icons";
import { Field, Modal } from "./components";
import { waterProgress } from "./water";

function WaterAmountForm({ onSave, onClose }) {
  const [amount, setAmount] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const amountMl = Math.round(Number(amount));
    if (!Number.isFinite(amountMl) || amountMl <= 0) return;
    onSave(amountMl);
  };

  return (
    <form className="form-stack" onSubmit={submit}>
      <Field label="本次饮水量（ml）">
        <input
          type="number"
          min="1"
          max="10000"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="例如：350"
          required
          autoFocus
        />
      </Field>
      <div className="form-actions">
        <button type="button" className="text-button" onClick={onClose}>取消</button>
        <button className="primary-button">添加饮水</button>
      </div>
    </form>
  );
}

function WaterSettingsForm({ day, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    goalMl: String(day.goalMl),
    cupSizeMl: String(day.cupSizeMl),
  }));
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    onSave({
      goalMl: Math.round(Number(form.goalMl)),
      cupSizeMl: Math.round(Number(form.cupSizeMl)),
    });
  };

  return (
    <form className="form-stack" onSubmit={submit}>
      <Field label="每日目标容量（ml）">
        <input type="number" min="1" max="10000" inputMode="numeric" value={form.goalMl} onChange={update("goalMl")} required />
      </Field>
      <Field label="常用杯子容量（ml）">
        <input type="number" min="1" max="5000" inputMode="numeric" value={form.cupSizeMl} onChange={update("cupSizeMl")} required />
      </Field>
      <p className="form-help">新设置会用于今天和之后新建的日期，历史饮水记录不会改变。</p>
      <div className="form-actions">
        <button type="button" className="text-button" onClick={onClose}>取消</button>
        <button className="primary-button">保存设置</button>
      </div>
    </form>
  );
}

export function WaterCard({ day, onAdd, onUndo, onSettings }) {
  const [modal, setModal] = useState(null);
  const progress = waterProgress(day);
  const waterStyle = { "--water-level": `${progress.visualPercent}%` };

  const addCustom = (amountMl) => {
    onAdd(amountMl);
    setModal(null);
  };
  const saveSettings = (settings) => {
    onSettings(settings);
    setModal(null);
  };

  return (
    <section className={`water-card ${progress.completed ? "completed" : ""}`} aria-labelledby="water-title">
      <div className="water-heading">
        <div>
          <span className="water-kicker">每日喝水记录</span>
          <h2 id="water-title">今日饮水量</h2>
        </div>
        <button className="water-settings-button" onClick={() => setModal("settings")}>饮水设置</button>
      </div>

      <div className="water-content">
        <div className="water-cup-wrap" aria-hidden="true">
          <div className="water-cup">
            <div className="water-fill" style={waterStyle}>
              <span className="water-wave" />
            </div>
          </div>
          <span className="water-percent">{progress.percent}%</span>
        </div>

        <div className="water-details">
          <p className="water-total" aria-live="polite" aria-atomic="true">
            <strong>{progress.totalMl}</strong>
            <span> / {progress.goalMl} ml</span>
          </p>
          <p className="water-cups">已喝 {progress.wholeCups} 杯，合计 {progress.totalMl}ml</p>
          {progress.completed ? (
            <div className="water-success"><CheckIcon size={18} /><span>今日喝水目标完成啦！</span></div>
          ) : (
            <p className="water-remaining">还差 <strong>{progress.remainingMl}ml</strong></p>
          )}
          {progress.excessMl > 0 ? <p className="water-excess">已超出目标 {progress.excessMl}ml，仍可继续记录</p> : null}
        </div>
      </div>

      <div className="water-actions">
        <button className="water-primary" onClick={() => onAdd(progress.cupSizeMl)}>
          <strong>＋{progress.cupSizeMl}ml</strong>
          <span>喝完一杯</span>
        </button>
        <button onClick={() => onAdd(200)}>＋200ml</button>
        <button onClick={() => setModal("custom")}>自定义</button>
        <button onClick={onUndo} disabled={!progress.entries.length}>撤销上一次</button>
      </div>

      {modal === "custom" ? (
        <Modal title="自定义饮水量" onClose={() => setModal(null)}>
          <WaterAmountForm onSave={addCustom} onClose={() => setModal(null)} />
        </Modal>
      ) : null}
      {modal === "settings" ? (
        <Modal title="饮水设置" onClose={() => setModal(null)}>
          <WaterSettingsForm day={progress} onSave={saveSettings} onClose={() => setModal(null)} />
        </Modal>
      ) : null}
    </section>
  );
}
