import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: (
      <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Welcome to POAP',
    body: 'POAP lets you collect on-chain proof that you attended real-world events — meetups, classes, conferences, and more. Each badge is a unique NFT minted on Solana.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Your wallet is ready',
    body: "We've automatically created a Solana wallet for you — no setup needed. It lives securely in your account. All your POAP badges will be sent here.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 4H1m18-4h2M5 20H3m2-4h-.01M4 4h.01M20 4h.01" />
      </svg>
    ),
    title: 'Scan to collect',
    body: 'When you attend an event, open the Scan page and point your camera at the rotating QR code. Your badge is minted on Solana in seconds — no gas fees for you.',
  },
];

export default function OnboardingModal({ onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="gradient-border">
          <div className="bg-zinc-950 rounded-2xl p-8">
            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-gradient-to-r from-violet-500 to-cyan-500' : 'w-1.5 bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center mb-6">
                  {current.icon}
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">{current.title}</h2>
                <p className="text-base text-zinc-400 leading-relaxed">{current.body}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="py-3 px-5 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
                >
                  Back
                </button>
              )}
              {isLast ? (
                <Link
                  to="/scan"
                  onClick={onDone}
                  className="flex-1 py-3 rounded-xl text-base font-semibold text-center bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all"
                >
                  Scan my first badge →
                </Link>
              ) : (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex-1 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all"
                >
                  Next
                </button>
              )}
            </div>

            <button
              onClick={onDone}
              className="mt-4 w-full text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
