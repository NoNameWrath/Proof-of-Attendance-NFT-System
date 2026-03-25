import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer className="bg-black border-t border-zinc-800/50 py-10">
      <div className="container-px mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="text-lg font-bold gradient-text">POAP</Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
          <span>Built on Solana Devnet · Powered by Metaplex Core</span>
          <span>© {new Date().getFullYear()} POAP. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
