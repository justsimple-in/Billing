import { NextResponse } from "next/server";
import { getInvoicesCollection } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  const invoices = await getInvoicesCollection();

  const invoice = await invoices.findOne({
    shareId,
    active: true,
  });

  if (!invoice) {
    return NextResponse.json(
      { error: "Invoice not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(invoice);
}