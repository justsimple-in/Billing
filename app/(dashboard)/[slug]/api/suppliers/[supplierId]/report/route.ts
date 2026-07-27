import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";
import { getPaymentsCollection } from "@/lib/collections/payments";
import { getPurchaseReceiptsCollection } from "@/lib/collections/purchaseReceipt";
import { getSuppliersCollection } from "@/lib/collections/suppliers";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string) {
  return ISO_DATE_PATTERN.test(value);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; supplierId: string }> },
) {
  try {
    const { slug, supplierId } = await params;

    const business = await getAuthorizedBusiness(slug);

    if (!business) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!ObjectId.isValid(supplierId)) {
      return NextResponse.json({ error: "Invalid supplier" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";

    if (!isValidIsoDate(from) || !isValidIsoDate(to)) {
      return NextResponse.json(
        { error: "from and to are required in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    if (to < from) {
      return NextResponse.json(
        { error: "To Date must be on or after From Date" },
        { status: 400 },
      );
    }

    const suppliers = await getSuppliersCollection();
    const supplier = await suppliers.findOne(
      {
        _id: new ObjectId(supplierId),
        businessId: business._id.toString(),
      },
      {
        projection: {
          supplierName: 1,
          phone: 1,
          address: 1,
          businessId: 1,
        },
      },
    );

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    const businessId = business._id.toString();
    const supplierIdString = supplier._id.toString();

    const receiptsCollection = await getPurchaseReceiptsCollection();
    const paymentsCollection = await getPaymentsCollection();

    const [receiptDocs, paymentDocs] = await Promise.all([
      receiptsCollection
        .find(
          {
            businessId,
            selectedSupplierId: supplierIdString,
            active: true,
            receiptDate: {
              $gte: from,
              $lte: to,
            },
          },
          {
            projection: {
              _id: 1,
              receiptDate: 1,
              total: 1,
              createdAt: 1,
              "items.description": 1,
              "items.unitCount": 1,
              "items.weightPerUnit": 1,
              "items.pricePerKg": 1,
              "items.fare": 1,
              "items.itemTotal": 1,
            },
          },
        )
        .sort({
          receiptDate: 1,
          createdAt: 1,
          _id: 1,
        })
        .toArray(),
      paymentsCollection
        .find(
          {
            businessId,
            selectedSupplierId: supplierIdString,
            active: true,
            paymentDate: {
              $gte: from,
              $lte: to,
            },
          },
          {
            projection: {
              _id: 1,
              paymentDate: 1,
              amount: 1,
              notes: 1,
              createdAt: 1,
            },
          },
        )
        .sort({
          paymentDate: 1,
          createdAt: 1,
          _id: 1,
        })
        .toArray(),
    ]);

    const receipts = receiptDocs.map((receipt) => ({
      _id: receipt._id.toString(),
      date: receipt.receiptDate,
      total: Number(receipt.total ?? 0),
      items: (receipt.items ?? []).map((item) => ({
        itemName: String(item.description ?? ""),
        carats: Number(item.unitCount ?? 0),
        weightPerCarat: Number(item.weightPerUnit ?? 0),
        pricePerKg: Number(item.pricePerKg ?? 0),
        fare: Number(item.fare ?? 0),
        amount: Number(item.itemTotal ?? 0),
      })),
    }));

    const payments = paymentDocs.map((payment) => ({
      _id: payment._id.toString(),
      date: payment.paymentDate,
      amount: Number(payment.amount ?? 0),
      notes: String(payment.notes ?? ""),
    }));

    const receiptTotal = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
    const paymentTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json({
      supplier: {
        _id: supplierIdString,
        name: supplier.supplierName,
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
      },
      from,
      to,
      receipts,
      payments,
      totals: {
        receipts: receiptTotal,
        payments: paymentTotal,
        outstanding: receiptTotal - paymentTotal,
      },
    });
  } catch (error) {
    console.error("[SupplierReport] Error fetching report:", error);

    return NextResponse.json(
      { error: "Failed to fetch supplier report" },
      { status: 500 },
    );
  }
}