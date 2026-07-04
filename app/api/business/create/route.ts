import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { getBusinessesCollection } from "@/lib/collections/business";
import { getBusinessMembersCollection } from "@/lib/collections/businessmember";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const {
    name,
    slug,
    address,
    phone,
  } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const businesses = await getBusinessesCollection();

  const exists = await businesses.findOne({
    slug: slug.toLowerCase(),
  });

  if (exists) {
    return NextResponse.json(
      { error: "Slug already exists" },
      { status: 400 }
    );
  }

  const result = await businesses.insertOne({
    name,
    slug: slug.toLowerCase(),
    address,
    phone,
    ownerId: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const members = await getBusinessMembersCollection();

  await members.insertOne({
    businessId: result.insertedId.toString(),
    userId: session.user.id,
    role: "OWNER",
  });

  return NextResponse.json({
    success: true,
    slug,
  });
}