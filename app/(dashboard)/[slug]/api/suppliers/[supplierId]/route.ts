import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getSuppliersCollection } from "@/lib/collections/suppliers";

interface Props {
  params: Promise<{
    slug: string;
    supplierId: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: Props
) {
  const { slug, supplierId } = await params;

  const business = await getBusiness(slug);

  if (!business) {
    return NextResponse.json(
      { error: "Business not found" },
      { status: 404 }
    );
  }

  const collection = await getSuppliersCollection();

  const supplier = await collection.findOne({
    _id: new ObjectId(supplierId),
    businessId: business._id.toString(),
  });

  if (!supplier) {
    return NextResponse.json(
      { error: "Supplier not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    supplier: {
      ...supplier,
      _id: supplier._id.toString(),
    },
  });
}