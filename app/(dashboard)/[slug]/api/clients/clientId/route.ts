import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getBusiness } from "@/lib/actions/getbusiness";
import { getClientsCollection } from "@/lib/collections/clients";

interface Props {
  params: Promise<{
    slug: string;
    clientId: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: Props
) {
  const { slug, clientId } = await params;

  const business = await getBusiness(slug);

  if (!business) {
    return NextResponse.json(
      { error: "Business not found" },
      { status: 404 }
    );
  }

  const collection = await getClientsCollection();

  const client = await collection.findOne({
    _id: new ObjectId(clientId),
    businessId: business._id.toString(),
  });

  if (!client) {
    return NextResponse.json(
      { error: "Customer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    client: {
      ...client,
      _id: client._id.toString(),
    },
  });
}