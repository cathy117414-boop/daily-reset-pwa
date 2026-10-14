const primaryTypes = new Set(['gingham', 'pin-dots', 'horizontal-grain', 'speckles']);
const secondaryTypes = new Set(['paper-fiber', 'washi-fiber', 'fine-grid', 'botanical-fiber']);
const bounded = (value, fallback, min, max) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;

// Pure CSS materials: no network dependency, filters, animation, or theme-name branches.
export function textureVariables(texture) {
  const plain = { '--journal-texture-image': 'none', '--journal-texture-size': 'auto' };
  if (!primaryTypes.has(texture?.primaryType) || !/^#[\da-f]{6}$/i.test(texture?.color || '')) return plain;
  const scale = bounded(texture.scale, 1, .6, 1.8);
  const ink = `color-mix(in srgb, ${texture.color} ${+(bounded(texture.opacity, .1, 0, .14) * 100).toFixed(2)}%, transparent)`;
  const fiber = `color-mix(in srgb, ${texture.color} ${+(bounded(texture.secondaryOpacity, .06, 0, .09) * 100).toFixed(2)}%, transparent)`;
  const layers = [];
  const sizes = [];
  const add = (image, width, height = width) => { layers.push(image); sizes.push(`${width * scale}px ${height * scale}px`); };
  if (texture.primaryType === 'gingham') {
    add(`linear-gradient(90deg, ${ink} 0 7px, transparent 7px)`, 58);
    add(`linear-gradient(${ink} 0 7px, transparent 7px)`, 58);
  } else if (texture.primaryType === 'pin-dots') {
    add(`radial-gradient(circle at 3px 3px, ${ink} 0 .55px, transparent .9px)`, 19);
  } else if (texture.primaryType === 'horizontal-grain') {
    add(`linear-gradient(${ink} 0 .5px, transparent 1px)`, 71, 9);
  } else {
    add(`radial-gradient(ellipse at 9px 13px, ${ink} 0 .65px, transparent 1.2px)`, 67, 59);
    add(`radial-gradient(ellipse at 37px 31px, ${ink} 0 .8px, transparent 1.3px)`, 79, 71);
  }
  if (secondaryTypes.has(texture.secondaryType)) {
    if (texture.secondaryType === 'fine-grid') {
      add(`linear-gradient(90deg, ${fiber} 0 .5px, transparent 1px)`, 98);
      add(`linear-gradient(${fiber} 0 .5px, transparent 1px)`, 98);
    } else {
      add(`radial-gradient(ellipse 4px .35px at 7px 12px, ${fiber} 0 75%, transparent 100%)`, 37, 23);
      if (texture.secondaryType === 'botanical-fiber') add(`radial-gradient(ellipse .35px 5px at 39px 41px, ${fiber} 0 75%, transparent 100%)`, 83, 61);
      else add(`radial-gradient(ellipse at 5px 7px, ${fiber} 0 .6px, transparent 1px)`, 13, 17);
    }
  }
  return { '--journal-texture-image': layers.join(', '), '--journal-texture-size': sizes.join(', ') };
}
