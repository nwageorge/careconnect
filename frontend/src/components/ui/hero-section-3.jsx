import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";

// The home page hero in the editorial style: an oversized left-aligned
// headline with the short intro beside it, then a large wide photo with the
// search capsule (coral Search button) sitting on its bottom edge.
const hero = {
  image: "/voallen/hero-walk.jpg",
  alt: "An older woman walking arm in arm with a smiling companion in an autumn park.",
  title: "Proof of care, not promises.",
  subtitle: "Transparent care for your loved ones",
};

const ease = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] };

export default function HeroSection3() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/agencies?search=${encodeURIComponent(q)}` : "/agencies");
  };

  return (
    <div className="w-full antialiased relative pt-[64px] sm:pt-[76px]">
      <SiteHeader />

      <section className="pt-10 sm:pt-16 lg:pt-20 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 grid lg:grid-cols-[1fr_minmax(0,340px)] gap-6 lg:gap-16 lg:items-end">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ease}
            className="display-xl text-stone-900"
          >
            {hero.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.1 }}
            className="lg:pb-3"
          >
            <p className="text-[18px] sm:text-[21px] leading-[1.4] text-stone-900">
              {hero.subtitle}. Companionship visits across Philadelphia, with a note and photos after every one.
            </p>
            <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] font-medium">
              <Link to="/faq" className="op-link inline-flex items-center gap-1">How it works <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/caregivers" className="op-link inline-flex items-center gap-1">Are you a caregiver? <ArrowRight className="w-4 h-4" /></Link>
            </p>
          </motion.div>
        </div>

        {/* Photo with the search capsule on its bottom edge */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ease, delay: 0.2 }}
          className="relative mt-10 sm:mt-14 mx-auto w-full max-w-[1360px] px-4 sm:px-8"
        >
          <div className="relative rounded-[20px] overflow-hidden bg-mist h-[460px] sm:h-[560px] lg:h-[680px]">
            <img
              src={hero.image}
              alt={hero.alt}
              className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-[center_40%]"
              fetchpriority="high"
            />
          </div>

          <form
            onSubmit={handleSearch}
            className="absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-8 w-[calc(100%-3rem)] sm:w-auto bg-white dark:bg-[#161617] rounded-full pl-5 pr-2 py-2 sm:pl-6 flex items-center gap-3 sm:gap-6 text-left shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
            data-testid="hero-search-card"
          >
            <div className="hidden sm:block shrink-0">
              <p className="text-[14px] font-semibold text-stone-900 leading-tight">Find care near you</p>
              <p className="text-[12px] text-stone-500 leading-tight mt-0.5">City or zip code</p>
            </div>
            <label className="flex-1 sm:w-56 flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 shrink-0 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Philadelphia, PA"
                aria-label="City or zip code"
                className="w-full min-w-0 bg-transparent text-[16px] text-stone-900 placeholder:text-stone-400 outline-none py-2"
                data-testid="hero-search-input"
              />
            </label>
            <button
              type="submit"
              className="btn-coral shrink-0 rounded-full px-6 py-3 text-[15px]"
              data-testid="hero-search-btn"
            >
              Search
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
