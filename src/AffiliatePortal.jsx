import { useState } from 'react';
import { supabase } from './supabaseClient';

function generateReferralCode(fullName) {
  const base = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) || 'AFF';
  const random = Math.floor(100 + Math.random() * 900);
  return `${base}${random}`;
}

export default function AffiliatePortal() {
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

      setSuccess(`Welcome! Your referral code is ${referralCode}. Check your email to confirm your account, then log in.`);
      setMode('login');
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

    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex
