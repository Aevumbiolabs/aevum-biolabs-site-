import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AffiliateDashboard({ affiliate, onLogout }) {
  const [personalSales, setPersonalSales] = useState(0);
  const [commissions, setCommissions] = useState({ pending: 0, paid: 0 });
  const [recruits, setRecruits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);

    const { data: salesData } = await supabase
      .from('sales')
      .select('subtotal')
      .eq('affiliate_id', affiliate.id);

    const totalSales = (salesData || []).reduce((sum, s) => sum + Number(s.subtotal), 0);
    setPersonalSales(totalSales);

    const { data: commissionData } = await supabase
      .from('commissions')
      .select('amount, status')
      .eq('affiliate_id', affiliate.id);

    const totals = { pending: 0, paid: 0 };
    (commissionData || []).forEach((c) => {
      totals[c.status] = (totals[c.status] || 0) + Number(c.amount);
    });
    setCommissions(totals);

    if (affiliate.can_recruit) {
      const { data: recruitData } = await supabase
        .from('affiliates')
        .select('id, full_name, referral_code, created_at')
        .eq('sponsor_id', affiliate.id);

      if (recruitData && recruitData.length > 0) {
        const recruitsWithSales = await Promise.all(
          recruitData.map(async (r) => {
            const { data: rSales } = await supabase
              .from('sales')
              .select('subtotal')
              .eq('affiliate_id', r.id);
            const rTotal = (rSales || []).reduce((sum, s) => sum + Number(s.subtotal), 0);
            return { ...r, totalSales: rTotal };
          })
        );
        setRecruits(recruitsWithSales);
      }
    }

    setLoading(false);
  }

  const eligibilityThreshold = 1000;
  const eligibilityProgress = Math.min(100, (personalSales / eligibilityThreshold) * 100);
  const referralLink = `${window.location.origin}/affiliate?ref=${affiliate.referral_code}`;

  function copyReferralLink() {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-[#D4AF6A] font-mono text-sm tracking-wide">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="font-display text-2xl tracking-[0.2em] text-[#F3E7CC]">AEVUM</div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-[#D4AF6A] mt-1">
              AFFILIATE DASHBOARD
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-xs font-mono text-[#8A7B5C] hover:text-[#F3E7CC] tracking-wide"
          >
            LOG OUT
          </button>
        </div>

        <div className="bg-[#0F0C06] border border-[#3A2F17] rounded-lg p-6 mb-6">
          <div className="text-sm text-[#8A7B5C] mb-1">Welcome back,</div>
          <div className="text-xl text-[#F3E7CC] mb-4">{affiliate.full_name}</div>

          <div className="text-sm text-[#8A7B5C] mb-1">Your referral code</div>
          <div className="flex items-center gap-3 mb-4">
            <div className="font-mono text-lg text-[#D4AF6A] tracking-wide">{affiliate.referral_code}</div>
          </div>

          <div className="text-sm text-[#8A7B5C] mb-2">Your referral link</div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 bg-[#1A140A] border border-[#3A2F17] rounded px-3 py-2 text-xs text-[#C9A24A]"
            />
            <button
              onClick={copyReferralLink}
              className="bg-[#D4AF6A] text-[#0A0E1A] font-mono text-xs tracking-wide px-4 py-2 rounded"
            >
              COPY
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0F0C06] border border-[#3A2F17] rounded-lg p-5">
            <div className="text-xs text-[#8A7B5C] mb-1">Personal Sales</div>
            <div className="text-2xl text-[#F3E7CC]">${personalSales.toFixed(2)}</div>
          </div>
          <div className="bg-[#0F0C06] border border-[#3A2F17] rounded-lg p-5">
            <div className="text-xs text-[#8A7B5C] mb-1">Total Commissions Earned</div>
            <div className="text-2xl text-[#F3E7CC]">${(commissions.pending + commissions.paid).toFixed(2)}</div>
            <div className="text-xs text-[#8A7B5C] mt-1">
              ${commissions.paid.toFixed(2)} paid &nbsp;·&nbsp; ${commissions.pending.toFixed(2)} pending
            </div>
          </div>
        </div>

        {!affiliate.can_recruit ? (
          <div className="bg-[#0F0C06] border border-[#3A2F17] rounded-lg p-6 mb-6">
            <div className="text-sm text-[#F3E7CC] mb-2">Recruiting: Locked</div>
            <div className="text-xs text-[#8A7B5C] mb-3">
              Reach $1,000 in personal sales to unlock your own recruiting link and start earning team overrides.
            </div>
            <div className="w-full bg-[#1A140A] rounded-full h-2 mb-2">
              <div
                className="bg-[#D4AF6A] h-2 rounded-full"
                style={{ width: `${eligibilityProgress}%` }}
              />
            </div>
            <div className="text-xs text-[#C9A24A]">
              ${personalSales.toFixed(2)} / ${eligibilityThreshold.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="bg-[#0F0C06] border border-[#3A2F17] rounded-lg p-6">
            <div className="text-sm text-[#F3E7CC] mb-4">Your Team ({recruits.length})</div>
            {recruits.length === 0 ? (
              <div className="text-xs text-[#8A7B5C]">
                No recruits yet. Share your referral link above to start building your team.
              </div>
            ) : (
              <div className="space-y-3">
                {recruits.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border-b border-[#3A2F17] pb-3">
                    <div>
                      <div className="text-sm text-[#F3E7CC]">{r.full_name}</div>
                      <div className="text-xs text-[#8A7B5C] font-mono">{r.referral_code}</div>
                    </div>
                    <div className="text-sm text-[#D4AF6A]">${r.totalSales.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}