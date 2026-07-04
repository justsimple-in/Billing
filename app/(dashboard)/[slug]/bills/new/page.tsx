import { InvoiceForm } from "@/components/invoice-form"

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CreateInvoicePage({
  params,
}: Props) {
  const { slug } = await params;

  console.log("CreateInvoicePage slug:", slug);

  return (
    <InvoiceForm
      mode="create"
      slug={slug}
    />
  );
}
