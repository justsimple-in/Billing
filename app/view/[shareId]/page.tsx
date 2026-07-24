import Link from "next/link"
// import { ObjectId } from "mongodb"
import { ArrowLeft } from "lucide-react"
import { getInvoicesCollection } from "@/lib/mongodb"
import { InvoiceShare } from "@/components/invoice-share"
import type { InvoiceDetails } from "@/lib/types"
import type { Metadata } from "next";
import { getBusiness } from "@/lib/actions/getbusiness"


export async function generateMetadata({
  params,
}: {
  params: Promise<{
    shareId: string;
  }>;
}): Promise<Metadata> {
  const { shareId } = await params;

  const invoice = await getInvoice(shareId);

  if (!invoice) {
    return {
      title: "Invoice not found",
      description: "This invoice may have been removed or the link is invalid.",
    };
  }

  return {
    title: `Bill No: ${invoice.billNo}`,
    description: [
      `Client: ${invoice.clientName}`,
      `Date: ${invoice.invoiceDate}`,
      `Balance Due: ₹${invoice.newBalance.toLocaleString()}`
    ].join("\n"),

    openGraph: {
      title: `Bill No: ${invoice.billNo}`,
      description: [
        `Client: ${invoice.clientName}`,
        `Date: ${invoice.invoiceDate}`,
        `Balance Due: ₹${invoice.newBalance.toLocaleString()}`,
      ].join("\n"),

      url: `https://billing.justsimple.in/view/${shareId}`,
      siteName: "billing.justsimple.in",
      type: "website",
    },

    twitter: {
      card: "summary",
      title: `Bill No: ${invoice.billNo}`,
      description: [
        `Client: ${invoice.clientName}`,
        `Date: ${invoice.invoiceDate}`,
        `Balance Due: ₹${invoice.newBalance.toLocaleString()}`,
      ].join("\n"),
    },
  };
}

async function getInvoice(shareId: string): Promise<InvoiceDetails | null> {
  // if (!ObjectId.isValid(id)) return null
  try {
    const invoices = await getInvoicesCollection()
    const doc = await invoices.findOne({
  shareId,
  active: true,
});
    if (!doc) return null
    return {
  businessId: doc.businessId,
  clientId: doc.clientId ?? doc.selectedClientId,
  createdAt: doc.createdAt,
  version: doc.version ?? 1,
  billNo: doc.billNo,
  clientName: doc.clientName,
  invoiceDate: doc.invoiceDate,
  selectedClientId: doc.selectedClientId,
  balance: doc.balance,
  paid: doc.paid,
  fare: doc.fare,
  items: doc.items,
  extra: doc.extra,
  notes: doc.notes,
  total: doc.total,
  newBalance: doc.newBalance,
};
  } catch (err) {
    console.error("[v0] Error loading invoice:", err)
    return null
  }
}

export default async function ViewInvoicePage({
  params,
}: {
  params: Promise<{
    shareId: string
}>
}) {
  const { shareId } = await params
  const invoice = await getInvoice(shareId)
  const bussinessId = invoice?.businessId ?? "unknown"
  const business = await getBusiness(bussinessId)

  // console.log(shareId);

  // console.log(invoice);

  if (!invoice) {
    return (
      <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">Invoice not found</h1>
        <p className="text-muted-foreground">
          This invoice may have been removed or the link is invalid.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <ArrowLeft className="h-4 w-4" /> Create a new invoice
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-svh max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        {/* <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> New Invoice
        </Link> */}
        {/* <span className="text-sm text-muted-foreground">
          Invoice #{invoice.billNo}
        </span> */}
      </div>

      <InvoiceShare
    invoice={invoice}
    shareId={shareId}
/>
    </main>
  )
}
