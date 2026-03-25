import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none">
            <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="white" strokeWidth="6" />
            <polygon points="50,20 76,34.5 76,64.5 50,79 24,64.5 24,34.5" fill="white" opacity="0.15" />
          </svg>
        </div>
        <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-violet-400 animate-spin" />
      </motion.div>
    </div>
  );
}
