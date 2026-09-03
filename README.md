# Aevum Biolabs — Site

Ready-to-deploy React + Vite site for the Aevum Biolabs peptide menu.
Checkout collects full shipping info, then sends everything to WhatsApp as
one message — there is no cart/payment processing or database in this site
(payment is handled via Zelle after order confirmation on WhatsApp).

## Deploy it (no coding required)

1. **Create a GitHub account** at github.com if you don't have one.
2. **Create a new repository** (e.g. `aevum-biolabs-site`).
3. **Upload these files**: "Add file" → "Upload files", drag this whole
   folder in, commit.
4. **Create a Vercel account** at vercel.com, signing up with GitHub.
5. In Vercel: **Add New Project** → pick the repo → leave defaults → **Deploy**.
6. You'll get a live link like `aevum-biolabs-site.vercel.app`.

## What's in this version

- **All 16 products**, 11 with real photos (auto-cropped and standardized so
  every vial fills the frame consistently), 5 showing a "Photo coming soon"
  placeholder until real photos exist: BPC-157 (alone), TB-500 (alone),
  Ipamorelin (alone), SS31, B12
- **Quantity selector on every product card** — pick a quantity before
  clicking Add to Basket, no need to go into the basket first
- **Automatic bulk discounts** (3+ = 5%, 5+ = 10%, 10+ = 15%, 20+ = 20%,
  50+ = 30%), shown per line item
- **Free shipping banner** at the top of the site, plus a dynamic message in
  the basket ("You're $X away from free shipping" / "You've unlocked free
  shipping!")
- **Full checkout form**: first/last name, email, phone, address, apartment/
  unit, city, state, ZIP, country. All of it gets included in the WhatsApp
  message your friend receives — that message *is* the order record, since
  there's no database or admin dashboard behind this site (see note below)
- **Discount codes**: a simple list of codes in the code itself (see below),
  applies a % off the order total, included in the WhatsApp message
- **Referral links**: a link like `yoursite.vercel.app/?ref=alex` gets
  captured and included in the WhatsApp order message so you can credit that
  sale to Alex manually
- **Clickable Instagram** link in the footer, opens in a new tab

## Important limitation: no backend

This is a static site — nothing is stored on a server. That means:

- There's **no admin dashboard** showing past orders. WhatsApp is the order
  record; each message has everything needed to ship.
- Discount code usage, revenue generated, and affiliate commissions are
  **not tracked automatically**. If you want that, you'd need a real backend
  and database (e.g. Supabase or Firebase) plus an admin dashboard built on
  top of it — a bigger project requiring you to create and pay for those
  services. Happy to help scope that out whenever you're ready.
- There's **no affiliate registration/login system** for the same reason —
  that needs user accounts, which needs a backend with authentication.

## Editing settings

Open `src/App.jsx` — the top of the file has a `CONFIG` section:

- `WHATSAPP_NUMBER` — the number orders go to
- `INSTAGRAM_URL` — where the Instagram link points
- `FREE_SHIPPING_THRESHOLD` — currently 300
- `DISCOUNT_CODES` — add a line like `SARAH15: { percent: 15, active: true }`
  to create a new code, or set `active: false` to disable one without
  deleting it
- `TIERS` — the bulk discount thresholds/rates

After editing, commit the change on GitHub — Vercel redeploys automatically.

## Adding real photos for the placeholder products

1. Drop the photo into `src/assets/products/`
2. In `src/App.jsx`, import it near the top (see the existing `import ... Img`
   lines) and set that product's `img` field in the `PRODUCTS` array (it's
   currently `null` for the five without photos).

## Local development

```
npm install
npm run dev
```
