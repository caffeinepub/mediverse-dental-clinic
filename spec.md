# Mediverse Dental Clinic — Payment Gateway Integration

## Current State
- Full dental clinic site with appointment booking, admin dashboard, plans page
- No payment functionality exists
- Stripe component selected but not wired
- Backend: Motoko with appointment management and authorization
- Frontend: React + TanStack Router, pages: Home, Plans, AdminLogin, AdminDashboard

## Requested Changes (Diff)

### Add
- Stripe payment gateway integration on the `/plans` pricing page
- PaymentSetup admin UI (inside admin dashboard) to configure Stripe secret key and allowed countries
- `useCreateCheckoutSession` hook to call backend `createCheckoutSession`
- `/payment-success` route with PaymentSuccess component
- `/payment-failure` route with PaymentFailure component
- Backend: Stripe methods — `createCheckoutSession`, `isStripeConfigured`, `setStripeConfiguration`

### Modify
- `/plans` page: Replace WhatsApp CTA buttons with Stripe checkout flow that creates a session and redirects to Stripe-hosted payment page
- Admin dashboard: Add Stripe configuration section (if not yet configured, prompt admin on login)
- App.tsx: Add `/payment-success` and `/payment-failure` routes

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate Motoko backend to include Stripe mixin — `createCheckoutSession`, `isStripeConfigured`, `setStripeConfiguration`
2. Update `backend.d.ts` bindings
3. Create `useCreateCheckoutSession` hook in `src/frontend/src/hooks/useCheckout.ts`
4. Create `PaymentSuccess.tsx` and `PaymentFailure.tsx` pages
5. Update `Plans.tsx` — replace WhatsApp CTAs with Stripe checkout buttons (create session → redirect)
6. Update `AdminDashboard.tsx` — add Stripe config panel (check `isStripeConfigured`, show setup form if not)
7. Update `App.tsx` — add `/payment-success` and `/payment-failure` routes
