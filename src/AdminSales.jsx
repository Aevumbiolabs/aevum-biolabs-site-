import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const PERSONAL_RATE = 0.15;
const OVERRIDE_RATE = 0.05;

export default function AdminSales() {
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  const [affiliates, setAffiliates] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  const [affiliateId, setAffiliateId] = useState('');
  const [amount, setAmount] = useState('');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setNotLoggedIn(true);
      setCheckingAccess(false);
      return;
    }

    const { data: affiliateRow } = await supabase
      .from('affiliates')
      .select('*')
      .eq('auth_user_id', session.user.id)
      .single();

    if (!affiliateRow || !affiliateRow.is_admin) {
      setAuthorized(false);
      setCheckingAccess(false);
      return;
    }

    setAdminEmail(session.user.email || '');
    setAuthorized(true);
    setCheckingAccess(false);
    loadAffiliates();
    loadRecentSales();
  }

  async function loadAffiliates() {
    const { data } = await supabase
      .from('affiliates')
      .select('id, full_name, email, referral_code, sponsor_id')
      .order('full_name', { ascending: true });
    if (data) setAffiliates(data);
  }

  async function loadRecentSales() {
    const { data } = await supabase
      .from('sales')
      .select('id, subtotal, sale_date, created_by, affiliate_id')
      .order('sale_date', { ascending: false })
      .limit(20);
    if (data) setRecentSales(data);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function affiliateName(id) {
    const a = affiliates.find((x) => x.id === id);
    return a ? `${a.full_name} (${a.referral_code})` : id;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const numericAmount = parseFloat(amount);
    if (!affiliateId) {
      setError('Please select an affiliate.');
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Insert the sale
      const { data: saleRow, error: saleErr } = await supabase
        .from('sales')
        .insert({
          affiliate_id: affiliateId,
          subtotal: numericAmount,
          sale_date: saleDate,
          created_by: adminEmail,
        })
        .select()
        .single();

      if (saleErr) {
        setError(`Could not save sale: ${saleErr.message}`);
        setSubmitting(false);
        return;
      }

      // 2. Personal commission (15%)
      const personalCommission = Math.round(numericAmount * PERSONAL_RATE * 100) / 100;
      const { error: personalErr } = await supabase.from('commissions').insert({
        affiliate_id: affiliateId,
        sale_id: saleRow.id,
        role: 'personal',
        rate: PERSONAL_RATE,
        amount: personalCommission,
        status: 'pending',
      });

      if (personalErr) {
        setError(`Sale saved, but personal commission failed: ${personalErr.message}`);
        setSubmitting(false);
        return;
      }

      // 3. Team override (5%) to sponsor, if one exists
      const soldByAffiliate = affiliates.find((a) => a.id === affiliateId);
      if (soldByAffiliate && soldByAffiliate.sponsor_id) {
        const overrideCommission = Math.round(numericAmount * OVERRIDE_RATE * 100) / 100;
        const { error: overrideErr } = await supabase.from('commissions').insert({
          affiliate_id: soldByAffiliate.sponsor_id,
          sale_id: saleRow.id,
          role: 'override',
          rate: OVERRIDE_RATE,
          amount: overrideCommission,
          status: 'pending',
        });

        if (overrideErr) {
          setError(`Sale and personal commission saved, but override commission failed: ${overrideErr.message}`);
          setSubmitting(false);
          return;
        }
      }

      setSuccess(`Sale of $${numericAmount.toFixed(2)} logged for ${affiliateName(affiliateId)}.`);
      setAmount('');
      setAffiliateId('');
      loadRecentSales();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  }

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-[#D4AF6A] font-mono text-sm tracking-wide">LOADING...</div>
      </div>
    );
  }

  if (notLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-[#F3E7CC] font-mono text-sm mb-3">You need to log in first.</div>
          <a href="/affiliate" className="text-[#D4AF6A] font-mono text-sm underline">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-4">
        <div className="text-[#E8896A] font-mono text-sm">Not authorized.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="font-display text-2xl tracking-[0.2em] text-[#F3E7CC]">AEVUM</div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-[#D4AF6A] mt-1">
            ADMIN — LOG A SALE
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0F0C06] border border-[#3A2F17] rounded-lg p-6 space-y-4 mb-8"
        >
          <div>
            <label className="block font-mono text-[10px] tracking-[0.1em] text-[#8A7B5C] mb-1.5">
              AFFILIATE
            </label>
            <select
              value={affiliateId}
              onChange={(e) => setAffiliateId(e.target.value)}
              className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2.5 text-[#F3E7CC]"
            >
              <option value="">Select an affiliate...</option>
              {affiliates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name} — {a.referral_code} ({a.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-[0.1em] text-[#8A7B5C] mb-1.5">
              FINAL SALE AMOUNT (AFTER DISCOUNTS, EXCLUDING SHIPPING)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2.5 text-[#F3E7CC] placeholder-[#8A7B5C]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-[0.1em] text-[#8A7B5C] mb-1.5">
              SALE DATE
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2.5 text-[#F3E7CC]"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded p-3">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-400 bg-green-900/20 border border-green-900/40 rounded p-3">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#D4AF6A] text-[#0A0E1A] font-mono tracking-wide py-2.5 rounded disabled:opacity-50"
          >
            {submitting ? 'LOGGING SALE...' : 'LOG SALE'}
          </button>
        </form>

        <div className="bg-[#0F0C06] border border-[#3A2F17] rounded-lg p-6">
          <div className="font-mono text-[10px] tracking-[0.15em] text-[#8A7B5C] mb-4">
            RECENT ENTRIES
          </div>
          {recentSales.length === 0 && (
            <p className="text-sm text-[#4A4028] font-mono">No sales logged yet.</p>
          )}
          <div className="space-y-2">
            {recentSales.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center border-b border-[#3A2F17] pb-2"
              >
                <div>
                  <div className="text-sm text-[#F3E7CC]">{affiliateName(s.affiliate_id)}</div>
                  <div className="font-mono text-[10px] text-[#6B5E42]">{formatDate(s.sale_date)}</div>
                </div>
                <div className="font-mono text-sm text-[#D4AF6A]">
                  ${Number(s.subtotal).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
