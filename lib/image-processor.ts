// @ts-nocheck
const sharp = require("sharp")

export function isImage(mimeType: string): boolean {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(mimeType)
}

export async function processImage(buffer: Buffer): Promise<{
  compressed: Buffer
  thumbnail: Buffer
  metadata: { width: number; height: number; originalSize: number; compressedSize: number }
}> {
  const meta = await sharp(buffer).metadata()

  // Compress: auto-rotate, resize if huge, JPEG at 80% quality
  let compressed = sharp(buffer).rotate()
  if ((meta.width || 0) > 4096 || (meta.height || 0) > 4096) {
    compressed = compressed.resize(4096, 4096, { fit: "inside", withoutEnlargement: true })
  }
  const compressedBuf = await compressed.jpeg({ quality: 80, progressive: true }).toBuffer()

  // Thumbnail: 200x200 cover crop
  const thumbnailBuf = await sharp(buffer)
    .rotate()
    .resize(200, 200, { fit: "cover", position: "centre" })
    .jpeg({ quality: 70 })
    .toBuffer()

  return {
    compressed: compressedBuf,
    thumbnail: thumbnailBuf,
    metadata: {
      width: meta.width || 0,
      height: meta.height || 0,
      originalSize: buffer.length,
      compressedSize: compressedBuf.length,
    },
  }
}

// Preprocess image for better OCR accuracy
export async function prepareForOCR(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .grayscale()
    .normalize()
    .sharpen()
    .resize(2000, null, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer()
}

// Generate employee profile photo (300x300 square)
export async function processProfilePhoto(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(300, 300, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85 })
    .toBuffer()
}
