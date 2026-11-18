/**
 * Browser-only: scales a picked photo down (longest side `maxSide`) and saves it as JPEG,
 * so uploads stay small (~150 KB) even for 12-megapixel phone photos.
 */
export async function resizePhoto(file: File, maxSide = 1280): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please pick image files only.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser can't process images.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process the photo."))),
      "image/jpeg",
      0.8,
    ),
  );
}
