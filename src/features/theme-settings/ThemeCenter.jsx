import { useState } from "react";
import { CheckIcon } from "../../icons";
import { THEMES, themeAssetUrl } from "../../config/themes.js";
import { decorationProps } from "../../config/decorations.js";
import { ThemeSticker, ThemeTape } from "./ThemeDecoration";

function ThemePreviewCard({ theme, activeThemeId, savedThemeId, onPreview }) {
  const isActive = activeThemeId === theme.id;
  const isSaved = savedThemeId === theme.id;
  const [imageFailed, setImageFailed] = useState(false);
  const decorations = decorationProps(theme.decorations);
  const style = {
    "--preview-primary": theme.primary,
    "--preview-accent": theme.accent,
    "--preview-background": theme.background,
    "--preview-card": theme.card,
    "--preview-text": theme.text,
    "--preview-border": theme.border,
  };

  return (
    <button
      className={`theme-preview-card theme-preview-card--${theme.id} ${isActive ? "active" : ""}`}
      style={style}
      onClick={() => onPreview(theme.id)}
      aria-pressed={isActive}
    >
      <span className="theme-thumbnail">
        {imageFailed ? <span className="theme-thumbnail-fallback" role="img" aria-label={`${theme.name}主题预览`} /> : (
          <img src={themeAssetUrl(theme.thumbnailImage)} alt={`${theme.name}主题预览`} decoding="async" onError={() => setImageFailed(true)} />
        )}
        <ThemeTape material={decorations.tape} />
        <ThemeSticker material={decorations.sticker} className="theme-preview-sticker" />
      </span>
      <span className="theme-card-body">
        <span className="theme-card-title">
          <strong>{theme.name}</strong>
          <span className={`theme-current ${decorations.sticker ? "theme-current--sticker" : ""} ${isActive ? "" : "theme-current--empty"}`} aria-hidden={!isActive}>
            <CheckIcon size={15} />{isSaved ? "使用中" : "预览中"}
          </span>
        </span>
        <span className="theme-swatches" aria-label="主题主要配色">
          {[theme.primary, theme.accent, theme.background, theme.waterColor].map((color) => (
            <i key={color} style={{ background: color }} />
          ))}
        </span>
      </span>
    </button>
  );
}

export function ThemeCenter({ theme }) {
  return (
    <>
      <header className="page-header secondary theme-center-intro">
        <span className="theme-center-kicker">个性化</span>
        <h1>主题中心</h1>
        <p>选择一套喜欢的配色。点击卡片会立即预览，保存后会在下次打开时继续使用。</p>
      </header>
      <section className="theme-center-panel" aria-label="可选主题">
        <div className="theme-preview-grid">
          {THEMES.map((item) => (
            <ThemePreviewCard
              key={item.id}
              theme={item}
              activeThemeId={theme.activeThemeId}
              savedThemeId={theme.savedThemeId}
              onPreview={theme.previewTheme}
            />
          ))}
        </div>
        <div className="theme-center-actions">
          <button className="text-button theme-reset-button" onClick={theme.resetTheme}>恢复默认</button>
          <button className="primary-button" onClick={theme.saveTheme}>
            {theme.isPreviewing ? "保存主题" : "主题已保存"}
          </button>
        </div>
        <p className="theme-image-note">主题预览统一比例展示；素材不可用时自动回退为安全配色。</p>
      </section>
    </>
  );
}
