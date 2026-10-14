const shapes = new Set(["star", "bow", "heart", "dot", "leaf"]);
const color = (value) => /^#[\da-f]{6}$/i.test(value || "") ? value : "currentColor";
const localAsset = (value) => /^decorations\/(cream|pink|minimal|nature)\/[a-z-]+\.svg$/.test(value || "") ? value : undefined;

// Unknown or absent materials deliberately render nothing: the plain theme remains usable.
export function stickerProps(material) {
  const asset = localAsset(material?.asset);
  if (asset) return { asset, size: Number.isFinite(material.size) ? Math.max(12, Math.min(48, material.size)) : 32 };
  return shapes.has(material?.shape) ? { shape: material.shape, color: color(material.color) } : null;
}

export function decorationProps(decorations) {
  const tape = decorations?.tape;
  const quote = decorations?.quoteDecorationStyle;
  return {
    tape: ["gingham", "washi", "paper", "kraft"].includes(tape?.style)
      ? { style: tape.style, color: color(tape.color), ink: color(tape.ink) } : null,
    sticker: stickerProps(decorations?.primarySticker),
    progress: stickerProps(decorations?.progressCardDecoration),
    previewDoodle: stickerProps(decorations?.doodles?.[decorations?.previewDoodle]),
    progressDoodle: stickerProps(decorations?.doodles?.[decorations?.progressDoodle]),
    icon: ["rounded", "fine", "minimal", "natural"].includes(decorations?.sectionIconStyle)
      ? decorations.sectionIconStyle : undefined,
    quote: ["handwritten", "slender", "minimal"].includes(quote?.style)
      ? { style: quote.style, color: color(quote.color),
        divider: ["solid", "dashed", "dotted"].includes(quote.divider) ? quote.divider : "solid",
        sticker: stickerProps(quote.sticker),
        doodle: stickerProps(typeof quote.doodle === "string" ? { shape: quote.doodle, color: quote.color } : quote.doodle) } : null,
  };
}
