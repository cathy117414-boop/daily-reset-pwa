import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const source = await readFile(new URL("../public/app-icon.svg", import.meta.url));

await Promise.all(
  [192, 512].map((size) =>
    sharp(source)
      .resize(size, size)
      .png()
      .toFile(fileURLToPath(new URL(`../public/app-icon-${size}.png`, import.meta.url))),
  ),
);
