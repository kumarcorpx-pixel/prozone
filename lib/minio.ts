// @ts-nocheck
const Minio = require("minio")

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "yabsadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "YabsStorage2026",
})

const BUCKET = process.env.MINIO_BUCKET || "documents"

export async function uploadToMinio(file: Buffer, fileName: string, contentType: string): Promise<string> {
  await minioClient.putObject(BUCKET, fileName, file, file.length, {
    "Content-Type": contentType,
  })
  return `http://${process.env.MINIO_ENDPOINT || "localhost"}:${process.env.MINIO_PORT || "9000"}/${BUCKET}/${fileName}`
}

export async function getMinioUrl(fileName: string): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET, fileName, 60 * 60) // 1 hour expiry
}

export async function deleteFromMinio(fileName: string): Promise<void> {
  await minioClient.removeObject(BUCKET, fileName)
}

export async function listMinioFiles(prefix?: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const files: any[] = []
    const stream = minioClient.listObjects(BUCKET, prefix || "", true)
    stream.on("data", (obj: any) => files.push(obj))
    stream.on("end", () => resolve(files))
    stream.on("error", reject)
  })
}

export { minioClient, BUCKET }
