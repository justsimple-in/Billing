import { getBusinessesCollection } from "@/lib/collections/business";

export async function getBusiness(slug: string) {
  const businesses = await getBusinessesCollection();

  return businesses.findOne({
    slug: slug.toLowerCase(),
  });
}