import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  title: "Proof of Care, Not Promises.",
  subtitle: "Transparent care for your loved ones",
};

export default function HeroSection3({
  logoText,
  navLinks,
  user,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="h-[78vh] min-h-[520px] sm:h-[70vh] md:h-[80vh] w-full antialiased text-white relative">
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

      {/* Hero photo */}
      <main className="w-full h-full relative overflow-hidden">
        <img
          src={hero.image}
          alt={hero.alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 40%" }}
          fetchpriority="high"
        />

        {/* Headline sits low on the photo's darker lower edge, clear of the faces */}
        <div className="absolute inset-0 flex items-end z-10 pb-40 sm:pb-32">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-xl">
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-3 sm:mb-4"
                style={{ textShadow: "0 2px 18px rgba(0,0,0,0.45)" }}
              >
                {hero.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-base sm:text-lg md:text-xl text-white/95"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
              >
                {hero.subtitle}
              </motion.p>
            </div>
          </div>
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
