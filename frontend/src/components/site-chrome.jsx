import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowUpRight, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/App";
import { VoallenLogo } from "@/components/voallen-logo";
import { ThemeToggle } from "@/components/theme-toggle";

// The site header and the things every page shares. The header matches the
// OnePermit site: a full-width frosted white bar with the wordmark on the left,
// small plain links in the middle, and a blue "Log In" text link plus a small
// blue Join pill on the right. Used on every page so the whole site matches.

export const SITE_NAV = [
  { href: "/visits", label: "Visits" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/agencies", label: "Find Care" },
  { href: "/caregivers", label: "Caregivers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Height of the fixed header, for pages that need to clear it.
export const HEADER_OFFSET = "pt-[64px] sm:pt-[76px]";

const navClass = ({ isActive }) =>
  `text-[13px] xl:text-[14px] tracking-[-0.01em] transition-colors hover:underline underline-offset-4 ${
    isActive ? "text-stone-900 font-semibold" : "text-stone-800"
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
    "op-link inline-flex items-center gap-1 text-[14px] px-2 py-1.5";
  const darkPill =
    "btn-primary inline-flex items-center gap-1 rounded-full px-4 py-2 text-[13px] leading-4";

  return (
    <header
      className={`op-header fixed inset-x-0 top-0 z-40 h-[64px] sm:h-[76px] transition-shadow duration-300 ${scrolled ? "shadow-[0_1px_0_rgba(29,29,31,0.06)]" : ""}`}
      data-testid="site-header"
    >
      <div className="h-full max-w-[1280px] mx-auto px-5 sm:px-6 flex justify-between items-center gap-5">
        <Link to="/" aria-label="Voallen home" className="shrink-0 flex items-center">
          <VoallenLogo size="md" />
        </Link>

        {/* Desktop nav: plain text links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Main">
          {SITE_NAV.map((link) => (
            <NavLink key={link.href} to={link.href} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
          <Link to="/agencies" aria-label="Search caregivers" className="p-2 text-stone-800 hover:bg-stone-100 rounded-full transition-colors">
            <Search className="w-[18px] h-[18px]" />
          </Link>
          <ThemeToggle className="text-stone-800 hover:bg-stone-100" />
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
            className="lg:hidden p-2 text-stone-900 rounded-full hover:bg-stone-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center gap-1">
          <ThemeToggle className="text-stone-800 hover:bg-stone-100" />
          <button
            className="p-2 text-stone-900 rounded-full hover:bg-stone-100"
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
        <div className="lg:hidden op-card mx-3 sm:mx-6 mt-2 sm:ml-auto sm:w-80 p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1 mb-4" aria-label="Mobile">
            {SITE_NAV.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `px-4 py-3 font-medium text-base rounded-xl transition-colors ${isActive ? "bg-stone-100 text-stone-900 font-semibold" : "text-stone-900 hover:bg-stone-100"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-stone-200 pt-4 space-y-2 sm:hidden">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-outline block px-4 py-3 rounded-full text-base text-center">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full px-4 py-3 text-red-600 font-medium text-base text-center hover:bg-white/60 rounded-full transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline block px-4 py-3 rounded-full text-base text-center">
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary block w-full rounded-full px-4 py-3 text-base text-center"
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
    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-stone-900 leading-[1.05] mb-6">
      {title}
    </h1>
    {lead && <p className="text-lg sm:text-xl text-stone-500 leading-relaxed">{lead}</p>}
    {children}
  </div>
);
