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
        <path d="M0 0Q60-3 120 0T240 0V230H0Z" fill="var(--cup-water)" fillOpacity=".8" />
        <path d="M0 0Q60-3 120 0T240 0" stroke="var(--cup-water)" strokeWidth="2" fill="none" />
      </g>
    </g>
  </g>;
}

export function StanleyCup({ config, fluid }) {
  return <g className="cup-body-art" data-cup-renderer="tumbler" transform="translate(-10 0)">
    <path data-part="handle" d="M160 82H181Q202 82 202 104V151Q202 169 181 169H164" stroke="var(--cup-outline)" strokeWidth="17" fill="none" />
    <path d="M160 82H181Q202 82 202 104V151Q202 169 181 169H164" stroke="var(--cup-handle)" strokeWidth="13" fill="none" />
    {config.straw ? <path data-part="straw" d="m135 66 5-49q0-4 4-4" stroke="var(--cup-straw)" strokeWidth="7" strokeLinecap="round" fill="none" /> : null}
    <path d="M59 65H157L165 185Q166 204 146 204H69Q49 204 49 186Z" fill="var(--cup-body)" stroke="var(--cup-outline)" strokeWidth="1.8" />
    <path d="m59 76-4 103q-1 12 9 15" stroke="var(--cup-secondary)" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d={CUP_GEOMETRY.tumbler.path} fill="var(--cup-secondary)" />
    {fluid}
    <path data-part="progress-window" d={CUP_GEOMETRY.tumbler.path} stroke="var(--cup-rim)" strokeWidth="1.3" fill="none" />
    <rect data-part="lid" x="51" y="58" width="113" height="16" rx="6" fill="var(--cup-lid)" stroke="var(--cup-outline)" strokeWidth="1.5" />
    <ellipse cx="108" cy="58" rx="55" ry="5" fill="var(--cup-secondary)" stroke="var(--cup-rim)" strokeWidth="1.2" />
    <CupArt material={config.sticker} x={55} y={163} size={32} />
    <CupArt material={config.secondaryDecoration} x={142} y={76} size={22} doodle />
  </g>;
}

const pearlPositions = [[83,184,4.8],[96,189,5.1],[110,183,4.7],[124,191,5],[140,185,5.2],[150,191,4.4],[91,175,4.4],[122,175,4.8],[140,174,4.2]];
export function BobaCup({ config, fluid }) {
  return <g className="cup-body-art" data-cup-renderer="boba" transform="translate(5 0)">
    {config.straw ? <g data-part="straw"><path d="m131 113 8-96" stroke="var(--cup-straw)" strokeWidth="12" strokeLinecap="round" /><path d="m136 30 1-9" stroke="var(--cup-secondary)" strokeWidth="4" strokeLinecap="round" /></g> : null}
    <path d="M56 65H174L161 190Q160 201 149 201H82Q72 201 70 190Z" fill="var(--cup-body)" fillOpacity=".7" stroke="var(--cup-outline)" strokeWidth="1.7" />
    {fluid}
    {config.pearls ? <g data-part="pearls" fill={config.pearls.color}><clipPath id={`${config.clipId}-pearls`}><path d={CUP_GEOMETRY.boba.path} /></clipPath><g clipPath={`url(#${config.clipId}-pearls)`}>{pearlPositions.map(([cx,cy,r],i)=><circle key={i} data-pearl="true" cx={cx} cy={cy} r={r} />)}</g></g> : null}
    <path d="m64 80 10 94" stroke="var(--cup-secondary)" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    <rect data-part="lid" x="52" y="60" width="126" height="10" rx="4" fill="var(--cup-lid)" stroke="var(--cup-rim)" strokeWidth="1.3" />
    <path d="M59 63h108" stroke="var(--cup-secondary)" strokeWidth="2" strokeLinecap="round" />
    <CupArt material={config.sticker} x={107} y={102} size={29} />
    <CupArt material={config.secondaryDecoration} x={147} y={144} size={21} doodle />
  </g>;
}

export function CoffeeCup({ config, fluid }) {
  return <g className="cup-body-art" data-cup-renderer="coffee" transform="translate(3 -7)">
    <path d="M68 66H168L153 198Q151 205 143 205H92Q84 205 83 198Z" fill="var(--cup-body)" stroke="var(--cup-outline)" strokeWidth="1.6" />
    <path data-part="sleeve" d="m73 113 90 1-5 44-80-1Z" fill="var(--cup-accent)" fillOpacity=".55" stroke="var(--cup-rim)" strokeWidth=".7" />
    <path d="m101 122 36 1m-38 5 23 1m-23 19 42 1" stroke="var(--cup-secondary)" strokeWidth=".7" opacity=".5" />
    <path d={CUP_GEOMETRY.coffee.path} fill="var(--cup-secondary)" />
    {fluid}
    <path data-part="progress-window" d={CUP_GEOMETRY.coffee.path} fill="none" stroke="var(--cup-rim)" strokeWidth="1" />
    <path data-part="lid" d="m65 52 6-9h91l6 9 6 5v10H60V57Z" fill="var(--cup-lid)" stroke="var(--cup-outline)" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M73 48q43-4 83 0M65 59h103" stroke="var(--cup-secondary)" strokeWidth="2" strokeLinecap="round" />
    <CupArt material={config.sticker} x={113} y={123} size={25} />
    <CupArt material={config.secondaryDecoration} x={140} y={78} size={20} doodle />
  </g>;
}

export function CeramicMug({ config, fluid }) {
  return <g className="cup-body-art" data-cup-renderer="mug" transform="translate(-10 -18)">
    <path data-part="handle" d="M170 103C219 85 224 174 169 172" fill="none" stroke="var(--cup-outline)" strokeWidth="20" />
    <path d="M170 103C219 85 224 174 169 172" fill="none" stroke="var(--cup-handle)" strokeWidth="16" />
    <path d="M47 85Q109 80 174 86l-3 85q0 27-25 28H77q-25 0-27-26Z" fill="var(--cup-body)" stroke="var(--cup-outline)" strokeWidth="1.7" />
    {fluid}
    <path d="m58 108 2 56q0 17 9 20" stroke="var(--cup-secondary)" strokeWidth="3.5" opacity=".7" strokeLinecap="round" fill="none" />
    <ellipse data-part="rim" cx="110" cy="86" rx="63" ry="10" fill="var(--cup-rim)" stroke="var(--cup-outline)" strokeWidth="1.5" />
    <ellipse cx="110" cy="85" rx="55" ry="5" fill="var(--cup-secondary)" />
    <path d="m73 191 5 1m25 1h3m24-2 5-1" stroke="var(--cup-rim)" strokeWidth="1.4" opacity=".5" strokeLinecap="round" />
    <CupArt material={config.sticker} x={136} y={160} size={30} />
    <CupArt material={config.secondaryDecoration} x={48} y={95} size={24} doodle />
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
      <svg className="hydration-cup-svg" viewBox="0 0 240 220" width="240" height="220" aria-hidden="true" focusable="false">
        <Renderer config={{ ...config, clipId: id }} fluid={<Fluid id={id} geometry={CUP_GEOMETRY[type]} percent={cupVisualPercent(progress.totalMl, progress.goalMl)} />} />
        {progress.completed ? <CompletionFeedback material={config.completion} /> : null}
      </svg>
    </div>
  </div>;
}
