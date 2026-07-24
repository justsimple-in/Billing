import { NextResponse } from "next/server";
import { getClientsCollection } from "@/lib/mongodb";
import { getAuthorizedBusiness } from "@/lib/actions/getAuthorizedBusiness";
import { getBusinessesCollection } from "@/lib/collections/business";

const defaultInvoiceSettings = {
  fields: {
    carat: true,
    commission: true,
    fare: true,
    previousBalance: true,
    paidAmount: true,
    additionalCharges: true,
    notes: true,
  },
  lastBillNo: 0,
};

const defaultPurchaseSettings = {
  fields: {
    commission: true,
    fare: true,
  },
  lastReceiptNo: 0,
};

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

  if (!business.invoiceSettings || !business.purchaseSettings) {
  const businessCollection = await getBusinessesCollection();

  await businessCollection.updateOne(
    { _id: business._id },
    {
      $set: {
        invoiceSettings:
          business.invoiceSettings ?? defaultInvoiceSettings,
        purchaseSettings:
          business.purchaseSettings ?? defaultPurchaseSettings,
      },
    }
  );

  business.invoiceSettings ??= defaultInvoiceSettings;
  business.purchaseSettings ??= defaultPurchaseSettings;
}

  const collection = await getClientsCollection();

  const clients = await collection
    .find({
      businessId: business._id.toString(),
    })
    .sort({
      clientName: 1,
    })
    .toArray();



  return NextResponse.json({
    clients: clients.map((c) => ({
      _id: c._id.toString(),
      clientName: c.clientName,
      prevBalance: c.prevBalance,
    })),

    invoiceSettings:
      business.invoiceSettings ?? defaultInvoiceSettings,

    purchaseSettings:
      business.purchaseSettings ?? defaultPurchaseSettings,
  });
}