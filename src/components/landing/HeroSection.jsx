import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MockBadge from './MockBadge';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen mesh-bg flex items-center overflow-hidden pt-16">
      {/* Floating orbs — hidden on mobile to avoid clutter */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl animate-float pointer-events-none" />
      <div className="hidden sm:block absolute top-1/2 right-1/4 w-56 h-56 rounded-full bg-cyan-500/15 blur-3xl animate-float-delayed pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 left-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl animate-float-slow pointer-events-none" />

      <div className="container-px mx-auto w-full max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          {/* Text side */}
          <motion.div
            className="flex-1 max-w-2xl text-center md:text-left"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Built on Solana
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
            >
              Proof of Attendance,{' '}
              <span className="gradient-text">done right.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-5 text-zinc-400 text-base sm:text-xl leading-relaxed"
            >
              Scan a rotating QR at the venue, auto-mint a collectible badge,
              and build your on-chain attendance history — no wallet setup required.
            </motion.p>

            <motion.div variants={item} className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/login"
                className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-base sm:text-lg bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                Get started free →
              </Link>
              <a
                href="#how"
                className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-base sm:text-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium transition-all"
              >
                How it works
              </a>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-7 flex items-center justify-center md:justify-start gap-4 sm:gap-6 text-sm sm:text-base text-zinc-500 flex-wrap"
            >
              {['No wallet needed', 'Free to use', 'On-chain forever'].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Badge side — hidden on small screens */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="hidden md:flex flex-shrink-0"
          >
            <MockBadge />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex flex-col items-center gap-1 text-zinc-600">
          <span className="text-xs">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
}
