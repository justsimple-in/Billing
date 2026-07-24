import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ObjectId } from "mongodb";

import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";
// import { getPaymentsCollection } from "@/lib/collections/payments";
import { getPaymentsCollection } from "@/lib/collections/payments";
import { getSuppliersCollection } from "@/lib/collections/suppliers";

// POST /[slug]/api/payment
export async function POST(
   request: Request,
  { params }:{
    params: Promise<{ slug: string }>;
  }
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

    const suppliers = await getSuppliersCollection();

    const supplier = await suppliers.findOne({
      _id: new ObjectId(body.selectedSupplierId),
      businessId: business._id.toString(),
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    const amount = Number(body.amount) || 0;

    const previousBalance = Number(supplier.prevBalance || 0);

    const newBalance = previousBalance - amount;

    const shareId = nanoid(16);

    const paymentDoc = {
      shareId,
      paymentGroupId: shareId,

      version: 1,
      active: true,

      businessId: business._id.toString(),
      businessSlug: business.slug,

      supplierName: supplier.supplierName,
      selectedSupplierId: supplier._id.toString(),

      paymentDate: body.paymentDate,

      amount,

      previousBalance,

      newBalance,

      notes: String(body.notes || ""),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      edited: false,
    };

    const payments = await getPaymentsCollection();

    const result = await payments.insertOne(paymentDoc);

    await suppliers.updateOne(
      {
        _id: supplier._id,
      },
      {
        $set: {
          prevBalance: newBalance,
        },
      }
    );

    return NextResponse.json({
      payment: {
        ...paymentDoc,
        _id: result.insertedId.toString(),
      },
    });
  } catch (err) {
    console.error("[Payment] Error:", err);

    return NextResponse.json(
      {
        error: "Failed to save payment",
      },
      {
        status: 500,
      }
    );
  }
}