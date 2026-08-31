import React, { useState, useMemo } from "react";
import { FlaskConical, Instagram, Dna, MessageCircle, ShoppingBasket, X, Plus, Minus, Check } from "lucide-react";

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

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const WHATSAPP_NUMBER = "18136484484"; // +1 (813) 648-4484, digits only for wa.me

// Bulk discount tiers — applied by quantity of a given catalog item ordered.
// Matches the printed price sheet: 3=5%, 5=10%, 10=15%, 20=20%, 50=30% off.
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

function buildOrderMessage(cart) {
  const lines = cart.map((item) => {
    const { rate } = tierFor(item.qty);
    const total = lineTotal(item.price, item.qty);
    const discountNote = rate > 0 ? ` (${Math.round(rate * 100)}% bulk discount applied)` : "";
    return `• ${item.name} (${item.dose}) x${item.qty} — $${total}${discountNote}`;
  });
  const grandTotal = cart.reduce((s, i) => s + lineTotal(i.price, i.qty), 0);
  return [
    "Hi, I'd like to place an order:",
    "",
    ...lines,
    "",
    `Total: $${grandTotal}`,
    "",
    "Please send Zelle payment instructions — I'll include the order number in the memo.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// DATA — neutral chemistry facts only, full 16-product catalog with confirmed
// single-vial pricing. Bulk tiers computed dynamically from unit price.
// ---------------------------------------------------------------------------

const PRODUCTS = [
  { id: "reta", name: "Retatrutide", dose: "10MG", img: retatrutideImg, facts: ["GIP / GLP-1 / glucagon receptor triagonist"], price: 130 },
  { id: "tesa", name: "Tesamorelin", dose: "10MG", img: tesamorelinImg, facts: ["GHRH analog peptide"], price: 85 },
  { id: "wolverine", name: "BPC-157 + TB-500", dose: "5MG + 5MG", img: wolverineImg, facts: ["BPC-157 5mg + TB-500 5mg combination"], price: 95 },
  { id: "bpc157", name: "BPC-157", dose: "5MG", img: null, facts: ["Gastric pentadecapeptide fragment"], price: 75 },
  { id: "tb500", name: "TB-500", dose: "5MG", img: null, facts: ["Synthetic Thymosin β4 fragment"], price: 90 },
  { id: "ghkcu", name: "GHK-Cu", dose: "50MG", img: ghkCuImg, facts: ["Copper(II)-binding tripeptide"], price: 65 },
  { id: "cjcipa", name: "CJC-1295 + Ipamorelin", dose: "10MG TOTAL", img: cjcIpaImg, facts: ["CJC-1295 (no DAC) + Ipamorelin combination"], price: 70 },
  { id: "selank", name: "Selank", dose: "11MG", img: selankImg, facts: ["Synthetic tuftsin-analog heptapeptide"], price: 47 },
  { id: "mt2", name: "MT-2 (Melanotan II)", dose: "10MG", img: mt2Img, facts: ["Melanocortin receptor (MC1R/MC4R) ligand"], price: 36 },
  { id: "motsc", name: "MOTS-C", dose: "10MG", img: motscImg, facts: ["Mitochondrial-derived peptide"], price: 70 },
  { id: "nad", name: "NAD+", dose: "100MG", img: nadImg, facts: ["Nicotinamide adenine dinucleotide"], price: 80 },
  { id: "ipa", name: "Ipamorelin", dose: "10MG", img: null, facts: ["Pentapeptide ghrelin-receptor ligand"], price: 85 },
  { id: "ss31", name: "SS31", dose: "10MG", img: null, facts: ["Mitochondria-targeted tetrapeptide"], price: 75 },
  { id: "bacwater", name: "BAC Water", dose: "10ML", img: bacWaterImg, facts: ["Bacteriostatic water for reconstitution"], price: 25 },
  { id: "b12", name: "B12", dose: "10MG", img: null, facts: ["Cyanocobalamin"], price: 80 },
  { id: "pt141", name: "PT-141", dose: "10MG", img: pt141Img, facts: ["Bremelanotide, melanocortin receptor agonist"], price: 70 },
];

const fmt = (n) => `$${n}`;

// ---------------------------------------------------------------------------
// LOGO
// ---------------------------------------------------------------------------

function Logo() {
  return (
    <div className="flex flex-col items-center">
      <Dna size={34} className="text-[#D4AF6A] mb-2" strokeWidth={1.25} />
      <div className="font-display text-3xl tracking-[0.35em] text-[#F3E7CC]">AEVUM</div>
      <div className="font-mono text-[10px] tracking-[0.5em] text-[#D4AF6A] mt-1">BIOLABS</div>
      <div className="font-mono text-[9px] tracking-[0.25em] text-[#8A7B5C] mt-2">
        SCIENCE &nbsp;·&nbsp; PRECISION &nbsp;·&nbsp; ETERNITY
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRODUCT IMAGE — real photo, or a styled placeholder vial silhouette
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
// PRODUCT CARD
// ---------------------------------------------------------------------------

function ProductCard({ p, onAdd }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    onAdd(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  };

  return (
    <div className="border border-[#3A2F17] rounded-lg bg-gradient-to-b from-[#0F0C06] to-[#0A0806] overflow-hidden flex flex-col">
      <ProductImage p={p} className="h-48 w-full object-contain p-4" />
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
        <div className="flex items-center justify-between pt-3 border-t border-[#3A2F17]">
          <div>
            <span className="font-display text-xl text-[#D4AF6A]">{fmt(p.price)}</span>
            <span className="font-mono text-[10px] text-[#6B5E42] ml-1">/ vial</span>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#3A2F17] text-[#C9BFA3] px-3.5 py-2 rounded hover:border-[#D4AF6A] hover:text-[#D4AF6A] transition-colors"
          >
            {added ? <><Check size={13} /> Added</> : <><ShoppingBasket size={13} /> Add</>}
          </button>
        </div>
        <p className="font-mono text-[9.5px] text-[#6B5E42] mt-2">
          3+ save 5% · 5+ save 10% · 10+ save 15% · 20+ save 20% · 50+ save 30%
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BASKET DRAWER
// ---------------------------------------------------------------------------

function BasketDrawer({ open, onClose, cart, onInc, onDec, onRemove }) {
  const grandTotal = useMemo(() => cart.reduce((s, i) => s + lineTotal(i.price, i.qty), 0), [cart]);
  const message = useMemo(() => buildOrderMessage(cart), [cart]);
  const sendLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

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

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 && <p className="text-sm text-[#4A4028] font-mono">Basket is empty.</p>}
          {cart.map((item) => {
            const { rate } = tierFor(item.qty);
            const total = lineTotal(item.price, item.qty);
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
                    <span className="font-mono text-[12px] text-[#D4AF6A]">{fmt(total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-[#3A2F17]">
          <div className="flex justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#8A7B5C]">Total</span>
            <span className="font-display text-lg text-[#D4AF6A]">{fmt(grandTotal)}</span>
          </div>
          <p className="font-mono text-[10px] text-[#8A7B5C] leading-relaxed mb-4">
            Bulk discounts apply automatically per item. Payment is handled via
            Zelle after your order is confirmed on WhatsApp.
          </p>
          <a
            href={cart.length === 0 ? undefined : sendLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={cart.length === 0}
            onClick={(e) => { if (cart.length === 0) e.preventDefault(); }}
            className={`w-full flex items-center justify-center gap-2 py-3 font-mono text-sm tracking-[0.1em] uppercase transition-colors ${
              cart.length === 0
                ? "bg-[#1C1710] text-[#4A4028] cursor-not-allowed pointer-events-none"
                : "bg-[#25D366] text-[#0A0806] hover:bg-[#2FE377]"
            }`}
          >
            <MessageCircle size={15} /> Send Order via WhatsApp
          </a>
        </div>
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

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const inc = (id) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  const dec = (id) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)));
  const remove = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const itemCount = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="min-h-screen bg-[#0A0806] text-[#F3E7CC] px-4 sm:px-8 py-14">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Cinzel', serif; }
        .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      `}</style>

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
          Add items to your basket — bulk discounts apply automatically at 3,
          5, 10, 20, and 50+ vials. Send your order to us on WhatsApp in one
          message and we'll send Zelle payment instructions.
        </p>
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
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#D4AF6A]">
          <Instagram size={15} /> @AEVUMBIOLABS
        </div>
      </div>

      <BasketDrawer
        open={basketOpen}
        onClose={() => setBasketOpen(false)}
        cart={cart}
        onInc={inc}
        onDec={dec}
        onRemove={remove}
      />
    </div>
  );
}
