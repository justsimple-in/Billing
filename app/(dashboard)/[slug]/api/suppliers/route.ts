import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSuppliersCollection } from "@/lib/collections/suppliers";
import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";

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

  const collection = await getSuppliersCollection();

  const suppliers = await collection
    .find({
      businessId: business._id.toString(),
    })
    .sort({
      supplierName: 1,
    })
    .toArray();

  return NextResponse.json({
    suppliers: suppliers.map((s) => ({
      _id: s._id.toString(),
      supplierName: s.supplierName,
      prevBalance: s.prevBalance,
    })),
  });
}

export async function PUT(
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
    const supplierId = String(body.supplierId || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const prevBalance = Number(body.prevBalance ?? 0);

    if (!supplierId) {
      return NextResponse.json(
        { error: "supplierId is required" },
        { status: 400 }
      );
    }

    const collection = await getSuppliersCollection();

    const result = await collection.updateOne(
      {
        _id: new ObjectId(supplierId),
        businessId: business._id.toString(),
      },
      {
        $set: {
          phone,
          address,
          prevBalance,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Supplier] Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

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

    const supplierName = String(body.supplierName || "").trim();
    const prevBalance = Number(body.prevBalance) || 0;

    if (!supplierName) {
      return NextResponse.json(
        { error: "supplierName is required" },
        { status: 400 }
      );
    }

    const collection = await getSuppliersCollection();

    const normalizedName = supplierName.toLowerCase();

    const existing = await collection.findOne({
      businessId: business._id.toString(),
      normalizedName,
    });

    if (existing) {
      return NextResponse.json({
        supplier: {
          _id: existing._id.toString(),
          supplierName: existing.supplierName,
          prevBalance: existing.prevBalance ?? 0,
        },
      });
    }

    const result = await collection.insertOne({
      businessId: business._id.toString(),

      supplierName,

      normalizedName,

      prevBalance,

      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      supplier: {
        _id: result.insertedId.toString(),
        supplierName,
        prevBalance,
      },
    });
  } catch (error) {
    console.error("[Purchase] Error adding supplier:", error);

    return NextResponse.json(
      { error: "Failed to add supplier" },
      { status: 500 }
    );
  }
}