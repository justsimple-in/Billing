import { getBusinessesCollection } from "@/lib/collections/business";

export async function checkSlug(slug: string) {
  const businesses = await getBusinessesCollection();

  const business = await businesses.findOne({
    slug: slug.toLowerCase(),
  });

  return !business;
}