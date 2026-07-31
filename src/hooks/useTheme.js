import { useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME_ID, getTheme, normalizeThemeId, themeAssetUrl } from "../config/themes.js";

function themeVariables(theme) {
  return {
    "--color-primary": theme.primary,
    "--color-primary-dark": theme.primaryDark,
    "--color-background": theme.background,
    "--color-card": theme.card,
    "--color-text": theme.text,
    "--color-muted-text": theme.mutedText,
    "--color-accent": theme.accent,
    "--color-border": theme.border,
    "--color-water": theme.waterColor,
    "--color-on-primary": theme.onPrimary,
    "--color-background-dark": theme.darkBackground,
    "--color-card-dark": theme.darkCard,
    "--color-text-dark": theme.darkText,
    "--color-muted-text-dark": theme.darkMutedText,
    "--color-border-dark": theme.darkBorder,
    "--theme-radius": `${theme.radius}px`,
    "--theme-shadow": theme.shadow,
    "--theme-cover-gradient": theme.coverGradient,
    "--theme-cover-image": `url("${themeAssetUrl(theme.coverImage)}")`,
    "--theme-mascot-image": `url("${themeAssetUrl(theme.mascotImage)}")`,
    "--theme-completed-image": `url("${themeAssetUrl(theme.completedImage)}")`,
    "--theme-thumbnail-image": `url("${themeAssetUrl(theme.thumbnailImage)}")`,
  };
}

export function useTheme(savedThemeId, onSave) {
  const normalizedSavedId = normalizeThemeId(savedThemeId);
  const [previewThemeId, setPreviewThemeId] = useState(null);
  const activeThemeId = normalizeThemeId(previewThemeId || normalizedSavedId);
  const activeTheme = getTheme(activeThemeId);
  const variables = useMemo(() => themeVariables(activeTheme), [activeTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = activeTheme.id;
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", activeTheme.background);
  }, [activeTheme, variables]);

  const previewTheme = (themeId) => setPreviewThemeId(normalizeThemeId(themeId));
  const saveTheme = () => {
    const nextThemeId = normalizeThemeId(previewThemeId || normalizedSavedId);
    onSave(nextThemeId);
    setPreviewThemeId(null);
  };
  const resetTheme = () => {
    onSave(DEFAULT_THEME_ID);
    setPreviewThemeId(null);
  };

  return {
    activeTheme,
    activeThemeId,
    savedThemeId: normalizedSavedId,
    isPreviewing: Boolean(previewThemeId && previewThemeId !== normalizedSavedId),
    previewTheme,
    saveTheme,
    resetTheme,
  };
}
