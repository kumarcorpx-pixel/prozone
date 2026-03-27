// @ts-nocheck
const Tesseract = require("tesseract.js")
const sharp = require("sharp")

async function preprocessImage(fileBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(fileBuffer)
      .resize(2000, null, { withoutEnlargement: true })
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer()
  } catch {
    return fileBuffer
  }
}

export async function extractText(fileBuffer: Buffer): Promise<string> {
  try {
    const processed = await preprocessImage(fileBuffer)
    const worker = await Tesseract.createWorker("eng")
    const { data: { text } } = await worker.recognize(processed)
    await worker.terminate()
    return text || ""
  } catch (err: any) {
    console.error("[OCR] Extract error:", err.message)
    return ""
  }
}

function findField(text: string, patterns: RegExp[]): { value: string | null; confidence: "high" | "low" | null } {
  for (const p of patterns) {
    const match = text.match(p)
    if (match && match[1]) {
      return { value: match[1].trim(), confidence: "high" }
    }
  }
  return { value: null, confidence: null }
}

function findDate(text: string, patterns: RegExp[]): { value: string | null; confidence: "high" | "low" | null } {
  for (const p of patterns) {
    const match = text.match(p)
    if (match) {
      const dateStr = match[1] || match[0]
      return { value: dateStr.trim(), confidence: "high" }
    }
  }
  // Try generic date patterns
  const genericDate = text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g)
  if (genericDate) return { value: genericDate[0], confidence: "low" }
  return { value: null, confidence: null }
}

export function extractTradeLicense(text: string) {
  return {
    companyName: findField(text, [
      /(?:Trade Name|Company Name|الاسم التجاري)[:\s]*(.+)/i,
      /(?:Name of Establishment)[:\s]*(.+)/i,
    ]),
    licenseNumber: findField(text, [
      /(?:License No|License Number|رقم الرخصة)[:\s]*(\S+)/i,
      /(?:CN[- ]?\d+)/i,
    ]),
    expiryDate: findDate(text, [
      /(?:Expiry|Valid Until|انتهاء|Expires)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ]),
    issueDate: findDate(text, [
      /(?:Issue Date|Date of Issue|تاريخ الإصدار)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ]),
    emirate: findField(text, [
      /(?:Dubai|Abu Dhabi|Sharjah|Ajman|RAK|Fujairah|UAQ)/i,
    ]),
    activity: findField(text, [
      /(?:Activity|Business Activity|النشاط)[:\s]*(.+)/i,
    ]),
    legalForm: findField(text, [
      /(?:Legal Form|Legal Type)[:\s]*(.+)/i,
      /(L\.?L\.?C|FZE|FZCO|FZC|Sole Establishment)/i,
    ]),
  }
}

export function extractPassport(text: string) {
  return {
    fullName: findField(text, [
      /(?:Name|Surname)[:\s]*(.+)/i,
      /P<\w{3}([A-Z<]+)<<([A-Z<]+)/,
    ]),
    passportNumber: findField(text, [
      /(?:Passport No|Passport Number)[:\s]*(\w{6,12})/i,
      /([A-Z]\d{7,8})/,
    ]),
    nationality: findField(text, [
      /(?:Nationality|Country)[:\s]*(\w+)/i,
    ]),
    dateOfBirth: findDate(text, [
      /(?:Date of Birth|DOB|Born)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ]),
    expiryDate: findDate(text, [
      /(?:Date of Expiry|Expiry)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ]),
    gender: findField(text, [
      /(?:Sex|Gender)[:\s]*([MF])/i,
    ]),
  }
}

export function extractEmiratesID(text: string) {
  return {
    fullName: findField(text, [
      /(?:Name)[:\s]*(.+)/i,
    ]),
    idNumber: findField(text, [
      /(784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d)/,
    ]),
    expiryDate: findDate(text, [
      /(?:Expiry|Valid)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ]),
    dateOfBirth: findDate(text, [
      /(?:Date of Birth|DOB)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ]),
    nationality: findField(text, [
      /(?:Nationality)[:\s]*(\w+)/i,
    ]),
  }
}

export function extractVisa(text: string) {
  return {
    fullName: findField(text, [
      /(?:Name)[:\s]*(.+)/i,
    ]),
    visaNumber: findField(text, [
      /(?:Visa No|Entry Permit|Permit No)[:\s]*(\S+)/i,
    ]),
    visaType: findField(text, [
      /(Employment|Residence|Visit|Mission|Tourist|Golden)/i,
    ]),
    expiryDate: findDate(text, [
      /(?:Expiry|Valid Until)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ]),
    sponsor: findField(text, [
      /(?:Sponsor|Company|Employer)[:\s]*(.+)/i,
    ]),
    uid: findField(text, [
      /(?:UID|Unified Number)[:\s]*(\S+)/i,
    ]),
  }
}

export function autoDetectDocumentType(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes("trade license") || lower.includes("رخصة تجارية") || lower.includes("ded") || lower.includes("license no")) return "trade-license"
  if (lower.includes("passport") || lower.includes("جواز") || text.includes("P<")) return "passport"
  if ((lower.includes("emirates") && lower.includes("identity")) || /784[-\s]?\d{4}/.test(text)) return "emirates-id"
  if (lower.includes("visa") || lower.includes("entry permit") || lower.includes("residence") || lower.includes("تأشيرة")) return "visa"
  return "unknown"
}

export async function processDocument(fileBuffer: Buffer, documentType: string) {
  const rawText = await extractText(fileBuffer)
  if (!rawText.trim()) {
    return { rawText: "", extractedData: null, documentType, error: "No text found" }
  }

  const detectedType = documentType === "auto-detect" ? autoDetectDocumentType(rawText) : documentType

  let extractedData
  switch (detectedType) {
    case "trade-license": extractedData = extractTradeLicense(rawText); break
    case "passport": extractedData = extractPassport(rawText); break
    case "emirates-id": extractedData = extractEmiratesID(rawText); break
    case "visa": extractedData = extractVisa(rawText); break
    default: extractedData = null
  }

  return { rawText, extractedData, documentType: detectedType }
}
