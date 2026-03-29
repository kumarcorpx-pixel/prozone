import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import prisma from "@/lib/prisma"
import { serviceCatalog } from "@/lib/service-catalog"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params

    // Verify request exists and client can access it
    const sr = await prisma.serviceRequest.findUnique({
      where: { id },
      select: { clientId: true },
    })
    if (!sr) return NextResponse.json({ error: "Request not found" }, { status: 404 })
    if (auth.user.role === "client" && sr.clientId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const fees = await prisma.governmentFee.findMany({
      where: { requestId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      fees: fees.map((f: any) => ({
        id: f.id,
        request_id: f.requestId,
        company_id: f.companyId,
        fee_type: f.feeType,
        description: f.description,
        amount: Number(f.amount),
        payment_method: f.paymentMethod,
        payment_status: f.paymentStatus,
        receipt_number: f.receiptNumber,
        paid_date: f.paidDate,
        created_at: f.createdAt,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { feeType, description, amount, paymentMethod, receiptNumber } = body

    if (!feeType) {
      return NextResponse.json({ error: "feeType is required" }, { status: 400 })
    }

    // Verify request exists and get service type + company
    const sr = await prisma.serviceRequest.findUnique({
      where: { id },
      select: { serviceType: true, companyId: true },
    })
    if (!sr) return NextResponse.json({ error: "Request not found" }, { status: 404 })

    // Auto-populate amount from service catalog if not provided
    let feeAmount = amount
    if (feeAmount === undefined || feeAmount === null) {
      if (sr.serviceType) {
        const catalogItem = serviceCatalog.find(
          (s) => s.name === sr.serviceType || s.id === sr.serviceType
        )
        if (catalogItem) {
          feeAmount = catalogItem.gov_fee
        }
      }
    }

    if (feeAmount === undefined || feeAmount === null) {
      return NextResponse.json(
        { error: "amount is required (could not auto-detect from service catalog)" },
        { status: 400 }
      )
    }

    const fee = await prisma.governmentFee.create({
      data: {
        requestId: id,
        companyId: sr.companyId || null,
        feeType,
        description: description || null,
        amount: feeAmount,
        paymentMethod: paymentMethod || null,
        paymentStatus: "pending",
        receiptNumber: receiptNumber || null,
      },
    })

    return NextResponse.json({
      id: fee.id,
      request_id: fee.requestId,
      company_id: fee.companyId,
      fee_type: fee.feeType,
      description: fee.description,
      amount: Number(fee.amount),
      payment_method: fee.paymentMethod,
      payment_status: fee.paymentStatus,
      receipt_number: fee.receiptNumber,
      paid_date: fee.paidDate,
      created_at: fee.createdAt,
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
