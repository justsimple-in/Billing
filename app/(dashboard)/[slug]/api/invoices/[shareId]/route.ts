import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getInvoicesCollection, getClientsCollection } from "@/lib/mongodb"
import type { InvoiceHistoryEntry } from "@/lib/types"
import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";

// GET /api/invoices/[id] -> fetch a single invoice
export async function GET(
  _request: Request,
  { params }: {
  params: Promise<{
    slug: string;
    shareId: string;
  }>;
}
) {
  try {
    const { shareId , slug } = await params;
    const business = await getAuthorizedBusiness(slug);

if (!business) {
    return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
    );
}

    // if (!ObjectId.isValid(id)) {
    //   return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 })
    // }

    const invoices = await getInvoicesCollection()
   const invoice = await invoices.findOne({
  shareId,
  active: true,
})

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

// PUT /api/invoices/[id] -> edit an invoice.
// Instead of overwriting, this creates a NEW invoice document (new _id) that
// carries the full edit history, marks it as edited, and links back to the
// original. The original is marked inactive and points forward to the new one.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ shareId: string , slug: string; }> }
) {
  try {
    const { shareId , slug } = await params;
    const business = await getAuthorizedBusiness(slug);

if (!business) {
    return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
    );
}
    // if (!ObjectId.isValid(id)) {
    //   return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 })
    // }

    const body = await request.json()
    const invoices = await getInvoicesCollection()

    const original = await invoices.findOne({
    shareId,
    active: true,
      })

      if (!original) {
  return NextResponse.json(
    { error: "Invoice not found" },
    { status: 404 }
  );
}

    // Snapshot of the version we are replacing, appended to any existing history.
    const snapshot: InvoiceHistoryEntry = {
  _id: original._id.toString(),

  businessId: original.businessId,

  clientId: original.clientId ?? original.selectedClientId,
  // previousVersion: original.version,
  // previousInvoiceMongoId: original._id.toString(),

  billNo: original.billNo,
  clientName: original.clientName,
  selectedClientId: original.selectedClientId,
  version: original.version ?? 1,
  invoiceDate: original.invoiceDate,
  balance: original.balance,
  paid: original.paid,
  fare: original.fare,
  items: original.items,
  extra: original.extra,
  notes: original.notes,
  total: original.total,
  newBalance: original.newBalance,
  createdAt: original.createdAt,
};
    const history: InvoiceHistoryEntry[] = [
      ...(original.history ?? []),
      snapshot,
    ]

    const version = (original.version ?? 1) + 1;

    const newDoc = {
  shareId: original.shareId,

  invoiceGroupId: original.invoiceGroupId,

  version,

  active: true,

  businessId: original.businessId,

  billNo: Number(body.billNo) || 0,

  clientName: String(body.clientName || ""),

  selectedClientId: String(body.selectedClientId || ""),
  clientId: String(body.selectedClientId || ""),

  invoiceDate: String(body.invoiceDate || ""),

  balance: Number(body.balance) || 0,

  paid: Number(body.paid) || 0,

  fare: Boolean(body.fare),

  items: Array.isArray(body.items) ? body.items : [],

  extra: Array.isArray(body.extra) ? body.extra : [],

  notes: String(body.notes || ""),

  total: Number(body.total) || 0,

  newBalance: Number(body.newBalance) || 0,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  edited: true,

  history,
};

    const result = await invoices.insertOne(newDoc)
    const newId = result.insertedId.toString()

    // Mark the original as replaced/inactive and point it to the new version.
    await invoices.updateOne(
  { _id: original._id },
  {
    $set: {
      active: false,
      replacedBy: newId,
      updatedAt: new Date().toISOString(),
    },
  },
)

    // Keep the client's running balance in sync with the latest invoice.
    if (newDoc.selectedClientId && ObjectId.isValid(newDoc.selectedClientId)) {
      try {
        const clients = await getClientsCollection()
        await clients.updateOne(
          { _id: new ObjectId(newDoc.selectedClientId) },
          { $set: { prevBalance: newDoc.newBalance } },
        )
      } catch (err) {
        console.error("[v0] Failed to update client balance on edit:", err)
      }
    }

    return NextResponse.json({
      invoice: { ...newDoc, _id: newId },
    })
  } catch (error) {
    console.error("[v0] Error editing invoice:", error)
    return NextResponse.json(
      { error: "Failed to edit invoice" },
      { status: 500 },
    )
  }
}
