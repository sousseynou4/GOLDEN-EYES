/**
 * Compression d'image côté navigateur (sans dépendance externe).
 * ────────────────────────────────────────────────────────────────
 * - Redimensionne à une largeur max (par défaut 2400px)
 * - Ré-encode en WebP avec une qualité réglable
 * - Réduit typiquement le poids d'un facteur 5 à 15 sans perte visible
 *
 * Les vidéos et GIF ne sont PAS compressés (retournés tels quels).
 */

interface CompressOptions {
  maxWidth?: number;
  quality?: number; // 0..1
}

export async function compressImage(
  file: File,
  { maxWidth = 2400, quality = 0.82 }: CompressOptions = {},
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const targetW = Math.round(bitmap.width * scale);
    const targetH = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (!blob) return file;
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], newName, { type: "image/webp" });
  } catch {
    return file;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
