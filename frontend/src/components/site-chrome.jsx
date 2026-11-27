import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowUpRight, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/App";
import { VoallenLogo } from "@/components/voallen-logo";
import { ThemeToggle } from "@/components/theme-toggle";

// The site header and the things every page shares. The header is a floating
// liquid-glass bar (OnePermit style) with plain links, a glass Log In pill and a
// gradient Join pill, used on every page so the whole site matches.

export const SITE_NAV = [
  { href: "/visits", label: "Visits" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/agencies", label: "Find Care" },
  { href: "/caregivers", label: "Caregivers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Height of the fixed header, for pages that need to clear it.
export const HEADER_OFFSET = "pt-[72px] sm:pt-[84px]";

const navClass = ({ isActive }) =>
  `px-3.5 xl:px-4 py-2 rounded-full text-[15px] xl:text-[16px] font-medium transition-colors ${
    isActive ? "text-stone-900 bg-white/70 dark:bg-white/10 shadow-sm" : "text-stone-700 hover:text-stone-900 hover:bg-white/50 dark:hover:bg-white/10"
  }`;

export const SiteHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu when the page changes
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const outlinePill =
    "btn-glass inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] xl:text-[16px] font-semibold";
  const darkPill =
    "btn-joy inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-[15px] xl:text-[16px]";

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[72px] sm:h-[84px] px-3 sm:px-6 lg:px-[3vw] pt-3 sm:pt-4" data-testid="site-header">
      <div
        className={`glass h-full max-w-[1400px] mx-auto rounded-full pl-4 pr-2 sm:pl-6 sm:pr-3 flex justify-between items-center gap-4 transition-shadow duration-500 ${
          scrolled ? "shadow-[0_8px_32px_rgba(31,38,135,0.12)]" : "shadow-[0_8px_32px_rgba(31,38,135,0.06)]"
        }`}
      >
        <Link to="/" aria-label="Voallen home" className="shrink-0">
          <VoallenLogo size="lg" />
        </Link>

        {/* Desktop nav: plain text links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main">
          {SITE_NAV.map((link) => (
            <NavLink key={link.href} to={link.href} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
          <Link to="/agencies" aria-label="Search caregivers" className="p-2 text-stone-800 hover:bg-white/60 dark:hover:bg-white/10 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <ThemeToggle className="text-stone-800 hover:bg-white/60 dark:hover:bg-white/10" />
          {user ? (
            <>
              <Link to="/dashboard" className={outlinePill} data-testid="nav-dashboard">
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
              <button onClick={handleLogout} className={darkPill} data-testid="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={outlinePill} data-testid="nav-login">
                Log In <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/signup" className={darkPill} data-testid="nav-signup">
                Join <ArrowUpRight className="w-4 h-4" />
              </Link>
            </>
          )}
          {/* Menu button for tablets, where the text links don't fit */}
          <button
            className="lg:hidden p-2 text-stone-900 rounded-full hover:bg-white/60 dark:hover:bg-white/10"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center gap-1">
          <ThemeToggle className="text-stone-800 hover:bg-white/60 dark:hover:bg-white/10" />
          <button
            className="p-2 text-stone-900 rounded-full hover:bg-white/60 dark:hover:bg-white/10"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile and tablet menu */}
      {open && (
        <div className="lg:hidden glass-card mt-3 sm:ml-auto sm:w-80 bg-white/80 dark:bg-[#1c1a2e]/90 p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1 mb-4" aria-label="Mobile">
            {SITE_NAV.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `px-4 py-3 font-medium text-base rounded-xl transition-colors ${isActive ? "bg-white/80 dark:bg-white/10 text-stone-900" : "text-stone-900 hover:bg-white/60 dark:hover:bg-white/10"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-white/60 dark:border-white/10 pt-4 space-y-2 sm:hidden">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-glass block px-4 py-3 rounded-full font-semibold text-base text-center">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full px-4 py-3 text-red-600 font-medium text-base text-center hover:bg-white/60 rounded-full transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-glass block px-4 py-3 rounded-full font-semibold text-base text-center">
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn-joy block w-full rounded-full px-4 py-3 text-base text-center"
                >
                  Join Voallen
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// Scroll to the top on every page change (or to #anchor when the link has one),
// like a normal multi-page site.
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

// Sets the browser tab title for a page.
export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | Voallen` : "Voallen | Companionship visits with proof of care";
  }, [title]);
};

// Shared page intro used by the inner pages: eyebrow, light display headline, lead text.
export const PageIntro = ({ eyebrow, title, lead, center = false, children }) => (
  <div className={`pt-10 sm:pt-16 pb-8 sm:pb-12 ${center ? "text-center mx-auto" : ""} max-w-3xl`}>
    {eyebrow && (
      <p className="eyebrow mb-4">{eyebrow}</p>
    )}
    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-stone-900 leading-[0.95] mb-6">
      {title}
    </h1>
    {lead && <p className="text-lg sm:text-xl text-stone-500 leading-relaxed">{lead}</p>}
    {children}
  </div>
);
