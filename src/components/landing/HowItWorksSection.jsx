import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Sign in',
    desc: 'Use your Google account — no crypto knowledge required. We handle everything on-chain for you.',
  },
  {
    number: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Create wallet',
    desc: 'We generate a secure Solana wallet for you in-app. Your collectibles are yours forever.',
  },
  {
    number: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 4H1m18-4h2M5 20H3m2-4h-.01M4 4h.01M20 4h.01" />
      </svg>
    ),
    title: 'Scan & mint',
    desc: 'Scan the rotating QR at the venue. Your POAP badge is minted on Solana in seconds.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' },
  }),
};

export default function HowItWorksSection() {
  return (
    <section id="how" className="py-16 sm:py-32 bg-zinc-950">
      <div className="container-px mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-10 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm font-medium text-violet-400 tracking-widest uppercase mb-4">How it works</div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white">
            From sign-in to on-chain
            <span className="gradient-text"> in 3 steps</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
            No prior crypto experience needed. Collect your first POAP in under a minute.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              whileHover={{ borderColor: 'rgba(139, 92, 246, 0.4)', y: -4 }}
              className="relative card p-5 sm:p-8 overflow-hidden border border-zinc-800 transition-colors"
            >
              {/* Background number */}
              <div className="absolute -top-4 -right-2 text-9xl font-black text-white/[0.04] select-none pointer-events-none">
                {step.number}
              </div>

              {/* Step badge */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 text-violet-300 mb-5">
                {step.icon}
              </div>

              <div className="text-sm font-mono text-zinc-600 mb-2">Step {step.number}</div>
              <div className="font-semibold text-white text-lg sm:text-xl mb-3">{step.title}</div>
              <p className="text-base text-zinc-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
