import { useState } from 'react';
import { categoryLabels, literaryQuotes } from '../../data/literaryQuotes.ts';
import { getDailyQuote } from '../../literary.ts';
import './literary.css';
import { decorationProps } from '../../config/decorations.js';
import { ThemeSticker } from '../theme-settings/ThemeDecoration';

function FavoriteButton({ quote, favorites, onToggle }) {
  const saved = favorites.includes(quote.id);
  return <button className="literary-favorite" aria-pressed={saved} aria-label={`${saved ? '取消收藏' : '收藏'}：${quote.quote}`} onClick={() => onToggle(quote.id)}>
    <span aria-hidden="true">{saved ? '♥' : '♡'}</span> {saved ? '已收藏' : '收藏'}
  </button>;
}

function QuoteDetails({ quote, favorites, onToggle }) {
  return <div className="literary-details">
    <p className="literary-translation" lang="zh-CN">{quote.translation}</p>
    <dl><div><dt>作者</dt><dd>{quote.author}</dd></div><div><dt>作品</dt><dd>{quote.work} · {quote.year}</dd></div></dl>
    <a className="literary-source" href={quote.sourceUrl} target="_blank" rel="noreferrer">原文出处 · {quote.location} ↗</a>
    <div className="literary-details-footer"><span>{categoryLabels[quote.category]} · {quote.location}</span><FavoriteButton quote={quote} favorites={favorites} onToggle={onToggle} /></div>
  </div>;
}

export function DailyLiteraryLine({ dateKey, favorites, onToggle, onLibrary, decorations }) {
  const quote = getDailyQuote(dateKey);
  const ornament = decorationProps(decorations).quote;
  return <section className="daily-literary-line" data-quote-style={ornament?.style} style={ornament ? { '--quote-ink': ornament.color, borderBottomStyle: ornament.divider } : undefined} aria-label="A Line for Today" key={quote.id}>
    <div className="literary-eyebrow"><span lang="en">A Line for Today</span><ThemeSticker material={ornament?.doodle} className="literary-doodle" /><button onClick={onLibrary} aria-label="打开 Lumina Library">Library <span aria-hidden="true">↗</span></button></div>
    <details className="literary-disclosure">
      <summary aria-label={`展开文学句子：${quote.quote}`}>
        <blockquote lang="en">{quote.quote}</blockquote>
        <cite lang="en">— {quote.author}, <span>{quote.work}</span></cite>
      </summary>
      <QuoteDetails quote={quote} favorites={favorites} onToggle={onToggle} />
    </details>
  </section>;
}

export function LuminaLibrary({ favorites, onToggle, onBack }) {
  const [category, setCategory] = useState('all');
  const savedQuotes = favorites.map(id => literaryQuotes.find(q => q.id === id)).filter(Boolean).reverse();
  const visible = savedQuotes.filter(q => category === 'all' || q.category === category);
  return <section className="lumina-library">
    <button className="text-button" onClick={onBack}>← 今日</button>
    <header className="page-header secondary"><h1 lang="en">Lumina Library</h1><p>留住与你相遇的文字。{savedQuotes.length} 条收藏</p></header>
    <label className="field library-filter"><span>按主题筛选</span><select value={category} onChange={event => setCategory(event.target.value)}>
      <option value="all">全部</option>{Object.entries(categoryLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
    </select></label>
    <div className="literary-library-list">
      {visible.map(quote => <article className="literary-library-item" key={quote.id}>
        <blockquote lang="en">{quote.quote}</blockquote><cite lang="en">— {quote.author}, {quote.work}</cite>
        <QuoteDetails quote={quote} favorites={favorites} onToggle={onToggle} />
      </article>)}
      {!visible.length ? <p className="literary-empty" role="status">{savedQuotes.length ? '这个分类还没有收藏。' : '还没有收藏。轻触今日的文学句子，把喜欢的文字留在这里。'}</p> : null}
    </div>
  </section>;
}
