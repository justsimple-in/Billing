import { PurchaseReceiptForm } from "@/components/purchase/PurchaseReceiptForm"

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CreatePurchaseReceiptPage({
  params,
}: Props) {
  const { slug } = await params;

  return (
    <PurchaseReceiptForm
      mode="create"
      slug={slug}
    />
  );
}