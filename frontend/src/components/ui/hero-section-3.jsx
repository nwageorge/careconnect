import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ChevronRight, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// SVG icons as components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// The home page hero: one photo in a rounded frame below a fixed cream header (layout modelled on the WhatsApp reference)
const hero = {
  image: "/voallen/hero-walk.jpg",
  alt: "An older woman walking arm in arm with a smiling companion in an autumn park.",
  titleLines: ["Proof of care,", "not promises."],
  subtitle: "Transparent care for your loved ones",
};

export default function HeroSection3({
  logoText,
  navLinks,
  user,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/agencies?search=${encodeURIComponent(q)}` : "/agencies");
  };
  return (
    <div className="w-full antialiased text-white relative pt-[72px] sm:pt-[84px]">
      {/* Header: stays fixed at the top while the page scrolls, on the same cream as the page */}
      <header
        className={`fixed inset-x-0 top-0 z-40 h-[72px] sm:h-[84px] bg-[#faf6f0] dark:bg-[#0f0d0c] transition-shadow ${
          scrolled ? "border-b border-stone-200 shadow-sm" : ""
        }`}
      >
        <div className="h-full mx-auto px-4 sm:px-6 lg:px-[3vw] flex justify-between items-center">
          <Link to="/" className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-stone-900">{logoText}</Link>

          {/* Desktop Nav: plain text links */}
          <nav className="hidden lg:flex items-center gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                to={link.href}
                className="text-[17px] font-medium text-stone-800 hover:text-stone-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/agencies" aria-label="Search agencies" className="p-2 text-stone-800 hover:bg-stone-100 rounded-full transition-colors">
              <SearchIcon />
            </Link>
            <ThemeToggle className="text-stone-800 hover:bg-stone-100" />
            {user ? (
              <>
                <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-full border-2 border-stone-900 px-5 py-2.5 text-[17px] font-medium text-stone-900 hover:bg-stone-100 transition-colors">
                  Dashboard <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={onLogout}
                  className="rounded-full px-6 py-3 text-[17px] font-medium bg-[#1c1917] text-[#fafaf9] dark:bg-[#fafaf9] dark:text-[#1c1917] hover:opacity-90 transition-opacity"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="inline-flex items-center gap-1.5 rounded-full border-2 border-stone-900 px-5 py-2.5 text-[17px] font-medium text-stone-900 hover:bg-stone-100 transition-colors">
                  Log In <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-[17px] font-medium bg-[#1c1917] text-[#fafaf9] dark:bg-[#fafaf9] dark:text-[#1c1917] hover:opacity-90 transition-opacity"
                >
                  Join <ArrowUpRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center gap-1">
            <ThemeToggle className="text-stone-800 hover:bg-stone-100" />
            <button
              className="p-2 text-stone-900 rounded-full hover:bg-stone-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mx-4 bg-[#faf6f0] dark:bg-[#0f0d0c] border border-stone-200 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-stone-900 font-medium text-base hover:bg-stone-100 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-stone-200 pt-4 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-stone-900 font-medium text-base hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 text-red-600 font-medium text-base text-left hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-full border-2 border-stone-900 text-stone-900 font-medium text-base text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full rounded-full px-4 py-3 text-base font-medium text-center bg-[#1c1917] text-[#fafaf9] dark:bg-[#fafaf9] dark:text-[#1c1917]"
                  >
                    Join Voallen
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero frame: a rounded photo card with side margins, a little shorter than the screen */}
      <div className="relative mx-3 sm:mx-6 lg:mx-[3vw] mt-1 rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col min-h-[calc(100svh-96px)] sm:min-h-[calc(100svh-120px)] lg:min-h-0 lg:h-[calc(100svh-140px)] lg:max-h-[860px] lg:min-h-[640px]">
      <img
        src={hero.image}
        alt={hero.alt}
        className="absolute inset-0 w-full h-full object-cover object-[74%_center] md:object-[center_40%]"
        fetchpriority="high"
      />
      {/* Soft shade on the left so the white text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" aria-hidden="true" />

      <main className="relative z-10 flex-1 flex items-center py-10 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-stretch sm:items-start gap-8 lg:gap-10">
          {/* Headline and search card stack on the left, over the soft trees, so the faces stay clear */}
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-[2.75rem] sm:text-7xl lg:text-6xl xl:text-7xl font-normal text-white leading-[1.02] tracking-tight whitespace-nowrap mb-6"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
            >
              {hero.titleLines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-white max-w-xl leading-snug"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.45)" }}
            >
              {hero.subtitle}
            </motion.p>
          </div>

          {/* Search card */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="w-full sm:w-[440px] rounded-[2rem] bg-black/35 backdrop-blur-2xl border border-white/10 shadow-2xl px-6 py-9 sm:px-10 sm:py-9 text-center"
            data-testid="hero-search-card"
          >
            <h2 className="text-3xl sm:text-4xl font-normal text-white mb-6">Find care near you</h2>
            <p className="text-lg sm:text-xl text-white mb-3">Enter your city or zip code</p>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-7">
              Browse reviewed care agencies and companionship visits.{" "}
              <Link to="/faq" className="text-white underline underline-offset-4 decoration-white/60 hover:decoration-white">
                How it works
              </Link>
            </p>
            <label style={{ backgroundColor: "#ffffff" }} className="flex items-center gap-3 w-full rounded-full px-5 py-4 mb-4 focus-within:ring-4 focus-within:ring-white/30">
              <MapPin className="w-5 h-5 shrink-0" style={{ color: "#78716c" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Philadelphia, PA"
                aria-label="City or zip code"
                style={{ color: "#1c1917" }}
                className="w-full bg-transparent text-lg placeholder:text-[#a8a29e] outline-none"
                data-testid="hero-search-input"
              />
            </label>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/10 px-5 py-4 text-lg font-medium text-white transition-colors mb-7"
              data-testid="hero-search-btn"
            >
              Search <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-base sm:text-lg text-white">
              Are you a care agency?{" "}
              <Link to="/signup" className="inline-flex items-center gap-1 font-medium underline underline-offset-4 decoration-white/60 hover:decoration-white">
                Join Voallen <ArrowUpRight className="w-4 h-4" />
              </Link>
            </p>
          </motion.form>
        </div>
      </main>
      </div>
    </div>
  );
}

HeroSection3.propTypes = {
  logoText: PropTypes.string,
  navLinks: PropTypes.arrayOf(PropTypes.shape({
    href: PropTypes.string,
    label: PropTypes.string
  })),
  user: PropTypes.object,
  onLogout: PropTypes.func,
};

HeroSection3.defaultProps = {
  logoText: "Voallen",
  navLinks: [],
  user: null,
  onLogout: null,
};
