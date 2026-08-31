# Aevum Biolabs — Site

This is a ready-to-deploy React + Vite project for the Aevum Biolabs peptide
menu page. Orders route to WhatsApp as a single combined basket message —
there is no cart or payment processing in this site (payment is handled via
Zelle after order confirmation on WhatsApp).

## Deploy it (no coding required)

1. **Create a GitHub account** at github.com if you don't have one.
2. **Create a new repository** (e.g. `aevum-biolabs-site`) — keep it Private
   if you'd rather the source code not be public.
3. **Upload these files**: on the repo page, click "Add file" → "Upload
   files", then drag this entire folder in. Commit the upload.
4. **Create a Vercel account** at vercel.com, signing up with your GitHub
   account (it'll ask to connect).
5. In Vercel, click **Add New Project**, pick the `aevum-biolabs-site` repo,
   leave all settings as default (Vercel auto-detects Vite), and click
   **Deploy**.
6. In about a minute you'll get a live link like
   `aevum-biolabs-site.vercel.app` — that's your site, live on the internet.

## What's included

- All 16 products from the price sheet, with real vial photography for 11 of
  them (in `src/assets/products/`) — the other 5 (BPC-157 alone, TB-500 alone,
  Ipamorelin alone, SS31, B12) show a "Photo coming soon" placeholder until
  real photos are added
- **Automatic bulk discounts**: 3+ vials of an item = 5% off, 5+ = 10%, 10+ =
  15%, 20+ = 20%, 50+ = 30%. This is computed live in the basket from each
  product's single-vial price — it closely matches the original printed price
  sheet but isn't guaranteed to match every single cell to the penny (the
  sheet's numbers were rounded by hand per cell). Since your friend confirms
  every order manually on WhatsApp before Zelle payment, this is fine as a
  live estimate rather than a final invoice.
- "Add to Basket" on each product, a floating basket icon with quantity
  controls, and a "Send Order via WhatsApp" button that opens WhatsApp with
  the full order (items, quantities, discounted totals) pre-filled as one
  message
- Zelle payment notice section
- RUO / research-use disclaimers throughout

## Adding real photos for the placeholder products

BPC-157 (alone), TB-500 (alone), Ipamorelin (alone), SS31, and B12 currently
show a placeholder. To add a real photo:

1. Drop the photo into `src/assets/products/`
2. In `src/App.jsx`, import it near the top (see the existing `import ... Img`
   lines) and set that product's `img` field in the `PRODUCTS` array to it
   (it's currently set to `null` for these five).

## Changing bulk discount tiers or thresholds

In `src/App.jsx`, edit the `TIERS` array near the top — each entry is a
`{ min, rate }` pair (minimum quantity, discount rate).

## Changing the WhatsApp number or existing products

- WhatsApp number: open `src/App.jsx`, find `WHATSAPP_NUMBER` near the top.
- Products/prices: same file, edit the `PRODUCTS` array.
- After editing, commit the change on GitHub — Vercel redeploys automatically
  within a minute or two.

## Custom domain (optional)

Buy a domain (Namecheap, Google Domains, ~$10–15/year), then in your Vercel
project go to **Settings → Domains**, add it, and follow the DNS
instructions Vercel shows you.

## Local development (only if you want to run it on your own computer)

```
npm install
npm run dev
```
