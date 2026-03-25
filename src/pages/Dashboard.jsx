// src/pages/Dashboard.jsx
import Navbar from '../components/Navbar';
import WalletCard from '../components/WalletCard';
import NFTGrid from '../components/NFTGrid';
import Stat from '../components/Stat';

import { getUserSecretKey } from '../services/wallet';
import { fetchUserNFTs } from '../services/api';
import { useAppStore } from '../store/useAppStore';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import OnboardingModal from '../components/OnboardingModal';

export default function Dashboard() {
  const { wallet, setWallet, nfts, setNFTs } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [secretVisible, setSecretVisible] = useState(false);
  const [secretValue, setSecretValue] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(location.state?.firstLogin === true);

  const loadNFTs = async (addr) => {
    const address = addr || wallet?.address;
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const items = await fetchUserNFTs(address);
      setNFTs(items || []);
    } catch (err) {
      setError(err?.message || 'Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rehydrate = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
      if (!u) { setWallet(null); return; }
      const { data, error } = await supabase
        .from('wallets')
        .select('public_key')
        .eq('user_email', u.email)
        .maybeSingle();
      if (!error && data?.public_key) setWallet({ address: data.public_key });
      else if (!error) setWallet(null);
    };
    rehydrate();
    const { data: sub } = supabase.auth.onAuthStateChange(() => rehydrate());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (wallet?.address) loadNFTs(wallet.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.address]);

  const handleViewSecret = async () => {
    try {
      setError(null);
      const secret = await getUserSecretKey();
      setSecretValue(String(secret || ''));
      setSecretVisible(true);
    } catch (e) {
      setError(e?.message || 'Failed to load secret');
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="container-px mx-auto max-w-screen-xl pt-6 sm:pt-12 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="text-zinc-500 text-base mb-1">{greeting()}</div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            {firstName ? `${firstName}'s collection` : 'Your collection'}
          </h1>
          <p className="mt-2 text-zinc-500 text-base">
            Your on-chain attendance badges, all in one place.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8"
        >
          <WalletCard address={wallet?.address} onViewSecret={handleViewSecret} />

          <Stat
            label="Badges collected"
            value={(nfts && nfts.length) || 0}
            accent
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />

          {/* Actions card */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500/40 via-cyan-500/40 to-transparent" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Quick actions</div>
            </div>
            <div className="flex flex-col gap-2">
              {wallet?.address && (
                <Link
                  to="/scan"
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all"
                >
                  Scan QR to mint →
                </Link>
              )}
              <button
                onClick={() => loadNFTs()}
                disabled={loading || !wallet?.address}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-40 border border-zinc-700/50"
              >
                {loading ? 'Refreshing...' : 'Refresh badges'}
              </button>
            </div>
            {error && <div className="mt-3 text-xs text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">{error}</div>}
          </div>
        </motion.div>

        {/* Collection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">Badges</h2>
              {nfts?.length > 0 && (
                <p className="text-base text-zinc-500 mt-1">{nfts.length} badge{nfts.length !== 1 ? 's' : ''} collected</p>
              )}
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-600 border-t-violet-400 animate-spin" />
                Loading...
              </div>
            )}
          </div>
          <NFTGrid items={nfts} />
        </motion.section>
      </main>

      {/* Onboarding modal — shown on first login */}
      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}

      {/* Secret key modal */}
      <AnimatePresence>
        {secretVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setSecretVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <div className="gradient-border">
                <div className="bg-zinc-950 rounded-2xl p-8">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-white">Secret Key</h3>
                      <p className="text-sm text-zinc-400 mt-1">Never share this with anyone.</p>
                    </div>
                    <button
                      onClick={() => setSecretVisible(false)}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-zinc-300 break-all select-all leading-relaxed">
                    {secretValue || '(empty)'}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
                      onClick={() => {
                        navigator.clipboard.writeText(secretValue || '');
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                    >
                      {copiedSecret ? '✓ Copied' : 'Copy to clipboard'}
                    </button>
                    <button
                      className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all"
                      onClick={() => setSecretVisible(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
