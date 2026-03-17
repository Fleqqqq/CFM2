import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables not set')
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    )

    // Get the user from the token
    const { data, error: userError } = await supabaseClient.auth.getUser()
    const user = data?.user

    if (userError || !user) {
      console.error("Auth error:", userError)
      return new Response(JSON.stringify({ 
        error: 'User not authenticated', 
        details: userError 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      })
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable not set")
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    })

    const origin = req.headers.get("origin") || "http://localhost:5173"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1T7ZHnQYTuzAHsGJBRiOe1DX",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancel`,
      client_reference_id: user.id,
      customer_email: user.email,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Checkout session error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})