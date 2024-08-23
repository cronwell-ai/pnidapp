'use server';
import { stripe } from "@/lib/stripe";

export async function createPortalSession(customerId: string) {
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/preferences`,
    });
  
    return { id: portalSession.id, url: portalSession.url };
}