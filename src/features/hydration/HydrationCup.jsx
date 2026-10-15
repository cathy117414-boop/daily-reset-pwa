import { useId, useState } from 'react';
import { stickerProps } from '../../config/decorations.js';
import { themeAssetUrl } from '../../config/themes.js';
import { CUP_GEOMETRY, cupType, cupVisualPercent, fluidOffset } from './cupGeometry.js';
import './hydration.css';

const fallbackColors = {
  bodyColor: '#DDE5D4', bodySecondaryColor: '#F2EEE0', rimColor: '#A69A7C',
  lidColor: '#DED4BC', handleColor: '#C9D6C0', strawColor: '#BDA77D',
  accentColor: '#7C9275', waterColor: '#B0C7CC', outlineColor: '#85917B',
};

function CupArt({ material, x, y, size, doodle = false }) {
  const [failed, setFailed] = useState(null);
  const safe = stickerProps(material);
  if (!safe?.asset || failed === safe.asset) return null;
  return <image className={doodle ? 'cup-doodle' : 'cup-sticker'} href={themeAssetUrl(safe.asset)} x={x} y={y} width={size} height={size} preserveAspectRatio="xMidYMid meet" aria-hidden="true" onError={() => setFailed(safe.asset)} />;
}

function Fluid({ id, geometry, percent }) {
  return <g className="cup-tank" data-top={geometry.top} data-bottom={geometry.bottom}>
    <defs><clipPath id={id} clipPathUnits="userSpaceOnUse"><path d={geometry.path} /></clipPath></defs>
    <g clipPath={`url(#${id})`}>
      <g className="cup-liquid" data-visual-percent={percent} style={{ transform: `translateY(${fluidOffset(percent, geometry)}px)`, opacity: percent > 0 ? 1 : 0 }}>
        <path d="M0 0Q60-1.5 120 0T240 0V230H0Z" fill="var(--cup-water)" fillOpacity=".8" />
        <path d="M0 0Q60-1.5 120 0T240 0" stroke="var(--cup-water)" strokeWidth="1.2" strokeOpacity=".6" fill="none" />
      </g>
    </g>
  </g>;
}

export function StanleyCup({ config, fluid }) {
  return <g className="cup-body-art" data-cup-renderer="tumbler" transform="translate(-18 0) scale(1 1.06)">
    <path data-part="handle" d="M164 68H190Q220 68 220 93V169Q220 194 196 194H157" stroke="var(--cup-outline)" strokeWidth="17" strokeLinejoin="round" fill="none" />
    <path d="M164 68H190Q220 68 220 93V169Q220 194 196 194H157" stroke="var(--cup-handle)" strokeWidth="14" fill="none" />
    {config.straw ? <path data-part="straw" d="m136 57 7-46q1-6 5-6" stroke="var(--cup-straw)" strokeWidth="5.5" strokeLinecap="round" fill="none" /> : null}
    <path data-part="body" d="M52 58H166L153 201Q151 225 135 226H83Q66 225 64 203Z" fill="var(--cup-body)" stroke="var(--cup-outline)" strokeWidth="1.5" />
    <path d="m59 74 11 126q1 13 9 16" stroke="var(--cup-secondary)" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d={CUP_GEOMETRY.tumbler.path} fill="var(--cup-secondary)" />
    {fluid}
    <path data-part="progress-window" d={CUP_GEOMETRY.tumbler.path} stroke="var(--cup-rim)" strokeOpacity=".6" strokeWidth="1" fill="none" />
    <rect data-part="lid" x="44" y="54" width="130" height="11" rx="5" fill="var(--cup-lid)" stroke="var(--cup-outline)" strokeWidth="1.4" />
    <ellipse cx="109" cy="54" rx="64" ry="3.5" fill="var(--cup-secondary)" stroke="var(--cup-rim)" strokeWidth="1" />
    <CupArt material={config.sticker} x={68} y={163} size={40} />
    <g transform="rotate(-12 151 96)"><CupArt material={config.secondaryDecoration} x={140} y={83} size={20} doodle /></g>
    <CupArt material={config.secondaryDecoration} x={151} y={109} size={11} doodle />
  </g>;
}

const pearlPositions = [[87,202,4.3],[100,208,5.2],[112,198,4.6],[127,208,4.8],[143,204,5.1],[148,192,3.9],[95,188,4.1],[120,186,4.7],[135,194,4.3]];
export function BobaCup({ config, fluid }) {
  return <g className="cup-body-art" data-cup-renderer="boba" transform="translate(9.6 0) scale(.96 1)">
    {config.straw ? <g data-part="straw"><path d="m130 118 9-107" stroke="var(--cup-straw)" strokeWidth="14" strokeLinecap="round" /><path d="m137 25 1-10" stroke="var(--cup-secondary)" strokeWidth="4" strokeLinecap="round" /></g> : null}
    <path data-part="body" d="M58 59H172L159 203Q158 218 146 219H86Q74 218 73 204Z" fill="var(--cup-body)" fillOpacity=".62" stroke="var(--cup-outline)" strokeWidth="1.5" />
    {fluid}
    {config.pearls ? <g data-part="pearls" fill={config.pearls.color}><clipPath id={`${config.clipId}-pearls`}><path d={CUP_GEOMETRY.boba.path} /></clipPath><g clipPath={`url(#${config.clipId}-pearls)`}>{pearlPositions.map(([cx,cy,r],i)=><circle key={i} data-pearl="true" cx={cx} cy={cy} r={r} />)}</g></g> : null}
    <path d="m66 76 11 109" stroke="var(--cup-secondary)" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    <rect data-part="lid" x="53" y="56" width="124" height="9" rx="4" fill="var(--cup-lid)" stroke="var(--cup-rim)" strokeWidth="1.2" />
    <path d="M60 59h108" stroke="var(--cup-secondary)" strokeWidth="2" strokeLinecap="round" />
    <CupArt material={config.sticker} x={100} y={95} size={35} />
    <CupArt material={config.secondaryDecoration} x={142} y={149} size={19} doodle />
  </g>;
}

export function CoffeeCup({ config, fluid }) {
  return <g className="cup-body-art" data-cup-renderer="coffee" transform="translate(3 0)">
    <defs><pattern id={`${config.clipId}-paper`} width="13" height="11" patternUnits="userSpaceOnUse"><path d="m2 3 2 .2m5 4 1-.2M6 10h2" stroke="var(--cup-outline)" strokeWidth=".65" opacity=".14" /></pattern></defs>
    <path data-part="body" d="M62 67H174L153 192Q151 200 143 200H94Q85 200 83 191Z" fill="var(--cup-body)" stroke="var(--cup-outline)" strokeWidth="1.5" />
    <path data-part="sleeve" d="m70 112 96 1-7 43-81-1Z" fill="var(--cup-accent)" fillOpacity=".5" stroke="var(--cup-rim)" strokeWidth=".6" />
    <path d="m70 112 96 1-7 43-81-1Z" fill={`url(#${config.clipId}-paper)`} />
    <path d={CUP_GEOMETRY.coffee.path} fill="var(--cup-secondary)" fillOpacity=".5" />
    {fluid}
    <path data-part="progress-window" d={CUP_GEOMETRY.coffee.path} fill="none" stroke="var(--cup-rim)" strokeOpacity=".3" strokeWidth=".65" />
    <path data-part="lid" d="M60 58q1-5 7-8l4-6q1-3 7-3h80q7 0 9 4l4 6q6 2 6 7v7q0 4-5 4H63q-6 0-6-4Z" fill="var(--cup-lid)" stroke="var(--cup-outline)" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M76 46q40-3 80 0M63 61q56 2 109 0" stroke="var(--cup-secondary)" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    <CupArt material={config.sticker} x={123} y={119} size={21} />
    <g opacity=".75"><CupArt material={config.secondaryDecoration} x={134} y={137} size={16} doodle /></g>
  </g>;
}

export function CeramicMug({ config, fluid }) {
  return <g className="cup-body-art" data-cup-renderer="mug" transform="translate(-10 0)">
    <defs><pattern id={`${config.clipId}-glaze`} width="19" height="17" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r=".6" fill="var(--cup-rim)" opacity=".12" /><path d="m12 12 2-.4" stroke="var(--cup-secondary)" strokeWidth="1.3" opacity=".25" strokeLinecap="round" /></pattern></defs>
    <path data-part="handle" d="M174 109C211 91 228 122 215 151C207 171 190 181 173 170" fill="none" stroke="var(--cup-outline)" strokeWidth="20" strokeLinecap="round" />
    <path d="M174 109C211 91 228 122 215 151C207 171 190 181 173 170" fill="none" stroke="var(--cup-handle)" strokeWidth="17" strokeLinecap="round" />
    <path data-part="body" d="M43 92Q108 86 178 94l-4 72q-1 28-27 29H74q-25-1-27-24Z" fill="var(--cup-body)" stroke="var(--cup-outline)" strokeWidth="1.5" />
    {fluid}
    <path d="M43 92Q108 86 178 94l-4 72q-1 28-27 29H74q-25-1-27-24Z" fill={`url(#${config.clipId}-glaze)`} />
    <path d="m56 115 2 50q0 16 9 19" stroke="var(--cup-secondary)" strokeWidth="3.5" opacity=".7" strokeLinecap="round" fill="none" />
    <ellipse data-part="rim" cx="110" cy="93" rx="67" ry="14" fill="var(--cup-rim)" stroke="var(--cup-outline)" strokeWidth="1.5" />
    <ellipse cx="110" cy="92" rx="58" ry="9.5" fill="var(--cup-secondary)" />
    <ellipse cx="110" cy="95" rx="52" ry="4.5" fill="var(--cup-water)" opacity={config.visualPercent > 0 ? .2 : 0} />
    <path d="m72 187 5 1m25 1h3m25-2 5-1" stroke="var(--cup-rim)" strokeWidth="1.2" opacity=".5" strokeLinecap="round" />
    <CupArt material={config.sticker} x={140} y={157} size={30} />
    <CupArt material={config.secondaryDecoration} x={49} y={106} size={26} doodle />
  </g>;
}

function CompletionFeedback({ material }) {
  if (!material) return null;
  if (material.type === 'check') return <g className="cup-completion" aria-hidden="true"><path d="m184 74 5 5 10-13" stroke="var(--cup-accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
  const points = material.type === 'stars' ? [[177,37,17],[196,52,12],[194,27,11]] : material.type === 'hearts' ? [[156,27,26]] : [[190,68,24]];
  return <g className="cup-completion" aria-hidden="true">{points.map(([x,y,size],i)=><CupArt key={i} material={material} x={x} y={y} size={size} doodle />)}</g>;
}

const renderers = { tumbler: StanleyCup, boba: BobaCup, coffee: CoffeeCup, mug: CeramicMug };
export function HydrationCup({ progress, config = {} }) {
  const id = `hydration-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const type = cupType(config.type);
  const Renderer = renderers[type];
  const style = Object.fromEntries(Object.entries(fallbackColors).map(([key,value]) => [
    `--cup-${({ bodyColor:'body',bodySecondaryColor:'secondary',rimColor:'rim',lidColor:'lid',handleColor:'handle',strawColor:'straw',accentColor:'accent',waterColor:'water',outlineColor:'outline' })[key]}`,
    /^#[\da-f]{6}$/i.test(config[key] || '') ? config[key] : value,
  ]));
  return <div className="hydration-cup" role="img" aria-label={`今日饮水 ${progress.totalMl} / ${progress.goalMl} 毫升，${progress.percent}%`} style={style} data-cup-type={type}>
    <div className="hydration-cup-scene" key={type}>
      <svg className="hydration-cup-svg" viewBox={CUP_GEOMETRY[type].viewBox} width="240" height="220" aria-hidden="true" focusable="false">
        <Renderer config={{ ...config, clipId: id, visualPercent: cupVisualPercent(progress.totalMl, progress.goalMl) }} fluid={<Fluid id={id} geometry={CUP_GEOMETRY[type]} percent={cupVisualPercent(progress.totalMl, progress.goalMl)} />} />
        {progress.completed ? <CompletionFeedback material={config.completion} /> : null}
      </svg>
    </div>
  </div>;
}
