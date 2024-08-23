import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import sentryHelper from '@/lib/sentry';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature')

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error: any) {
      sentryHelper.logError(error);
      return NextResponse.json({ message: 'Webhook Error', error: error }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
    const superUser = createClient(supabaseUrl, supabaseKey);

    switch (event.type) {
      case 'checkout.session.completed':
        const session: Stripe.Checkout.Session = event.data.object;
        const userId = session.metadata?.userId;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        const { error } = await superUser
          .from('customers')
          .update({
            stripe_customer_id: session.customer,
            subscription_id: session.subscription,
            is_pro: true,
            auto_renew: subscription.cancel_at_period_end === false,
            curr_period_end: new Date(subscription.current_period_end * 1000),
            subscription_status: subscription.status
          }).eq('auth_user_id', userId)

        if (error) {
          sentryHelper.logError(error);
          return NextResponse.json({ message: 'Error updating customer' }, { status: 500 });
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscriptionEvent: Stripe.Subscription = event.data.object;
        await updateSubscriptionStatus(superUser, subscriptionEvent);
        break;

      case 'invoice.paid':
      case 'invoice.payment_failed':
        const invoice: Stripe.Invoice = event.data.object;
        await handleInvoicePayment(superUser, invoice);
        break;

      /* TODO: Add more cases for other events you want to handle */

      default:
        sentryHelper.logMessage(`Unhandled event type ${event.type}`, false);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    sentryHelper.logError(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

async function updateSubscriptionStatus(supabase: any, subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('customers')
    .update({
      subscription_status: subscription.status,
      is_pro: subscription.status === 'active',
      auto_renew: !subscription.cancel_at_period_end,
      curr_period_end: new Date(subscription.current_period_end * 1000)
    })
    .eq('subscription_id', subscription.id)

  if (error) {
    sentryHelper.logError(error);
  }
}

async function handleInvoicePayment(supabase: any, invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const { error } = await supabase
      .from('customers')
      .update({
        is_pro: invoice.paid,
        curr_period_end: new Date(subscription.current_period_end * 1000),
        subscription_status: subscription.status,
        auto_renew: !subscription.cancel_at_period_end
      })
      .eq('subscription_id', invoice.subscription)

    if (error) {
      sentryHelper.logError(error);
    }
  }
}