import { useState } from 'react';

export default function WalletCard({ address, onViewSecret }) {
  const [copied, setCopied] = useState(false);

  const short = (addr = '') => {
    if (!addr) return '';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy failed');
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-6">
      {/* Subtle gradient top strip */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500/40 via-cyan-500/40 to-transparent" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <div className="text-sm text-zinc-500 uppercase tracking-wider">Solana Wallet</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-400">{address ? 'Connected' : 'Not set up'}</span>
          </div>
        </div>
      </div>

      {address ? (
        <>
          <div className="bg-zinc-800/60 rounded-xl px-4 py-3 font-mono text-base text-zinc-300 truncate border border-zinc-700/50">
            {short(address)}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={copy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy address
                </>
              )}
            </button>
            {typeof onViewSecret === 'function' && (
              <button
                onClick={onViewSecret}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View secret
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-sm text-zinc-500 mt-1">No wallet created yet</div>
      )}
    </div>
  );
}
