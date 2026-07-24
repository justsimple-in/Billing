import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

import { getUserBusiness } from "@/lib/actions/getUserBusiness";
import { getBusinessMembersCollection } from "@/lib/collections/businessmember";
import { getBusinessesCollection } from "@/lib/collections/business";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 });
  }

  // console.log("User ID:", session.user.id);

  const businessMembersCollection =
    await getBusinessMembersCollection();

    const memberships = await businessMembersCollection
    .find({
      userId: session.user.id,
    })
    .toArray();

    // console.log("Memberships:", memberships);



    if (memberships.length === 0) {
    return NextResponse.json({
      businesses: [],
    });
  }

  const businessIds = memberships.map(
  (member) => new ObjectId(member.businessId)
);

  // console.log("Business IDs:", businessIds);

  


  const businessCollection =
    await getBusinessesCollection();

//     const one = await businessCollection.findOne({});
// console.log("Finding single business: ", one);
// console.log("Type of one._id: ", typeof one?._id);


// const business = await businessCollection.findOne({
//   _id: new ObjectId("6a48b066efe05eaca5de0c8e"),
// });

// console.log("Finding business with hardcoded ID: ", business);


    const businesses = await businessCollection
    .find({
      _id: {
        $in: businessIds,
      },
    })
    .toArray();

    // console.log("Businesses:", businesses);

 const result = businesses.map((business) => {
    const membership = memberships.find(
      (member) => member.businessId === business._id
    );

    // // console.log("result mapping - Business:", business, "Membership:", membership);
  
    return {
      id: business._id,
      slug: business.slug,
      businessName: business.businessName,
      role: membership?.role,
    };
  });

  return NextResponse.json({
    businesses: result,
  });
}