/**
 * Downscale + re-encode an image via canvas so phone photos (often 4–8 MB)
 * fit within Vercel's 4.5 MB body limit and keep R2 storage lean. HEIC/HEIF
 * aren't decodable by canvas in most browsers — those pass through unchanged.
 * Browser-only (uses Image/canvas/FileReader).
 */
export async function compressImage(file: File): Promise<File> {
  if (!/\.(jpe?g|png|webp)$/i.test(file.name)) return file;
  if (file.size < 600 * 1024) return file;

  const dataUrl: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("decode"));
    i.src = dataUrl;
  });

  const MAX_DIM = 2000;
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
  );
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.(jpe?g|png|webp)$/i, ".jpg");
  return new File([blob], newName, { type: "image/jpeg" });
}
