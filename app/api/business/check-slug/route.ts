import { NextResponse } from "next/server";
import { checkSlug } from "@/lib/actions/checkslug";
// import checkSlug from "@/lib/actions/checkslug";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { available: false },
      { status: 400 }
    );
  }

  const available = await checkSlug(slug);

  return NextResponse.json({
    available,
  });
}