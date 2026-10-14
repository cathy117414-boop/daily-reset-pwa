const shapes = new Set(["star", "bow", "heart", "dot", "leaf"]);
const color = (value) => /^#[\da-f]{6}$/i.test(value || "") ? value : "currentColor";

// Unknown or absent materials deliberately render nothing: the plain theme remains usable.
export function stickerProps(material) {
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
    icon: ["rounded", "fine", "minimal", "natural"].includes(decorations?.sectionIconStyle)
      ? decorations.sectionIconStyle : undefined,
    quote: ["handwritten", "slender", "minimal"].includes(quote?.style)
      ? { style: quote.style, color: color(quote.color),
        divider: ["solid", "dashed", "dotted"].includes(quote.divider) ? quote.divider : "solid",
        doodle: stickerProps({ shape: quote.doodle, color: quote.color }) } : null,
  };
}
