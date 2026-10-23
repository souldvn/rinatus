import dimensions from "./dimensions.json";

// Visible bounds of the artwork inside the exported PDF images.
// Clip the export background in CSS; retain the original image files.
const bounds: Record<string, [number, number, number, number]> = {
  "bank-branches.webp": [8, 6, 1894, 428],
  "bank-accounts.webp": [8, 24, 1894, 714],
  "service-flow.webp": [6, 6, 1894, 298],
  "migration-flow.webp": [6, 6, 1894, 904],
  "device-accounts.webp": [8, 16, 1894, 712],
  "cover-bank.webp": [48, 256, 1288, 1496],
  "cover-bi.webp": [48, 264, 1288, 1376],
};

export function imageGeometry(src: string) {
  const name = src.split("/").at(-1)!;
  const [width, height] = (dimensions as Record<string, number[]>)[name];
  const [left, top, right, bottom] = bounds[name] ?? [0, 0, width, height];
  return {
    width,
    height,
    left,
    top,
    visibleWidth: right - left,
    visibleHeight: bottom - top,
    outlined: /^pdf-(3|4)-/.test(name),
    cover: name.startsWith("cover-"),
  };
}
