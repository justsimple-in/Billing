import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getInvoicesCollection } from "@/lib/mongodb"

// GET /api/invoices/[id] -> fetch a single invoice
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 })
    }

    const invoices = await getInvoicesCollection()
    const invoice = await invoices.findOne({ _id: new ObjectId(id) })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({
      invoice: { ...invoice, _id: invoice._id.toString() },
    })
  } catch (error) {
    console.error("[v0] Error fetching invoice:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 },
    )
  }
}
