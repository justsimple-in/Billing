import { auth } from "../auth";
import { getBusiness } from "./getbusiness";

export async function getAuthorizedBusiness(slug: string) {
    const session = await auth();

    if (!session?.user) {
        return null;
    }

    const business = await getBusiness(slug);

    if (!business) {
        return null;
    }

    if (business.ownerId !== session.user.id) {
        return null;
    }

    return business;
}