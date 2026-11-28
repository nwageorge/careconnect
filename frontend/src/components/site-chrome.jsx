import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowUpRight, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/App";
import { VoallenLogo } from "@/components/voallen-logo";
import { ThemeToggle } from "@/components/theme-toggle";

// The site header and the things every page shares. Editorial style: a clean
// white bar with the wordmark on the left, plain links in the middle, and a
// "Log In" text link plus a black Join pill on the right. A hairline appears
// once the page scrolls. Used on every page so the whole site matches.

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
  `relative text-[14px] xl:text-[15px] font-medium tracking-[-0.01em] transition-colors after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:bg-[#1f4fff] after:transition-all ${
    isActive ? "text-stone-900 after:w-full" : "text-stone-600 hover:text-stone-900 after:w-0 hover:after:w-full"
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
    "inline-flex items-center gap-1 text-[14px] font-medium text-stone-900 px-3 py-1.5 hover:underline underline-offset-4";
  const darkPill =
    "btn-primary inline-flex items-center gap-1 rounded-full px-5 py-2.5 text-[14px] leading-4";

  return (
    <header
      className={`op-header fixed inset-x-0 top-0 z-40 h-[64px] sm:h-[76px] ${scrolled ? "is-scrolled" : ""}`}
      data-testid="site-header"
    >
      <div className="h-full max-w-[1360px] mx-auto px-5 sm:px-8 flex justify-between items-center gap-5">
        <Link to="/" aria-label="Voallen home" className="shrink-0 flex items-center">
          <VoallenLogo size="md" />
        </Link>

        {/* Desktop nav: plain text links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main">
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

// Shared page intro used by the inner pages: blue eyebrow, an oversized
// editorial headline, and the lead text set beside it on wide screens.
export const PageIntro = ({ eyebrow, title, lead, center = false, children }) => (
  <div className={`pt-12 sm:pt-20 pb-10 sm:pb-16 ${center ? "text-center mx-auto max-w-4xl" : "max-w-5xl"}`}>
    {eyebrow && (
      <p className="eyebrow mb-5">{eyebrow}</p>
    )}
    <h1 className="font-display text-[3rem] sm:text-7xl lg:text-[6.5rem] text-stone-900 leading-[0.95] mb-8">
      {title}
    </h1>
    {lead && <p className={`text-lg sm:text-[22px] text-stone-500 leading-[1.45] max-w-2xl ${center ? "mx-auto" : ""}`}>{lead}</p>}
    {children}
  </div>
);
