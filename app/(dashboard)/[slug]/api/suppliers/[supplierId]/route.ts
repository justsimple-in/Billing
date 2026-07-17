import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getSuppliersCollection } from "@/lib/collections/suppliers";
import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";

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

  const business = await getAuthorizedBusiness(slug);
  
  if (!business) {
      return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
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