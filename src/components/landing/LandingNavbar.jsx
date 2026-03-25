import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-zinc-800/50' : 'bg-transparent'
      }`}
    >
      <div className="container-px mx-auto max-w-7xl flex items-center justify-between h-16 sm:h-20">
        <Link to="/" className="text-2xl font-bold gradient-text">POAP</Link>
        <nav className="flex items-center gap-5">
          <a href="#how" className="text-base text-zinc-400 hover:text-white transition-colors hidden sm:block">
            How it works
          </a>
          {user ? (
            <button
              onClick={() => navigate('/app')}
              className="btn btn-primary text-base px-5 py-2.5"
            >
              Go to app →
            </button>
          ) : (
            <>
              <Link to="/login" className="text-base text-zinc-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                to="/login"
                className="text-base px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-medium transition-all"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
