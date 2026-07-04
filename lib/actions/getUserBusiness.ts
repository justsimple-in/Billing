import { getBusinessMembersCollection } from "@/lib/collections/businessmember";
import { getBusinessesCollection } from "@/lib/collections/business";
import { ObjectId } from "mongodb";

export async function getUserBusiness(userId: string) {
  const members = await getBusinessMembersCollection();

  const member = await members.findOne({
    userId,
  });

  if (!member) {
    return null;
  }

  const businesses = await getBusinessesCollection();

  const business = await businesses.findOne({
  _id: new ObjectId(member.businessId),
});

  return business;
}