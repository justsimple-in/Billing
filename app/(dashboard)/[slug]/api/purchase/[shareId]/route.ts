import { NextResponse } from "next/server";
import { getPurchaseReceiptsCollection } from "@/lib/collections/purchaseReceipt";
import type { PurchaseHistoryEntry } from "@/lib/types";

// GET /[slug]/api/purchase/[shareId]
export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
      shareId: string;
    }>;
  }
) {
  try {
    const { shareId } = await params;

    const receipts = await getPurchaseReceiptsCollection();

    const receipt = await receipts.findOne({
      shareId,
      active: true,
    });

    if (!receipt) {
      return NextResponse.json(
        {
          error: "Receipt not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      receipt: {
        ...receipt,
        _id: receipt._id.toString(),
      },
    });
  } catch (error) {
    console.error("[Purchase] Error fetching receipt:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch receipt",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT /[slug]/api/purchase/[shareId]
export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      shareId: string;
    }>;
  }
) {
  try {
    const { shareId } = await params;

    const body = await request.json();

    const receipts = await getPurchaseReceiptsCollection();

    const original = await receipts.findOne({
      shareId,
      active: true,
    });

    if (!original) {
      return NextResponse.json(
        {
          error: "Receipt not found",
        },
        {
          status: 404,
        }
      );
    }

    const snapshot: PurchaseHistoryEntry = {
      _id: original._id.toString(),

      businessId: original.businessId,

    //   supplierId:
    //     original.supplierId ??
    //     original.selectedSupplierId,

      supplierName: original.supplierName,

      selectedSupplierId:
        original.selectedSupplierId,

      version: original.version ?? 1,

      receiptDate: original.receiptDate,

      fare: original.fare,

      items: original.items,

      extra: original.extra,

      notes: original.notes,

      total: original.total,

    //   newBalance: original.newBalance,

      createdAt: original.createdAt,
    };

    const history: PurchaseHistoryEntry[] = [
      ...(original.history ?? []),
      snapshot,
    ];

    const version =
      (original.version ?? 1) + 1;

    const newDoc = {
      shareId: original.shareId,

      receiptGroupId:
        original.receiptGroupId,

      version,

      active: true,

      businessId: original.businessId,

      supplierName: String(
        body.supplierName || ""
      ),

      supplierId: String(
        body.selectedSupplierId || ""
      ),

      selectedSupplierId: String(
        body.selectedSupplierId || ""
      ),

      receiptDate: String(
        body.receiptDate || ""
      ),

      fare: Boolean(body.fare),

      items: Array.isArray(body.items)
        ? body.items
        : [],

      extra: Array.isArray(body.extra)
        ? body.extra
        : [],

      notes: String(body.notes || ""),

      total: Number(body.total) || 0,

      newBalance:
        Number(body.newBalance) || 0,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),

      edited: true,

      history,
    };

    const result =
      await receipts.insertOne(newDoc);

    const newId =
      result.insertedId.toString();

    await receipts.updateOne(
      {
        _id: original._id,
      },
      {
        $set: {
          active: false,
          replacedBy: newId,
          updatedAt:
            new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({
      receipt: {
        ...newDoc,
        _id: newId,
      },
    });
  } catch (error) {
    console.error(
      "[Purchase] Error editing receipt:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to edit purchase receipt",
      },
      {
        status: 500,
      }
    );
  }
}