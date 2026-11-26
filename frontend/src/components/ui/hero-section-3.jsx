import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ChevronRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";

// The home page hero: one photo in a rounded frame below a fixed cream header (layout modelled on the WhatsApp reference)
const hero = {
  image: "/voallen/hero-walk.jpg",
  alt: "An older woman walking arm in arm with a smiling companion in an autumn park.",
  titleLines: ["Proof of care,", "not promises."],
  subtitle: "Transparent care for your loved ones",
};

export default function HeroSection3() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/agencies?search=${encodeURIComponent(q)}` : "/agencies");
  };
  return (
    <div className="w-full antialiased text-white relative pt-[72px] sm:pt-[84px]">
      {/* The shared site header: fixed at the top, on the same cream as the page */}
      <SiteHeader />

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

      <main className="relative z-10 flex-1 flex items-center py-10 lg:py-6">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-stretch sm:items-start gap-8 lg:gap-6">
          {/* Headline and search card stack on the left, over the soft trees, so the faces stay clear */}
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-[2.75rem] sm:text-7xl lg:text-[3.5rem] xl:text-[4rem] font-display font-light text-white leading-[1.02] tracking-[-0.035em] whitespace-nowrap mb-6 lg:mb-3"
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
              className="text-lg sm:text-xl md:text-2xl lg:text-xl text-white max-w-xl leading-snug"
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
            className="w-full sm:w-[440px] lg:w-[380px] rounded-[2rem] bg-black/35 backdrop-blur-2xl border border-white/10 shadow-2xl px-6 py-9 sm:px-10 sm:py-9 lg:px-8 lg:py-6 text-center"
            data-testid="hero-search-card"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-[1.75rem] font-normal text-white mb-6 lg:mb-3">Find care near you</h2>
            <p className="text-lg sm:text-xl lg:text-base text-white mb-3 lg:mb-1.5">Enter your city or zip code</p>
            <p className="text-xs sm:text-sm lg:text-xs text-white/80 leading-relaxed mb-7 lg:mb-4">
              Meet background-checked companions near your loved one.{" "}
              <Link to="/faq" className="text-white underline underline-offset-4 decoration-white/60 hover:decoration-white">
                How it works
              </Link>
            </p>
            <label style={{ backgroundColor: "#ffffff" }} className="flex items-center gap-3 w-full rounded-full px-5 py-4 lg:py-3 mb-4 lg:mb-3 focus-within:ring-4 focus-within:ring-white/30">
              <MapPin className="w-5 h-5 shrink-0" style={{ color: "#78716c" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Philadelphia, PA"
                aria-label="City or zip code"
                style={{ color: "#1c1917" }}
                className="w-full bg-transparent text-lg lg:text-base placeholder:text-[#a8a29e] outline-none"
                data-testid="hero-search-input"
              />
            </label>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/10 px-5 py-4 lg:py-3 text-lg lg:text-base font-medium text-white transition-colors mb-7 lg:mb-4"
              data-testid="hero-search-btn"
            >
              Search <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-base sm:text-lg lg:text-base text-white">
              Are you a caregiver?{" "}
              <Link to="/caregivers" className="inline-flex items-center gap-1 font-medium underline underline-offset-4 decoration-white/60 hover:decoration-white">
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
