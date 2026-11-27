import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";

// The home page hero, laid out like the OnePermit home hero: a centred SF
// headline on white, a short line under it, then a large photo with rounded
// corners and a white search "capsule" sitting on its bottom edge.
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

      <section className="text-center pt-10 sm:pt-14 overflow-hidden">
        <div className="px-5">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ease}
            className="font-display text-[2.75rem] sm:text-6xl lg:text-[80px] leading-[1.05] text-stone-900 max-w-4xl mx-auto"
          >
            {hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.1 }}
            className="text-[14px] sm:text-[17px] leading-[1.4] text-stone-900 mt-6 sm:mt-7"
          >
            {hero.subtitle}.
            <br />
            <Link to="/faq" className="op-link">How it works</Link>
            <span className="text-stone-400 px-3">|</span>
            <Link to="/caregivers" className="op-link">Are you a caregiver?</Link>
          </motion.p>
        </div>

        {/* Photo with the search capsule on its bottom edge */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ease, delay: 0.2 }}
          className="relative mt-8 sm:mt-10 mx-auto w-full max-w-[1100px] px-4 sm:px-6"
        >
          <div className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-mist h-[420px] sm:h-[520px] lg:h-[620px]">
            <img
              src={hero.image}
              alt={hero.alt}
              className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-[center_40%]"
              fetchpriority="high"
            />
          </div>

          <form
            onSubmit={handleSearch}
            className="absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-8 w-[calc(100%-3rem)] sm:w-auto bg-white dark:bg-[#1d1d1f] rounded-[28px] pl-5 pr-2 py-2 sm:pl-6 flex items-center gap-3 sm:gap-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
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
              className="btn-primary shrink-0 rounded-full px-5 py-2.5 text-[15px]"
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
