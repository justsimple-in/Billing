import { NextResponse } from "next/server"
import { getClientsCollection } from "@/lib/mongodb"
import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";

import { getBusinessesCollection } from "@/lib/collections/business";

const defaultInvoiceSettings = {
  fields: {
    carat: true,
    commission: true,
    fare: true,
    previousBalance: true,
    paidAmount: true,
    additionalCharges: true,
    notes: true,
  },
  lastBillNo: 0,
};

const defaultPurchaseSettings = {
  fields: {
    commission: true,
    fare: true,
  },
  lastReceiptNo: 0,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const business = await getAuthorizedBusiness(slug);



  if (!business) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  if (!business.invoiceSettings || !business.purchaseSettings) {
  const businessCollection = await getBusinessesCollection();

  await businessCollection.updateOne(
    { _id: business._id },
    {
      $set: {
        invoiceSettings:
          business.invoiceSettings ?? defaultInvoiceSettings,
        purchaseSettings:
          business.purchaseSettings ?? defaultPurchaseSettings,
      },
    }
  );

  business.invoiceSettings ??= defaultInvoiceSettings;
  // business.purchaseSettings ??= defaultPurchaseSettings;
}

  const collection = await getClientsCollection();

  const clients = await collection
    .find({
      businessId: business._id.toString(),
    })
    .sort({
      clientName: 1,
    })
    .toArray();



  return NextResponse.json({
    clients: clients.map((c) => ({
      _id: c._id.toString(),
      clientName: c.clientName,
      prevBalance: c.prevBalance,
    })),

    invoiceSettings:
      business.invoiceSettings ?? defaultInvoiceSettings,

    purchaseSettings:
      business.purchaseSettings ?? defaultPurchaseSettings,
  });
}

// POST /api/clients -> add a new client { clientName, prevBalance }
export async function POST(  request: Request,
  { params }: { params: Promise<{ slug: string }> }) {
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
    const clientName = String(body.clientName || "").trim()
    const prevBalance = Number(body.prevBalance) || 0

    if (!clientName) {
      return NextResponse.json(
        { error: "clientName is required" },
        { status: 400 },
      )
    }

    const collection = await getClientsCollection()

    // Avoid duplicates (case-insensitive)

    const normalizedName = clientName.trim().toLowerCase();
const existing = await collection.findOne({
  businessId: business._id.toString(),
  normalizedName,
});

if (existing) {
  return NextResponse.json({
    client: {
      _id: existing._id.toString(),
      clientName: existing.clientName,
      prevBalance: existing.prevBalance ?? 0,
    },
  });
}

const result = await collection.insertOne({
  businessId: business._id.toString(),

  clientName,
  normalizedName,

  prevBalance,

  createdAt: new Date().toISOString(),
});

    return NextResponse.json({
      client: {
        _id: result.insertedId.toString(),
        clientName,
        prevBalance,
      },
    })
  } catch (error) {
    console.error("[v0] Error adding client:", error)
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 })
  }
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
