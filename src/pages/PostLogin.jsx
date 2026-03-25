import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserWallet, createWallet } from '../services/wallet';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';

const steps = [
  'Signing you in...',
  'Checking your wallet...',
  'Setting up your account...',
  'Almost there...',
];

export default function PostLogin() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const setWallet = useAppStore((s) => s.setWallet);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (loading || !user) return;

    let cancelled = false;

    const setup = async () => {
      try {
        setStepIndex(1);
        const existing = await getUserWallet();

        let firstLogin = false;
        if (existing) {
          // Wallet already exists — hydrate store and go
          if (!cancelled) setWallet({ address: existing });
        } else {
          // First login — silently create wallet
          firstLogin = true;
          setStepIndex(2);
          const created = await createWallet();
          if (!cancelled && created?.address) {
            setWallet({ address: created.address });
          }
        }

        setStepIndex(3);
        if (!cancelled) nav('/app', { replace: true, state: { firstLogin } });
      } catch {
        // If wallet setup fails for any reason, still go to the app
        // Dashboard handles the missing-wallet state gracefully
        if (!cancelled) nav('/app', { replace: true });
      }
    };

    setup();
    return () => { cancelled = true; };
  }, [user, loading, nav, setWallet]);

  return (
    <div className="min-h-screen bg-black mesh-bg flex items-center justify-center px-4">
      <div className="text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 mb-6 shadow-lg shadow-violet-500/30"
        >
          <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none">
            <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="white" strokeWidth="6" />
            <polygon points="50,20 76,34.5 76,64.5 50,79 24,64.5 24,34.5" fill="white" opacity="0.15" />
          </svg>
        </motion.div>

        {/* Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-5"
        >
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-violet-400 animate-spin" />
        </motion.div>

        {/* Step label */}
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-base text-zinc-400"
        >
          {steps[stepIndex]}
        </motion.p>
      </div>
    </div>
  );
}
