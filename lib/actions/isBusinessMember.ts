import { ObjectId } from "mongodb";

import { getBusinessMembersCollection } from "@/lib/collections/businessmember";

export async function isBusinessMember(
  businessId: string,
  userId: string
) {
  const members = await getBusinessMembersCollection();

  return members.findOne({
    businessId,
    userId,
  });
}