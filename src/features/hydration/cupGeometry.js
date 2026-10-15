// Shared visual bounds only. Drinking totals, settings and persistence stay in water.js.
export const CUP_GEOMETRY = Object.freeze({
  tumbler: { top: 86, bottom: 201, viewBox: '0 0 240 244', path: 'M109 86H113Q126 86 126 99V188Q126 201 113 201H109Q96 201 96 188V99Q96 86 109 86Z' },
  boba: { top: 68, bottom: 214, viewBox: '0 0 240 230', path: 'M65 68H165L153 202Q152 214 142 214H89Q80 214 79 202Z' },
  coffee: { top: 98, bottom: 177, viewBox: '10 22 220 195', path: 'M102.5 98Q107 98 107 102.5V172.5Q107 177 102.5 177T98 172.5V102.5Q98 98 102.5 98Z' },
  mug: { top: 103, bottom: 187, viewBox: '10 47 220 175', path: 'M50 103Q109 98 172 104L168 166Q167 186 151 187H74Q54 186 53 170Z' },
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
