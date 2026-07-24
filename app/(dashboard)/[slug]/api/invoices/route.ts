import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getInvoicesCollection, getClientsCollection } from "@/lib/mongodb"
import { nanoid } from "nanoid";
import { getBusiness } from "@/lib/actions/getbusiness";
import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";
// POST /api/invoices -> create a new invoice
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {


  try {

    const { slug } = await params;

const business = await getAuthorizedBusiness(slug);

if (!business) {
    return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
    );
}
    const body = await request.json()
    const shareId = nanoid(16);
    
    const invoiceDoc = {
  shareId,

  invoiceGroupId: shareId,

  version: 1,

  active: true,

  businessId: business._id!.toString(),
businessSlug: business.slug,

  billNo: Number(body.billNo) || 0,

  clientName: String(body.clientName || ""),

  selectedClientId: String(body.selectedClientId || ""),

  invoiceDate: String(body.invoiceDate || ""),

  balance: Number(body.balance) || 0,

  paid: Number(body.paid) || 0,

  fare: Boolean(body.fare),

  showCarat: Boolean(body.showCarat),

  items: Array.isArray(body.items) ? body.items : [],

  extra: Array.isArray(body.extra) ? body.extra : [],

  notes: String(body.notes || ""),

  total: Number(body.total) || 0,

  newBalance: Number(body.newBalance) || 0,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  edited: false,
}

    const invoices = await getInvoicesCollection()
    const result = await invoices.insertOne(invoiceDoc)

    // Update the client's running balance to the new balance after this invoice.
    if (invoiceDoc.selectedClientId) {
      try {
        const clients = await getClientsCollection()
        await clients.updateOne(
          { _id: new ObjectId(invoiceDoc.selectedClientId) },
          { $set: { prevBalance: invoiceDoc.newBalance } },
        )
      } catch (err) {
        console.error("[v0] Failed to update client balance:", err)
      }
    }

    return NextResponse.json({
      invoice: { ...invoiceDoc, _id: result.insertedId.toString() },
    })
  } catch (error) {
    console.error("[v0] Error creating invoice:", error)
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    )
  }
}
