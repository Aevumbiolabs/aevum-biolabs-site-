import React, { useState, useMemo, useEffect } from "react";
import { FlaskConical, Instagram, Dna, MessageCircle, ShoppingBasket, X, Plus, Minus, Check, Truck, Tag } from "lucide-react";

import retatrutideImg from "./assets/products/retatrutide.jpeg";
import tesamorelinImg from "./assets/products/tesamorelin.jpeg";
import wolverineImg from "./assets/products/wolverine-stack.jpeg";
import ghkCuImg from "./assets/products/ghk-cu.jpeg";
import cjcIpaImg from "./assets/products/cjc-ipa.jpeg";
import selankImg from "./assets/products/selank.jpeg";
import mt2Img from "./assets/products/mt2.jpeg";
import nadImg from "./assets/products/nad.jpeg";
import motscImg from "./assets/products/motsc.jpeg";
import bacWaterImg from "./assets/products/bacwater.jpeg";
import pt141Img from "./assets/products/pt141.jpeg";
import bpc157Img from "./assets/products/bpc157.png";
import tb500Img from "./assets/products/tb500.png";
import ipamorelinImg from "./assets/products/ipamorelin.png";
import ss31Img from "./assets/products/ss31.png";
import b12Img from "./assets/products/b12.png";
import logoImg from './assets/logo-header.png';
// CONFIG — edit these values directly, no other code changes needed for
// simple adjustments like phone number, shipping threshold, or codes.
// ---------------------------------------------------------------------------

const WHATSAPP_NUMBER = "18136484484"; // +1 (813) 648-4484, digits only for wa.me
const INSTAGRAM_URL = "https://instagram.com/aevumbiolabs";
const FREE_SHIPPING_THRESHOLD = 300;

// Discount codes — add/remove/edit entries here. "percent" is customer
// discount off the order total. "active: false" disables a code without
// deleting it. NOTE: usage counts, revenue, and commissions are NOT tracked
// automatically — there's no database behind this site. Track that manually
// from the WhatsApp messages (each order includes the code used), or this
// becomes a "phase 2" feature once a real backend is set up.
const DISCOUNT_CODES = {
  WELCOME10: { percent: 10, active: true },
};

// Bulk discount tiers — applied by quantity of a single item in the basket.
const TIERS = [
  { min: 50, rate: 0.30 },
  { min: 20, rate: 0.20 },
  { min: 10, rate: 0.15 },
  { min: 5, rate: 0.10 },
  { min: 3, rate: 0.05 },
  { min: 1, rate: 0 },
];

function tierFor(qty) {
  return TIERS.find((t) => qty >= t.min) ?? TIERS[TIERS.length - 1];
}
function lineTotal(unitPrice, qty) {
  const { rate } = tierFor(qty);
  return Math.floor(unitPrice * qty * (1 - rate));
}

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

const PRODUCTS = [
  { id: "reta", name: "Retatrutide", dose: "10MG", img: retatrutideImg, facts: ["GIP / GLP-1 / glucagon receptor triagonist"], price: 130 },
  { id: "tesa", name: "Tesamorelin", dose: "10MG", img: tesamorelinImg, facts: ["GHRH analog peptide"], price: 85 },
  { id: "wolverine", name: "BPC-157 + TB-500", dose: "5MG + 5MG", img: wolverineImg, facts: ["BPC-157 5mg + TB-500 5mg combination"], price: 95 },
  { id: "bpc157", name: "BPC-157", dose: "5MG", img: bpc157Img, facts: ["Gastric pentadecapeptide fragment"], price: 75 },
  { id: "tb500", name: "TB-500", dose: "5MG", img: tb500Img, facts: ["Synthetic Thymosin β4 fragment"], price: 90 },
  { id: "ghkcu", name: "GHK-Cu", dose: "50MG", img: ghkCuImg, facts: ["Copper(II)-binding tripeptide"], price: 65 },
  { id: "cjcipa", name: "CJC-1295 + Ipamorelin", dose: "10MG TOTAL", img: cjcIpaImg, facts: ["CJC-1295 (no DAC) + Ipamorelin combination"], price: 70 },
  { id: "selank", name: "Selank", dose: "11MG", img: selankImg, facts: ["Synthetic tuftsin-analog heptapeptide"], price: 47 },
  { id: "mt2", name: "MT-2 (Melanotan II)", dose: "10MG", img: mt2Img, facts: ["Melanocortin receptor (MC1R/MC4R) ligand"], price: 36 },
  { id: "motsc", name: "MOTS-C", dose: "10MG", img: motscImg, facts: ["Mitochondrial-derived peptide"], price: 70 },
  { id: "nad", name: "NAD+", dose: "100MG", img: nadImg, facts: ["Nicotinamide adenine dinucleotide"], price: 80 },
  { id: "ipa", name: "Ipamorelin", dose: "10MG", img: ipamorelinImg, facts: ["Pentapeptide ghrelin-receptor ligand"], price: 85 },
  { id: "ss31", name: "SS31", dose: "10MG", img: ss31Img, facts: ["Mitochondria-targeted tetrapeptide"], price: 75 },
  { id: "bacwater", name: "BAC Water", dose: "10ML", img: bacWaterImg, facts: ["Bacteriostatic water for reconstitution"], price: 25 },
  { id: "b12", name: "B12", dose: "10MG", img: b12Img, facts: ["Cyanocobalamin"], price: 80 },
  { id: "pt141", name: "PT-141", dose: "10MG", img: pt141Img, facts: ["Bremelanotide, melanocortin receptor agonist"], price: 70 },
];

const fmt = (n) => `$${n}`;

// ---------------------------------------------------------------------------
// LOGO
// ---------------------------------------------------------------------------

 function Logo() {
  return (
    <div className="flex flex-col items-center">
      <img src={logoImg} alt="Aevum Biolabs" className="w-64 md:w-80" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRODUCT IMAGE
// ---------------------------------------------------------------------------

function ProductImage({ p, className }) {
  if (p.img) return <img src={p.img} alt={p.name} className={className} />;
  return (
    <div className={`${className} flex items-center justify-center bg-white`}>
      <div className="flex flex-col items-center gap-1.5 text-[#C9A24A]">
        <FlaskConical size={34} strokeWidth={1.25} />
        <span className="font-mono text-[8px] tracking-[0.15em] text-[#B8A57A] uppercase">Photo coming soon</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FREE SHIPPING BANNER (site-wide, static reminder)
// ---------------------------------------------------------------------------

function ShippingBanner() {
  return (
    <div className="bg-[#D4AF6A] text-[#0A0806]">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase">
        <Truck size={13} />
        Free shipping on orders over {fmt(FREE_SHIPPING_THRESHOLD)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRODUCT CARD — bigger image, quantity selector before Add to Basket
// ---------------------------------------------------------------------------

function ProductCard({ p, onAdd }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(p, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="border border-[#3A2F17] rounded-lg bg-gradient-to-b from-[#0F0C06] to-[#0A0806] overflow-hidden flex flex-col">
      <ProductImage p={p} className="h-72 w-full object-contain p-2" />
      <div className="p-5 flex flex-col flex-1">
        <div className="font-display text-lg text-[#F3E7CC] leading-tight mb-1">{p.name}</div>
        <span className="inline-block mb-3 font-mono text-[10px] tracking-[0.1em] text-[#0A0806] bg-[#D4AF6A] px-2 py-0.5 rounded w-fit">
          {p.dose}
        </span>
        <ul className="space-y-1 mb-4 flex-1">
          {p.facts.map((f, i) => (
            <li key={i} className="text-[12px] text-[#C9BFA3] leading-relaxed">{f}</li>
          ))}
        </ul>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-display text-xl text-[#D4AF6A]">{fmt(p.price)}</span>
            <span className="font-mono text-[10px] text-[#6B5E42] ml-1">/ vial</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-7 w-7 flex items-center justify-center border border-[#3A2F17] text-[#C9BFA3] hover:border-[#D4AF6A] hover:text-[#D4AF6A] rounded"
            >
              <Minus size={12} />
            </button>
            <span className="font-mono text-[13px] text-[#F3E7CC] w-5 text-center">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="h-7 w-7 flex items-center justify-center border border-[#3A2F17] text-[#C9BFA3] hover:border-[#D4AF6A] hover:text-[#D4AF6A] rounded"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#3A2F17] text-[#C9BFA3] px-3.5 py-2.5 rounded hover:border-[#D4AF6A] hover:text-[#D4AF6A] transition-colors mb-2"
        >
          {added ? <><Check size={13} /> Added</> : <><ShoppingBasket size={13} /> Add to Basket</>}
        </button>

        <p className="font-mono text-[9.5px] text-[#6B5E42]">
          3+ save 5% · 5+ save 10% · 10+ save 15% · 20+ save 20% · 50+ save 30%
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BASKET DRAWER
// ---------------------------------------------------------------------------

function BasketDrawer({ open, onClose, cart, onInc, onDec, onRemove, onCheckout, discountCode, setDiscountCode, appliedDiscount, onApplyDiscount, discountError }) {
  const subtotal = useMemo(() => cart.reduce((s, i) => s + lineTotal(i.price, i.qty), 0), [cart]);
  const discountAmount = appliedDiscount ? Math.floor(subtotal * (appliedDiscount.percent / 100)) : 0;
  const total = subtotal - discountAmount;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  return (
    <div className={`fixed inset-0 z-40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-[#0F0C06] border-l border-[#3A2F17] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A2F17]">
          <span className="font-mono text-xs tracking-[0.15em] uppercase text-[#C9BFA3]">
            Basket ({cart.reduce((n, i) => n + i.qty, 0)})
          </span>
          <button onClick={onClose} className="text-[#8A7B5C] hover:text-[#F3E7CC]"><X size={18} /></button>
        </div>

        {/* free shipping progress */}
        <div className="px-5 py-3 border-b border-[#3A2F17] bg-[#12100A]">
          {remainingForFreeShipping > 0 ? (
            <p className="font-mono text-[11px] text-[#D4AF6A] flex items-center gap-1.5">
              <Truck size={12} /> You're {fmt(remainingForFreeShipping)} away from free shipping.
            </p>
          ) : (
            <p className="font-mono text-[11px] text-[#25D366] flex items-center gap-1.5">
              <Check size={12} /> You've unlocked free shipping!
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 && <p className="text-sm text-[#4A4028] font-mono">Basket is empty.</p>}
          {cart.map((item) => {
            const { rate } = tierFor(item.qty);
            const t = lineTotal(item.price, item.qty);
            return (
              <div key={item.id} className="flex gap-3 border-b border-[#3A2F17] pb-3">
                <ProductImage p={item} className="h-14 w-14 object-contain rounded shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm text-[#F3E7CC] font-display leading-tight">{item.name}</p>
                    <button onClick={() => onRemove(item.id)} className="text-[10px] font-mono text-[#8A7B5C] hover:text-[#D4AF6A] shrink-0 ml-2">
                      remove
                    </button>
                  </div>
                  <p className="font-mono text-[10.5px] text-[#8A7B5C] mb-2">
                    {item.dose} · {fmt(item.price)}/vial
                    {rate > 0 && <span className="text-[#D4AF6A]"> · {Math.round(rate * 100)}% off</span>}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onDec(item.id)} className="h-6 w-6 flex items-center justify-center border border-[#3A2F17] text-[#C9BFA3] hover:border-[#D4AF6A] hover:text-[#D4AF6A]">
                        <Minus size={11} />
                      </button>
                      <span className="font-mono text-[12px] text-[#F3E7CC] w-4 text-center">{item.qty}</span>
                      <button onClick={() => onInc(item.id)} className="h-6 w-6 flex items-center justify-center border border-[#3A2F17] text-[#C9BFA3] hover:border-[#D4AF6A] hover:text-[#D4AF6A]">
                        <Plus size={11} />
                      </button>
                    </div>
                    <span className="font-mono text-[12px] text-[#D4AF6A]">{fmt(t)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* discount code */}
        <div className="px-5 py-3 border-t border-[#3A2F17]">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 border border-[#3A2F17] px-2.5">
              <Tag size={12} className="text-[#6B5E42]" />
              <input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Discount code"
                className="w-full bg-transparent py-2 text-[12px] font-mono text-[#F3E7CC] placeholder:text-[#4A4028] focus:outline-none"
              />
            </div>
            <button
              onClick={onApplyDiscount}
              className="font-mono text-[11px] uppercase tracking-[0.08em] border border-[#3A2F17] px-3 text-[#C9BFA3] hover:border-[#D4AF6A] hover:text-[#D4AF6A]"
            >
              Apply
            </button>
          </div>
          {discountError && <p className="font-mono text-[10.5px] text-[#E8896A] mt-1.5">{discountError}</p>}
          {appliedDiscount && (
            <p className="font-mono text-[10.5px] text-[#25D366] mt-1.5">
              {appliedDiscount.percent}% discount applied
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#3A2F17]">
          {appliedDiscount && (
            <>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[11px] text-[#8A7B5C]">Subtotal</span>
                <span className="font-mono text-[11px] text-[#8A7B5C]">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[11px] text-[#25D366]">Discount ({appliedDiscount.percent}%)</span>
                <span className="font-mono text-[11px] text-[#25D366]">-{fmt(discountAmount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#8A7B5C]">Total</span>
            <span className="font-display text-lg text-[#D4AF6A]">{fmt(total)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className={`w-full flex items-center justify-center gap-2 py-3 font-mono text-sm tracking-[0.1em] uppercase transition-colors ${
              cart.length === 0
                ? "bg-[#1C1710] text-[#4A4028] cursor-not-allowed"
                : "bg-[#D4AF6A] text-[#0A0806] hover:bg-[#E5C685]"
            }`}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CHECKOUT MODAL — collects full shipping details, then sends everything to
// WhatsApp as one message (this is the "order record" since there's no
// database/admin dashboard behind this site).
// ---------------------------------------------------------------------------

function CheckoutModal({ open, onClose, cart, subtotal, discountAmount, appliedDiscount, total, referral, onPlaced }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", apt: "", city: "", state: "", zip: "", country: "",
  });

  if (!open) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
    const shippingLine = remainingForFreeShipping === 0 ? "FREE (order qualifies)" : "Standard (does not qualify for free shipping)";

    const lines = cart.map((item) => {
      const { rate } = tierFor(item.qty);
      const t = lineTotal(item.price, item.qty);
      const note = rate > 0 ? ` (${Math.round(rate * 100)}% bulk discount)` : "";
      return `• ${item.name} (${item.dose}) x${item.qty} — $${t}${note}`;
    });

    const message = [
      "Hi, I'd like to place an order:",
      "",
      ...lines,
      "",
      `Subtotal: $${subtotal}`,
      appliedDiscount ? `Discount (${appliedDiscount.percent}% — code applied): -$${discountAmount}` : null,
      `Total: $${total}`,
      `Shipping: ${shippingLine}`,
      referral ? `Referred by: ${referral}` : null,
      "",
      "Shipping to:",
      `${form.firstName} ${form.lastName}`,
      `${form.address}${form.apt ? ", " + form.apt : ""}`,
      `${form.city}, ${form.state} ${form.zip}`,
      form.country,
      "",
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      "",
      "Please send Zelle payment instructions — I'll include the order number in the memo.",
    ].filter(Boolean).join("\n");

    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(link, "_blank");
    onPlaced();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-[#0F0C06] border border-[#3A2F17] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A2F17]">
          <span className="font-mono text-xs tracking-[0.15em] uppercase text-[#C9BFA3]">Checkout</span>
          <button onClick={onClose} className="text-[#8A7B5C] hover:text-[#F3E7CC]"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="First name" value={form.firstName} onChange={set("firstName")} className="bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
            <input required placeholder="Last name" value={form.lastName} onChange={set("lastName")} className="bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
          </div>
          <input required type="email" placeholder="Email" value={form.email} onChange={set("email")} className="w-full bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
          <input required type="tel" placeholder="Phone number" value={form.phone} onChange={set("phone")} className="w-full bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
          <input required placeholder="Shipping address" value={form.address} onChange={set("address")} className="w-full bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
          <input placeholder="Apartment / unit (optional)" value={form.apt} onChange={set("apt")} className="w-full bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
          <div className="grid grid-cols-3 gap-3">
            <input required placeholder="City" value={form.city} onChange={set("city")} className="bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
            <input required placeholder="State" value={form.state} onChange={set("state")} className="bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
            <input required placeholder="ZIP" value={form.zip} onChange={set("zip")} className="bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />
          </div>
          <input required placeholder="Country" value={form.country} onChange={set("country")} className="w-full bg-[#1C1710] border border-[#3A2F17] text-sm text-[#F3E7CC] px-3 py-2.5 placeholder:text-[#4A4028] focus:outline-none focus:border-[#D4AF6A]" />

          <div className="flex justify-between items-center pt-3 border-t border-[#3A2F17]">
            <span className="font-display text-base text-[#D4AF6A]">{fmt(total)}</span>
            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs tracking-[0.1em] uppercase bg-[#25D366] text-[#0A0806] hover:bg-[#2FE377]">
              <MessageCircle size={14} /> Send via WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function App() {
  const [cart, setCart] = useState([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [referral, setReferral] = useState(null);

  // Capture ?ref=alex from the URL on load, for manual affiliate attribution
  // (included in the WhatsApp order message — there's no automatic tracking
  // without a backend).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferral(ref);
  }, []);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...product, qty }];
    });
  };
  const inc = (id) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  const dec = (id) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)));
  const remove = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const itemCount = cart.reduce((n, i) => n + i.qty, 0);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + lineTotal(i.price, i.qty), 0), [cart]);
  const discountAmount = appliedDiscount ? Math.floor(subtotal * (appliedDiscount.percent / 100)) : 0;
  const total = subtotal - discountAmount;

  const applyDiscount = () => {
    setDiscountError("");
    const code = DISCOUNT_CODES[discountCode.trim().toUpperCase()];
    if (!discountCode.trim()) return;
    if (code && code.active) {
      setAppliedDiscount(code);
    } else {
      setAppliedDiscount(null);
      setDiscountError("Invalid or inactive code.");
    }
  };

  const handlePlaced = () => {
    setCart([]);
    setAppliedDiscount(null);
    setDiscountCode("");
    setCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0806] text-[#F3E7CC]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Cinzel', serif; }
        .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      `}</style>

      <ShippingBanner />

      <div className="px-4 sm:px-8 py-10">
        {/* floating basket button */}
        <button
          onClick={() => setBasketOpen(true)}
          className="fixed top-5 right-5 z-30 flex items-center gap-2 border border-[#3A2F17] bg-[#0F0C06] px-3.5 py-2.5 rounded-full hover:border-[#D4AF6A] transition-colors shadow-lg"
        >
          <ShoppingBasket size={16} className="text-[#D4AF6A]" />
          <span className="font-mono text-[12px] text-[#F3E7CC]">{itemCount}</span>
        </button>

        {/* header */}
        <div className="flex flex-col items-center text-center mb-10">
          <Logo />
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-[#D4AF6A] mt-10 mb-2">
            Peptide Collection
          </h1>
          <div className="flex items-center gap-4 text-[11px] font-mono tracking-[0.3em] text-[#8A7B5C] mb-4">
            <span className="h-px w-10 bg-[#3A2F17]" />
            RESEARCH COMPOUNDS
            <span className="h-px w-10 bg-[#3A2F17]" />
          </div>
          <p className="font-mono text-[11.5px] text-[#8A7B5C] max-w-md leading-relaxed">
            Choose a quantity, add to your basket — bulk discounts apply
            automatically at 3, 5, 10, 20, and 50+ vials. Checkout to send
            your order and shipping details to us on WhatsApp in one message.
          </p>
          {referral && (
            <p className="font-mono text-[10.5px] text-[#D4AF6A] mt-3">Referred by: {referral}</p>
          )}
        </div>

        {/* catalog grid */}
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} onAdd={addToCart} />
          ))}
        </div>

        {/* payment notice */}
        <div className="max-w-3xl mx-auto mt-10 border border-[#3A2F17] rounded-lg px-6 py-6 text-center">
          <div className="font-display text-base text-[#D4AF6A] mb-2">
            Secure Payment via Zelle
          </div>
          <p className="font-mono text-[11.5px] text-[#8A7B5C] leading-relaxed max-w-lg mx-auto">
            To keep our pricing competitive and avoid unnecessary processing fees,
            we currently accept Zelle as our preferred payment method. Once your
            order is submitted, payment instructions will be provided to complete
            your purchase securely and efficiently. Please include your order
            number in the payment memo to ensure accurate processing.
          </p>
          <p className="font-mono text-[11px] text-[#D4AF6A] mt-3">
            Thank you for choosing Aevum BioLabs.
          </p>
        </div>

        {/* footer */}
        <div className="max-w-3xl mx-auto mt-4 border border-[#3A2F17] rounded-lg px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FlaskConical size={20} className="text-[#D4AF6A]" />
            <div className="font-mono text-[11px] tracking-[0.15em] text-[#D4AF6A]">FOR RESEARCH USE ONLY</div>
          </div>
          <p className="font-mono text-[10.5px] text-[#8A7B5C] leading-relaxed text-center sm:text-left max-w-md">
            These products are intended for laboratory research purposes only.
            Not intended for human consumption. Not for use in humans. Keep out
            of reach of children. By ordering, you confirm you are 18+ and
            purchasing solely for laboratory research.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-[11px] text-[#D4AF6A] hover:text-[#E5C685] transition-colors"
          >
            <Instagram size={15} /> @AEVUMBIOLABS
          </a>
        </div>
      </div>

      <BasketDrawer
        open={basketOpen}
        onClose={() => setBasketOpen(false)}
        cart={cart}
        onInc={inc}
        onDec={dec}
        onRemove={remove}
        onCheckout={() => { setBasketOpen(false); setCheckoutOpen(true); }}
        discountCode={discountCode}
        setDiscountCode={setDiscountCode}
        appliedDiscount={appliedDiscount}
        onApplyDiscount={applyDiscount}
        discountError={discountError}
      />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        subtotal={subtotal}
        discountAmount={discountAmount}
        appliedDiscount={appliedDiscount}
        total={total}
        referral={referral}
        onPlaced={handlePlaced}
      />
    </div>
  );
}
