import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AffiliateDashboard from './AffiliateDashboard';

function generateReferralCode(fullName) {
  const base = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) || 'AFF';
  const random = Math.floor(100 + Math.random() * 900);
  return `${base}${random}`;
}

export default function AffiliatePortal() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [affiliate, setAffiliate] = useState(null);

  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: affiliateRow } = await supabase
        .from('affiliates')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();
      if (affiliateRow) {
        setAffiliate(affiliateRow);
      }
    }
    setCheckingSession(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAffiliate(null);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let sponsorId = null;
      if (sponsorCode.trim()) {
        const { data: sponsor, error: sponsorErr } = await supabase
          .from('affiliates')
          .select('id, can_recruit')
          .eq('referral_code', sponsorCode.trim().toUpperCase())
          .single();

        if (sponsorErr || !sponsor) {
          setError('That referral code was not found. Double-check it and try again.');
          setLoading(false);
          return;
        }
        if (!sponsor.can_recruit) {
          setError('That affiliate has not unlocked recruiting yet.');
          setLoading(false);
          return;
        }
        sponsorId = sponsor.id;
      }

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authErr) {
        setError(authErr.message);
        setLoading(false);
        return;
      }

      const referralCode = generateReferralCode(fullName);
      const { error: insertErr } = await supabase.from('affiliates').insert({
        auth_user_id: authData.user.id,
        full_name: fullName,
        email,
        referral_code: referralCode,
        sponsor_id: sponsorId,
        can_recruit: false,
      });

      if (insertErr) {
        setError('Account created, but there was an issue setting up your affiliate profile. Contact support.');
        setLoading(false);
        return;
      }

      setSuccess(`Welcome! Your referral code is ${referralCode}.`);
      await checkExistingSession();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginErr) {
      setError(loginErr.message);
      setLoading(false);
      return;
    }

    await checkExistingSession();
    setLoading(false);
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-[#D4AF6A] font-mono text-sm tracking-wide">LOADING...</div>
      </div>
    );
  }

  if (affiliate) {
    return <AffiliateDashboard affiliate={affiliate} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0F0C06] border border-[#3A2F17] rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="font-display text-2xl tracking-[0.2em] text-[#F3E7CC]">AEVUM</div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-[#D4AF6A] mt-1">
            AFFILIATE PORTAL
          </div>
        </div>

        <div className="flex mb-6 border border-[#3A2F17] rounded-md overflow-hidden">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-mono tracking-wide ${mode === 'login' ? 'bg-[#D4AF6A] text-[#0A0E1A]' : 'text-[#C9A24A]'}`}
          >
            LOG IN
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-mono tracking-wide ${mode === 'signup' ? 'bg-[#D4AF6A] text-[#0A0E1A]' : 'text-[#C9A24A]'}`}
          >
            SIGN UP
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded p-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-400 bg-green-900/20 border border-green-900/40 rounded p-3">
            {success}
          </div>
        )}

        {mode === 'signup' ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <input type="text" placeholder="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2 text-[#F3E7CC] placeholder-[#8A7B5C]" />
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2 text-[#F3E7CC] placeholder-[#8A7B5C]" />
            <input type="password" placeholder="Password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2 text-[#F3E7CC] placeholder-[#8A7B5C]" />
            <input type="text" placeholder="Referral code (optional)" value={sponsorCode} onChange={(e) => setSponsorCode(e.target.value)} className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2 text-[#F3E7CC] placeholder-[#8A7B5C]" />
            <button type="submit" disabled={loading} className="w-full bg-[#D4AF6A] text-[#0A0E1A] font-mono tracking-wide py-2 rounded disabled:opacity-50">
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2 text-[#F3E7CC] placeholder-[#8A7B5C]" />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1A140A] border border-[#3A2F17] rounded px-4 py-2 text-[#F3E7CC] placeholder-[#8A7B5C]" />
            <button type="submit" disabled={loading} className="w-full bg-[#D4AF6A] text-[#0A0E1A] font-mono tracking-wide py-2 rounded disabled:opacity-50">
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
