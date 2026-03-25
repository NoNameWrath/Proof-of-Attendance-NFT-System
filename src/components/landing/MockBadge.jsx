import { motion } from 'framer-motion';

export default function MockBadge() {
  return (
    <motion.div
      className="relative w-72 h-96 cursor-pointer select-none"
      style={{ perspective: 800 }}
      whileHover={{ rotateY: 8, rotateX: -4, scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow behind card */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 blur-xl animate-pulse-glow" />

      {/* Card */}
      <div className="relative h-full rounded-2xl bg-zinc-900 border border-zinc-700/50 overflow-hidden flex flex-col">
        {/* Image area */}
        <div className="relative flex-1 bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-cyan-900/30 flex items-center justify-center">
          {/* POAP hex icon */}
          <svg viewBox="0 0 100 100" className="w-28 h-28 opacity-90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
              fill="none"
              stroke="url(#hexGrad)"
              strokeWidth="3"
            />
            <polygon
              points="50,18 78,33.5 78,65.5 50,81 22,65.5 22,33.5"
              fill="url(#hexFill)"
              opacity="0.6"
            />
            <text x="50" y="56" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">POAP</text>
            <defs>
              <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="hexFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer-card" />
        </div>

        {/* Card info */}
        <div className="p-5">
          <div className="text-base font-semibold text-white truncate">ETH Denver 2025</div>
          <div className="text-sm text-zinc-400 mt-1">Feb 23, 2025 · Denver, CO</div>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-zinc-500 font-mono">On-chain · Solana</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
