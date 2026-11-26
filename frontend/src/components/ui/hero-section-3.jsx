import React, { useState } from "react";
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

// The home page hero: one photo, kept clean (no zoom, no slideshow, no fade over the picture)
const hero = {
  image: "/voallen/hero.jpg",
  alt: "An older woman and a younger woman laughing together over coffee at sunset.",
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
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/agencies?search=${encodeURIComponent(q)}` : "/agencies");
  };
  return (
    <div className="min-h-[100svh] w-full antialiased text-white relative flex flex-col">
      {/* Navigation Header */}
      <header className="absolute inset-x-0 top-0 p-4 sm:p-6 md:p-8 z-30">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-semibold drop-shadow-lg">{logoText}</Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 bg-black/40 backdrop-blur-md rounded-full px-4 py-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href + link.label} 
                to={link.href} 
                className="px-3 py-1.5 text-white font-medium text-sm hover:bg-white/20 rounded-full transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5">
            <Link to="/agencies" aria-label="Search agencies" className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <SearchIcon />
            </Link>
            <ThemeToggle className="text-white hover:bg-white/20" />
            {user ? (
              <>
                <Link to="/dashboard" className="px-3 py-1.5 text-white font-medium text-sm hover:bg-white/20 rounded-full transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={onLogout}
                  className="bg-white text-stone-800 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-stone-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1.5 text-white font-medium text-sm hover:bg-white/20 rounded-full transition-colors">
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-white text-stone-800 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-stone-100 transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle className="text-white bg-black/40 backdrop-blur-md hover:bg-black/60" />
            <button 
              className="p-2 bg-black/40 backdrop-blur-md rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 bg-black/80 backdrop-blur-lg rounded-2xl p-4 mx-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href + link.label} 
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-white font-medium text-base hover:bg-white/10 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/20 pt-4 space-y-2">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white font-medium text-base hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 text-red-400 font-medium text-base text-left hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white font-medium text-base hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-white text-stone-800 rounded-xl px-4 py-3 text-base font-semibold text-center hover:bg-stone-100 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero photo fills the whole screen */}
      <img
        src={hero.image}
        alt={hero.alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 40%" }}
        fetchpriority="high"
      />

      <main className="relative z-10 flex-1 flex items-center pt-28 pb-12 sm:pt-32">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
          {/* Headline */}
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-[2.75rem] sm:text-7xl lg:text-[5.25rem] xl:text-8xl font-normal text-white leading-[1.02] tracking-tight whitespace-nowrap mb-6"
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
            className="w-full lg:w-[440px] rounded-[2rem] bg-black/35 backdrop-blur-2xl border border-white/10 shadow-2xl px-6 py-9 sm:px-10 sm:py-11 text-center"
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
