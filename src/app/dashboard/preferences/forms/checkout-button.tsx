'use client'
import { Button } from "@/components/ui/button"
import { loadStripe } from "@stripe/stripe-js"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import sentryHelper from "@/lib/sentry"


export default function CheckoutButton() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      sentryHelper.logError(error)
      return
    }
    if (!data?.user) {
      sentryHelper.logMessage("data.user is empty", true)
      return
    }
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    const stripe = await stripePromise;
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    const { session_id } = await response.json()
    await stripe?.redirectToCheckout({ sessionId: session_id });
    setLoading(false)
  }
  return (
    <Button variant="link" className="p-0 w-min h-min" onClick={() => handleCheckout()} disabled={loading}>
      {loading ? "Loading..." : "Pro plan"}
    </Button>
  )
}