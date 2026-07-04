import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { getUserBusiness } from "@/lib/actions/getUserBusiness";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 });
  }

  const business = await getUserBusiness(session.user.id);

  if (!business) {
    return NextResponse.json({
      slug: null,
    });
  }

  return NextResponse.json({
    slug: business.slug,
  });
}