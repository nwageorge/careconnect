import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, ChevronRight, ArrowUpRight, Camera, Check, Heart } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";

// The home page hero, in the OnePermit style: a soft peach-to-lavender gradient,
// massive bold Sora headline, a liquid-glass search card and the walk photo in a
// rounded frame with a few floating glass "visit update" chips.
const hero = {
  image: "/voallen/hero-walk.jpg",
  alt: "An older woman walking arm in arm with a smiling companion in an autumn park.",
  titleLines: ["Proof of care,", "not promises."],
  subtitle: "Transparent care for your loved ones",
};

const springSlow = { type: "spring", stiffness: 100, damping: 20 };
const springBouncy = { type: "spring", stiffness: 300, damping: 15 };

// A small glass chip that floats gently up and down
const FloatingChip = ({ className = "", delay = 0, children }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...springBouncy, delay }}
      className={`absolute z-20 ${className}`}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
        className="glass rounded-2xl shadow-[0_12px_32px_rgba(31,38,135,0.12)] px-4 py-3 flex items-center gap-3 text-stone-900"
      >
        {children}
      </motion.div>
    </motion.div>
  );
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
    <div className="w-full antialiased relative pt-[72px] sm:pt-[84px]">
      {/* The shared glass site header, fixed at the top */}
      <SiteHeader />

      <section className="relative mx-3 sm:mx-6 lg:mx-[3vw] mt-3 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-joy-hero">
        {/* Soft pastel glows */}
        <div className="pointer-events-none absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#FFB7B2]/50 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 right-[-6rem] w-[32rem] h-[32rem] rounded-full bg-white/60 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 py-12 sm:py-16 lg:py-14 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Left: headline, subtitle and search */}
          <div className="flex flex-col gap-8">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springSlow, delay: 0.05 }}
                className="eyebrow mb-5"
              >
                Companionship visits in Philadelphia
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springSlow, delay: 0.1 }}
                className="font-display text-[3.1rem] sm:text-7xl lg:text-[4rem] xl:text-[4.75rem] text-stone-900 leading-[0.92] mb-6"
              >
                {hero.titleLines.map((line) => (
                  <span key={line} className="block sm:whitespace-nowrap">{line}</span>
                ))}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springSlow, delay: 0.2 }}
                className="text-lg md:text-xl text-stone-600 max-w-xl leading-relaxed"
              >
                {hero.subtitle}
              </motion.p>
            </div>

            {/* Search card: liquid glass */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springSlow, delay: 0.3 }}
              className="glass-card w-full sm:max-w-[480px] p-6 sm:p-8"
              data-testid="hero-search-card"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-2">Find care near you</h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-5">
                Enter your city or zip code to meet background-checked companions near your loved one.{" "}
                <Link to="/faq" className="font-semibold text-stone-900 underline underline-offset-4 decoration-[#FF8A8A] hover:decoration-2">
                  How it works
                </Link>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 flex items-center gap-3 rounded-full bg-white/90 dark:bg-white/10 border border-white px-5 py-3.5 focus-within:ring-4 focus-within:ring-[#FFB7B2]/60">
                  <MapPin className="w-5 h-5 shrink-0 text-[#FF6B6B]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Philadelphia, PA"
                    aria-label="City or zip code"
                    className="w-full bg-transparent text-base sm:text-lg text-stone-900 placeholder:text-stone-400 outline-none"
                    data-testid="hero-search-input"
                  />
                </label>
                <button
                  type="submit"
                  className="btn-joy flex items-center justify-center gap-1.5 rounded-full px-7 py-3.5 text-base sm:text-lg"
                  data-testid="hero-search-btn"
                >
                  Search <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm sm:text-base text-stone-600 mt-5">
                Are you a caregiver?{" "}
                <Link to="/caregivers" className="inline-flex items-center gap-1 font-semibold text-stone-900 underline underline-offset-4 decoration-[#FF8A8A] hover:decoration-2">
                  Join Voallen <ArrowUpRight className="w-4 h-4" />
                </Link>
              </p>
            </motion.form>
          </div>

          {/* Right: the photo in a rounded frame with floating glass chips */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...springSlow, delay: 0.2 }}
            className="relative mx-2 sm:mx-6 lg:mx-0"
          >
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(31,38,135,0.18)] border-[6px] border-white/70 aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[5/6]">
              <img
                src={hero.image}
                alt={hero.alt}
                className="absolute inset-0 w-full h-full object-cover object-[74%_center]"
                fetchpriority="high"
              />
            </div>

            <FloatingChip className="-left-2 sm:-left-8 top-8 sm:top-12" delay={0.6}>
              <span className="w-9 h-9 rounded-full btn-joy flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" strokeWidth={3} />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold">Visit complete</span>
                <span className="block text-xs text-stone-600">2:00 to 4:00 PM</span>
              </span>
            </FloatingChip>

            <FloatingChip className="-right-2 sm:-right-6 bottom-24 sm:bottom-28" delay={0.9}>
              <span className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-[#FF6B6B]" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-bold">3 new photos</span>
            </FloatingChip>

            <FloatingChip className="left-6 sm:left-10 -bottom-5" delay={1.2}>
              <Heart className="w-5 h-5 text-[#FF6B6B] fill-[#FFB7B2]" strokeWidth={1.75} />
              <span className="text-sm font-semibold">"She loved the walk today"</span>
            </FloatingChip>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
