import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && user) nav('/app', { replace: true });
  }, [user, loading, nav]);

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl animate-float pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl animate-float-delayed pointer-events-none" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl animate-float-slow pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <Link to="/" className="text-2xl sm:text-3xl font-bold gradient-text">POAP</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="gradient-border">
            <div className="bg-zinc-950 rounded-2xl p-6 sm:p-10 lg:p-14 text-center">

              {/* Animated hex logo */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 mb-6 mx-auto shadow-lg shadow-violet-500/30"
                animate={{ boxShadow: ['0 10px 40px rgba(139,92,246,0.3)', '0 10px 60px rgba(6,182,212,0.4)', '0 10px 40px rgba(139,92,246,0.3)'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg viewBox="0 0 100 100" className="w-10 h-10 sm:w-14 sm:h-14" fill="none">
                  <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="white" strokeWidth="6" />
                  <polygon points="50,20 76,34.5 76,64.5 50,79 24,64.5 24,34.5" fill="white" opacity="0.15" />
                  <text x="50" y="57" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="monospace">POAP</text>
                </svg>
              </motion.div>

              <h2 className="text-2xl sm:text-4xl font-bold text-white">Welcome back</h2>
              <p className="mt-3 text-zinc-400 text-base sm:text-lg leading-relaxed">
                Sign in to collect and showcase your<br className="hidden sm:block" />on-chain attendance badges
              </p>

              {/* Feature pills */}
              <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                {['Solana NFTs', 'No setup', 'Free forever'].map((tag) => (
                  <span key={tag} className="text-sm px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 sm:my-9 flex items-center gap-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-sm text-zinc-600">continue with</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <motion.button
                className="w-full flex items-center justify-center gap-3 px-6 py-4 sm:py-5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-base sm:text-lg transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signInWithGoogle}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Continue with Google
              </motion.button>

              <p className="mt-5 text-sm text-zinc-600">
                By signing in you agree to our{' '}
                <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">terms of service</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
