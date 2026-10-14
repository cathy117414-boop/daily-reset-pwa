import { stickerProps } from "../../config/decorations.js";
import { useState } from "react";
import { themeAssetUrl } from "../../config/themes.js";
import "../../styles/decorations.css";

const paths = {
  star: "m12 2 2.9 6 6.6 1-4.8 4.7 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6L2.5 9l6.6-1Z",
  heart: "M12 20S2 14 2 8.5C2 3 9 2 12 7c3-5 10-4 10 1.5C22 14 12 20 12 20Z",
  bow: "M10 10C4 4 2 5 2 11s2 8 8 3m4-4c6-6 8-5 8 1s-2 8-8 3M10 10h4v5h-4Z",
  dot: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  leaf: "M5 19C1 8 11 3 21 3c0 10-5 18-14 15M4 21 16 8",
};

export function ThemeSticker({ material, className = "" }) {
  const [failedAsset, setFailedAsset] = useState(null);
  const safe = stickerProps(material);
  if (!safe) return null;
  if (safe.asset) {
    if (failedAsset === safe.asset) return null;
    return <img className={`theme-ornament theme-sticker-asset ${className}`} src={themeAssetUrl(safe.asset)} style={{ "--sticker-size": `${safe.size}px` }} width={safe.size} height={safe.size} alt="" aria-hidden="true" draggable="false" decoding="async" onError={() => setFailedAsset(safe.asset)} />;
  }
  return <svg className={`theme-ornament ${className}`} data-shape={safe.shape} style={{ color: safe.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[safe.shape]} /></svg>;
}

export function ThemeTape({ material }) {
  if (!material) return null;
  return <span className="theme-tape" data-tape={material.style} style={{ "--tape-color": material.color, "--tape-ink": material.ink }} aria-hidden="true" />;
}

export function ThemeSectionIcon({ style }) {
  if (!style) return null;
  return <svg className="theme-ornament theme-section-icon" data-icon-style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h12v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3ZM16 9h2a3 3 0 0 1 0 6h-2M7 3v1m5-1v1" /></svg>;
}
