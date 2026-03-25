import { motion } from 'framer-motion';

export default function NFTCard({ nft }) {
  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 flex flex-col"
      whileHover={{ y: -4, borderColor: 'rgba(139, 92, 246, 0.4)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-zinc-800">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* On-chain badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-zinc-700/50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-zinc-300 font-medium">On-chain</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="font-semibold text-lg text-white leading-snug">{nft.name}</div>
        <p className="mt-2 text-base text-zinc-400 line-clamp-2 flex-1">{nft.description}</p>
        {nft._explorer && (
          <a
            href={nft._explorer}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            View on Solscan
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  );
}
