import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable not set')
}
const stripe = Stripe(stripeKey, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SIGNING_SECRET environment variable not set')
    return new Response('Webhook secret not configured.', { status: 500, headers: corsHeaders })
  }

  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message)
    return new Response(err.message, { status: 400, headers: corsHeaders })
  }

  console.log(`🔔 Received event: ${receivedEvent.type}`)

  if (receivedEvent.type === 'checkout.session.completed') {
    const session = receivedEvent.data.object
    const userId = session.client_reference_id

    if (userId) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
      const user = data?.user

      if (error || !user) {
          console.error('Error fetching user:', error)
          return new Response('User not found', { status: 400 })
      }

      if (user) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: { ...user.app_metadata, is_premium: true },
        })
        
        if (updateError) {
            console.error('Error updating user:', updateError)
            return new Response('Failed to update user', { status: 500 })
        }
        console.log(`User ${userId} upgraded to premium`)
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
