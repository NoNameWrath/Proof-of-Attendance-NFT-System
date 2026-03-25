import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = useAppStore((s) => s.isAdmin);
  const [open, setOpen] = useState(false);

  const linkClass = (to) =>
    `relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
      pathname === to
        ? 'text-white bg-zinc-800'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
    }`;

  const navLinks = [
    { to: '/app', label: 'Dashboard' },
    { to: '/scan', label: 'Scan' },
    { to: '/admin', label: isAdmin ? 'Admin' : 'Admin Access' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-black/80 backdrop-blur-md">
      <div className="container-px mx-auto max-w-screen-xl flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold gradient-text">POAP</Link>

        {/* Desktop nav */}
        {user && (
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClass(to)}>
                {label}
                {pathname === to && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
                )}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="ml-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </nav>
        )}

        {/* Mobile hamburger */}
        {user && (
          <button
            className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {user && open && (
        <div className="sm:hidden border-t border-zinc-800 bg-black/95 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                pathname === to
                  ? 'text-white bg-zinc-800'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="mt-1 px-4 py-3 rounded-lg text-base font-medium text-left text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
