/**
 * Browser-only: crops a picked image to a centred square and scales it down,
 * so uploads stay small (~30 KB) and every avatar looks the same.
 */
export async function squareAvatar(file: File, size = 256): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please pick an image file.");
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser can't process images.");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process the image."))),
      "image/jpeg",
      0.85,
    ),
  );
}
