import { motion } from 'framer-motion';
import NFTCard from './NFTCard';

export default function NFTGrid({ items }) {
  if (!items?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-zinc-800 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="text-zinc-400 font-medium">No badges yet</div>
        <div className="text-zinc-600 text-sm mt-1">Scan a QR code at an event to mint your first POAP</div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((n, i) => (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
        >
          <NFTCard nft={n} />
        </motion.div>
      ))}
    </div>
  );
}
