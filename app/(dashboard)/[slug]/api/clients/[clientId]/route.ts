import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";
import { getClientsCollection } from "@/lib/collections/clients";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; clientId: string }> },
) {
  const { slug, clientId } = await params;
  const business = await getAuthorizedBusiness(slug);

  if (!business) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!ObjectId.isValid(clientId)) {
    return NextResponse.json({ error: "Invalid client id" }, { status: 400 });
  }

  const clients = await getClientsCollection();
  const client = await clients.findOne({
    _id: new ObjectId(clientId),
    businessId: business._id.toString(),
  });

  if (!client) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json({
    client: {
      ...client,
      _id: client._id.toString(),
      enabled: client.enabled !== false,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; clientId: string }> },
) {
  const { slug, clientId } = await params;
  const business = await getAuthorizedBusiness(slug);

  if (!business) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!ObjectId.isValid(clientId)) {
    return NextResponse.json({ error: "Invalid client id" }, { status: 400 });
  }

  const body = await request.json();
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }

  const clients = await getClientsCollection();
  const result = await clients.updateOne(
    {
      _id: new ObjectId(clientId),
      businessId: business._id.toString(),
    },
    { $set: { enabled: body.enabled } },
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json({ enabled: body.enabled });
}