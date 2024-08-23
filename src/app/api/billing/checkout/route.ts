import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import sentryHelper from "@/lib/sentry";

export async function POST() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    sentryHelper.logError(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }

  if (!data?.user) {
    sentryHelper.logMessage("data.user is empty", false);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }

  const user = data.user;
  try {
    const priceId = process.env.NEXT_PUBLIC_PRICE_ID!;
    const userId = user.id;
    const email = user.email;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: email,
      metadata: {
        userId: userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/preferences`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/preferences`,
    });
    return NextResponse.json({ session_id: session.id });
  } catch (error: any) {
    sentryHelper.logError(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}