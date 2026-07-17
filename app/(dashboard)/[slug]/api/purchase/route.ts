import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { getPurchaseReceiptsCollection } from "@/lib/collections/purchaseReceipt";
import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";

// POST /[slug]/api/purchase
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

    const body = await request.json();

    const shareId = nanoid(16);

    const receiptDoc = {
      shareId,

      receiptGroupId: shareId,

      version: 1,

      active: true,

      businessId: business._id.toString(),

      businessSlug: business.slug,

      supplierName: String(body.supplierName || ""),

      selectedSupplierId: String(body.selectedSupplierId || ""),

      receiptDate: String(body.receiptDate || ""),

      fare: Boolean(body.fare),

      items: Array.isArray(body.items) ? body.items : [],

      extra: Array.isArray(body.extra) ? body.extra : [],

      notes: String(body.notes || ""),

      total: Number(body.total) || 0,

      newBalance: Number(body.newBalance) || 0,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),

      edited: false,
    };

    const receipts = await getPurchaseReceiptsCollection();

    const result = await receipts.insertOne(receiptDoc);

    return NextResponse.json({
      receipt: {
        ...receiptDoc,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("[Purchase] Error creating receipt:", error);

    return NextResponse.json(
      {
        error: "Failed to create purchase receipt",
      },
      {
        status: 500,
      }
    );
  }
}