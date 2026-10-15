// Shared visual bounds only. Drinking totals, settings and persistence stay in water.js.
export const CUP_GEOMETRY = Object.freeze({
  tumbler: { top: 96, bottom: 174, path: 'M86 96H133Q142 96 142 105V165Q142 174 133 174H86Q77 174 77 165V105Q77 96 86 96Z' },
  boba: { top: 74, bottom: 197, path: 'M62 74H167L156 186Q155 197 146 197H85Q77 197 76 187Z' },
  coffee: { top: 92, bottom: 182, path: 'M84 92H88Q93 92 93 97V177Q93 182 88 182H84Q79 182 79 177V97Q79 92 84 92Z' },
  mug: { top: 96, bottom: 190, path: 'M54 96Q110 92 167 97L164 169Q163 188 147 190H76Q58 189 56 172Z' },
});

export function fluidOffset(visualPercent, geometry) {
  const percent = Number.isFinite(visualPercent) ? Math.max(0, Math.min(100, visualPercent)) : 0;
  return geometry.bottom - (geometry.bottom - geometry.top) * percent / 100;
}

export function cupType(type) {
  return Object.hasOwn(CUP_GEOMETRY, type) ? type : 'mug';
}

export function cupVisualPercent(totalMl, goalMl) {
  return Number.isFinite(totalMl) && Number.isFinite(goalMl) && goalMl > 0
    ? Math.max(0, Math.min(100, totalMl / goalMl * 100)) : 0;
}
