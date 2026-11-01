# KYLQOR Store — starter

A responsive dark storefront prototype in plain HTML/CSS/JS.

## Included
- Product grid and demo product cards
- Cart drawer and INR totals
- Checkout form with COD / online payment choice
- Supabase starter SQL schema

## Important before launch
This is a **front-end prototype**, not a live store. The checkout currently runs in demo mode and does not save or transmit orders. Online payments are intentionally disabled until a server-side payment integration is configured.

## Next setup steps
1. Create a Supabase project.
2. Run `supabase/schema.sql` in its SQL Editor.
3. Add a server-side Supabase Edge Function for order creation and validation.
4. Add an admin-only authenticated dashboard with role checks. Never expose service-role keys in browser code.
5. Integrate a payment gateway (for example Razorpay) through server-side order creation and verified webhooks. Never put secret keys in `app.js`.
6. Add Shiprocket only after order creation and address validation work.
7. Deploy this folder to Netlify and connect a domain when ready.

## Product details
Edit the `PRODUCTS` array in `app.js`. Replace the CSS shirt illustration with actual product photos before launch.

## Teen founder note
Payment-gateway merchant onboarding, business/KYC details, and payout accounts may require a parent/guardian or an eligible adult account holder. Get an adult's help and follow the provider's terms.
