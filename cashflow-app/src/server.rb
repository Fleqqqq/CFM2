require 'stripe'
require 'sinatra'
require 'dotenv/load' # For loading .env file

set :static, true
set :port, 4242

# NEVER hardcode your secret key. Use an environment variable.
Stripe.api_key = ENV.fetch('STRIPE_SECRET_KEY')

YOUR_DOMAIN = ENV.fetch('YOUR_DOMAIN', 'http://localhost:4242')

post '/create-checkout-session' do
  content_type 'application/json'
  begin
    prices = Stripe::Price.list(
      lookup_keys: [params['lookup_key']],
      expand: ['data.product']
    )
    if prices.data.empty?
      halt 404, { 'error': { message: "Price not found for lookup_key: #{params['lookup_key']}" } }.to_json
    end

    session = Stripe::Checkout::Session.create({
      mode: 'subscription',
      line_items: [
        {
          quantity: 1,
          price: prices.data[0].id
        }
      ],
      success_url: "#{YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "#{YOUR_DOMAIN}/cancel.html"
    })

    redirect session.url, 303
  rescue Stripe::StripeError => e
    halt 400, { 'error': { message: e.error.message } }.to_json
  rescue => e
    halt 500, { 'error': { message: e.message } }.to_json
  end
end

post '/create-portal-session' do
  content_type 'application/json'
  begin
    # For demonstration purposes, we're using the Checkout session to retrieve the customer_account ID.
    # Typically this is stored alongside the authenticated user in your database.
    checkout_session_id = params['session_id']
    checkout_session = Stripe::Checkout::Session.retrieve(checkout_session_id)

    # This is the URL to which users will be redirected after they're done
    # managing their billing.
    return_url = YOUR_DOMAIN

  session = Stripe::BillingPortal::Session.create({
       customer: checkout_session.customer,
       return_url: return_url
     })
    redirect session.url, 303
  rescue Stripe::StripeError => e
    halt 400, { 'error': { message: e.error.message } }.to_json
  rescue => e
    halt 500, { 'error': { message: e.message } }.to_json
  end
end

post '/webhook' do
  payload = request.body.read
  # It's recommended to load the webhook secret from an environment variable.
  webhook_secret = ENV.fetch('STRIPE_WEBHOOK_SECRET')

  if !webhook_secret.empty?
    # Retrieve the event by verifying the signature using the raw body and secret if webhook signing is configured.
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    event = nil
    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, webhook_secret
      )
    rescue JSON::ParserError => e
      # Invalid payload
      status 400
      return
    rescue Stripe::SignatureVerificationError => e
      # Invalid signature
      puts '⚠️  Webhook signature verification failed.'
      status 400
      return
    end
  else
    # This branch is for testing without a webhook secret.
    # Be sure to set a secret in production.
    data = JSON.parse(payload, symbolize_names: true)
    event = Stripe::Event.construct_from(data)
  end
  
  # Handle the event
  case event.type
  when 'customer.subscription.deleted'
    puts "Subscription canceled: #{event.id}"
    # handle subscription canceled
  when 'customer.subscription.updated'
    puts "Subscription updated: #{event.id}"
    # handle subscription updated
  when 'customer.subscription.created'
    puts "Subscription created: #{event.id}"
    # handle subscription created
  when 'customer.subscription.trial_will_end'
    puts "Subscription trial will end: #{event.id}"
    # handle subscription trial ending
  when 'entitlements.active_entitlement_summary.updated'
    puts "Active entitlement summary updated: #{event.id}"
    # handle active entitlement summary updated
  else
    puts "Unhandled event type: #{event.type}"
  end

  content_type 'application/json'
  { status: 'success' }.to_json
end