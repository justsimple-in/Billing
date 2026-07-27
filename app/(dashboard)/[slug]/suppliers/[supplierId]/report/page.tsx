import { SupplierReportView } from "@/components/suppliers/report/SupplierReportView";

interface Props {
  params: Promise<{
    slug: string;
    supplierId: string;
  }>;
}

export default async function SupplierReportPage({ params }: Props) {
  const { slug, supplierId } = await params;

  return <SupplierReportView slug={slug} supplierId={supplierId} />;
}