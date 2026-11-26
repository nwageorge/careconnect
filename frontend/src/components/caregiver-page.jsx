import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  Phone,
  Mail,
  ShieldCheck,
  CalendarClock,
  MapPin,
  HeartHandshake,
  TrendingUp,
  BadgeCheck,
  Headphones,
} from "lucide-react";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, CONTACT_EMAIL } from "@/components/voallen-sections";

// Sections of the "Work with us" page for caregivers looking for work (/caregivers).
// Layout follows a caregiver-jobs page (hero, ways to help, why join, steps, safety, FAQ, closing call to action),
// built in the same stone style and rounded cards as the rest of Voallen.

// There is no caregiver account type yet, so applying goes to our inbox.
export const CAREGIVER_APPLY_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Caregiver application")}&body=${encodeURIComponent(
  "Hi Voallen,\n\nI'd like to apply to be a caregiver.\n\nName:\nPhone:\nNeighborhood / zip code:\nExperience:\nDays and hours I can work:\n"
)}`;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6 },
};

const SectionHeading = ({ eyebrow, title, intro, center = false }) => (
  <motion.div {...reveal} className={`max-w-3xl mb-10 sm:mb-14 ${center ? "mx-auto text-center" : ""}`}>
    {eyebrow && <p className="text-sm font-semibold tracking-wide uppercase text-stone-500 mb-3">{eyebrow}</p>}
    <h2 className="text-3xl sm:text-5xl font-bold text-stone-800 leading-tight mb-4">{title}</h2>
    {intro && <p className="text-lg sm:text-xl text-stone-500 leading-relaxed">{intro}</p>}
  </motion.div>
);

const PrimaryButton = ({ href, children, className = "" }) => (
  <a
    href={href}
    className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#1c1917] text-[#fafaf9] dark:bg-[#fafaf9] dark:text-[#1c1917] text-lg font-semibold hover:opacity-90 transition-opacity ${className}`}
    data-testid="caregiver-apply"
  >
    {children}
  </a>
);

const SecondaryButton = ({ href, children, className = "" }) => (
  <a
    href={href}
    className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-stone-800 text-stone-800 text-lg font-semibold hover:bg-stone-100 transition-colors ${className}`}
  >
    {children}
  </a>
);

/* ------------------------------------------------------------------ Hero */

export const CaregiverHero = () => (
  <section className="pt-24 sm:pt-28" data-testid="caregiver-hero">
    <div className="relative rounded-3xl overflow-hidden bg-stone-100 min-h-[560px] lg:min-h-[600px] flex items-end lg:items-center">
      <img
        src="/voallen/stairs.jpg"
        alt="A young man walking an older woman up the stairs, carrying her groceries."
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 30%" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative m-4 sm:m-8 lg:m-12 w-full sm:max-w-md rounded-3xl shadow-2xl p-7 sm:p-10"
        style={{ backgroundColor: "#ffffff" }}
      >
        <p className="text-sm font-semibold tracking-wide uppercase mb-3" style={{ color: "#78716c" }}>For caregivers</p>
        <h1 className="text-3xl sm:text-4xl font-display font-normal tracking-[-0.03em] leading-tight mb-4" style={{ color: "#292524" }}>
          Find caregiving work you'll love
        </h1>
        <p className="text-lg leading-relaxed mb-8" style={{ color: "#57534e" }}>
          Spend your days brightening someone's. Get matched with seniors near you through trusted Philadelphia care agencies.
        </p>
        <a
          href={CAREGIVER_APPLY_HREF}
          className="block w-full text-center px-8 py-4 rounded-2xl text-lg font-semibold mb-3 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#292524", color: "#ffffff" }}
          data-testid="caregiver-hero-apply"
        >
          Apply now
        </a>
        <a
          href={CONTACT_PHONE_HREF}
          className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-2xl font-semibold border transition-colors hover:opacity-80"
          style={{ borderColor: "#e7e5e4", color: "#292524" }}
        >
          <Phone className="w-5 h-5" /> Call {CONTACT_PHONE}
        </a>
      </motion.div>
    </div>
  </section>
);

/* ------------------------------------------------------- Ways to help */

const waysToHelp = [
  { label: "Birthday & Special Occasion Visits", icon: "/voallen/service-icon-4.png" },
  { label: "Friendly Companionship Visits", icon: "/voallen/service-icon-0.png" },
  { label: "Hospice Companionship Visits", icon: "/voallen/service-icon-1.png" },
  { label: "Reading, Games & Social Engagement", icon: "/voallen/service-icon-2.png" },
  { label: "Family Video Call Assistance", icon: "/voallen/service-icon-3.png" },
  { label: "Visit Updates for Families", icon: "/voallen/service-icon-5.png" },
];

export const CaregiverWaysToHelp = () => (
  <section className="py-16 sm:py-24" data-testid="caregiver-ways">
    <SectionHeading
      title="So many ways to make a difference"
      intro="Pick the kinds of visits you enjoy most. Many caregivers mix a few of them each week."
    />
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {waysToHelp.map((w) => (
        <motion.div
          {...reveal}
          key={w.label}
          className="flex flex-col items-center text-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 pt-4 pb-5"
        >
          <img src={w.icon} alt="" className="w-20 h-20 object-contain" loading="lazy" />
          <span className="text-sm font-medium leading-snug text-stone-700">{w.label}</span>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------------- Why join */

const reasons = [
  { icon: MapPin, title: "Work close to home", body: "Visits are matched to the neighborhoods you choose, so you spend less time traveling." },
  { icon: CalendarClock, title: "Hours that fit your life", body: "Full time, part time or a few visits a week. You tell us when you're free." },
  { icon: HeartHandshake, title: "Work that matters", body: "Be the friendly face a senior looks forward to, and give families real peace of mind." },
  { icon: TrendingUp, title: "Grow your career", body: "Build reviews from families and agencies, and take on more visits as you go." },
];

export const CaregiverReasons = () => (
  <section className="py-16 sm:py-24" data-testid="caregiver-reasons">
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <motion.div {...reveal} className="rounded-3xl overflow-hidden bg-stone-100 aspect-[4/5] max-h-[600px] shadow-lg">
        <img
          src="/voallen/breakfast.jpg"
          alt="An older woman and a younger woman sharing breakfast at the kitchen table."
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
      <div>
        <SectionHeading title="Why caregivers choose Voallen" />
        <ul className="grid sm:grid-cols-2 gap-8">
          {reasons.map(({ icon: Icon, title, body }) => (
            <motion.li {...reveal} key={title}>
              <span className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-stone-700" />
              </span>
              <h3 className="text-xl font-semibold text-stone-800 mb-1">{title}</h3>
              <p className="text-lg text-stone-600 leading-relaxed">{body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------- Getting started */

const startSteps = [
  { title: "Tell us about you", body: "Share your experience, the visits you'd like to do, and the days and neighborhoods that work for you." },
  { title: "Complete a background check", body: "Every caregiver is screened before meeting a family. We'll walk you through it." },
  { title: "Meet trusted agencies", body: "Reviewed Philadelphia agencies get in touch. Talk with them and choose the one that fits." },
  { title: "Start your first visits", body: "Get your schedule, meet the seniors you'll visit and get paid for every visit." },
];

export const CaregiverSteps = () => (
  <section className="py-16 sm:py-24" data-testid="caregiver-steps">
    <div className="rounded-3xl bg-[#f3ece2] dark:bg-stone-100 p-6 sm:p-12 lg:p-16 grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
      <div>
        <SectionHeading title="Getting started is simple" />
        <ol className="space-y-7">
          {startSteps.map((s, i) => (
            <motion.li {...reveal} key={s.title} className="flex gap-5">
              <span className="shrink-0 w-11 h-11 rounded-full bg-[#1c1917] text-[#fafaf9] dark:bg-[#fafaf9] dark:text-[#1c1917] flex items-center justify-center text-lg font-semibold">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-stone-800 mb-1">{s.title}</h3>
                <p className="text-lg text-stone-600 leading-relaxed">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <PrimaryButton href={CAREGIVER_APPLY_HREF} className="mt-10">Apply now</PrimaryButton>
      </div>
      <motion.div {...reveal} className="hidden lg:block w-[380px] rounded-3xl overflow-hidden shadow-lg aspect-[4/5]">
        <img
          src="/voallen/groceries.jpg"
          alt="A young man and an older woman smiling at each other as he hands her a grocery bag."
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
    </div>
  </section>
);

/* ------------------------------------------------------- Safety */

const safety = [
  { icon: BadgeCheck, title: "Reviewed agencies only", body: "You only work with care agencies our team has checked and approved." },
  { icon: ShieldCheck, title: "Screened community", body: "Caregivers and agencies are screened, so every visit starts on a foundation of trust." },
  { icon: Headphones, title: "Real people to help", body: `Questions or concerns? Call ${CONTACT_PHONE} or email us and a person will help.` },
];

export const CaregiverSafety = () => (
  <section className="py-16 sm:py-24" data-testid="caregiver-safety">
    <SectionHeading center title="Safety and support, every visit" intro="Caring for others is easier when someone has your back." />
    <div className="grid md:grid-cols-3 gap-5">
      {safety.map(({ icon: Icon, title, body }) => (
        <motion.div {...reveal} key={title} className="rounded-3xl border border-stone-200 bg-stone-50 p-7 sm:p-8">
          <Icon className="w-8 h-8 text-stone-700 mb-5" />
          <h3 className="text-xl font-semibold text-stone-800 mb-2">{title}</h3>
          <p className="text-lg text-stone-600 leading-relaxed">{body}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

/* -------------------------------------------------------------- FAQ */

const caregiverFaqs = [
  {
    q: "What kind of work will I do?",
    a: "Nonmedical companionship visits: conversation, reading, games, short walks, birthday visits, help with family video calls and keeping families updated.",
  },
  {
    q: "Do I need medical training?",
    a: "No. Companionship visits are nonmedical. Kindness, reliability and good communication matter most. Experience with seniors is a plus.",
  },
  {
    q: "Where are the jobs?",
    a: "Right now we're matching caregivers in Philadelphia and the surrounding area, in private homes, assisted living and nursing homes.",
  },
  {
    q: "Is there a background check?",
    a: "Yes. Every caregiver completes a background check before visiting a family. We'll explain each step when you apply.",
  },
  {
    q: "How do I apply?",
    a: (
      <>
        Email us at{" "}
        <a href={CAREGIVER_APPLY_HREF} className="font-semibold text-stone-800 underline underline-offset-2">{CONTACT_EMAIL}</a>{" "}
        or call{" "}
        <a href={CONTACT_PHONE_HREF} className="font-semibold text-stone-800 underline underline-offset-2">{CONTACT_PHONE}</a>.
        Tell us a little about yourself and when you can work, and we'll be in touch.
      </>
    ),
  },
];

export const CaregiverFAQ = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-16 sm:py-24" data-testid="caregiver-faq">
      <div className="max-w-4xl">
        <SectionHeading title="Questions from caregivers" />
        <div className="border-t border-stone-200">
          {caregiverFaqs.map((item, i) => {
            const isOpen = i === open;
            return (
              <div key={item.q} className="border-b border-stone-200">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 py-6 text-left"
                >
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                    <ChevronDown className="w-5 h-5 text-stone-600" />
                  </motion.span>
                  <span className="text-lg sm:text-xl font-semibold text-stone-800">{item.q}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pl-9 pb-6 text-lg text-stone-600 leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------- Closing CTA */

export const CaregiverCTA = () => (
  <section className="pb-20 sm:pb-28" data-testid="caregiver-cta">
    <motion.div {...reveal} className="rounded-3xl bg-[#1c1917] px-6 py-14 sm:px-12 sm:py-16 text-center">
      <h2 className="text-3xl sm:text-5xl font-bold leading-tight mb-4" style={{ color: "#fafaf9" }}>Ready to start caring?</h2>
      <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto" style={{ color: "#d6d3d1" }}>
        Join Voallen and bring a little more company to seniors near you.
      </p>
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10" style={{ color: "#e7e5e4" }}>
        {["Flexible hours", "Visits near home", "Reviewed agencies"].map((t) => (
          <li key={t} className="flex items-center gap-2 text-base"><Check className="w-5 h-5" /> {t}</li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={CAREGIVER_APPLY_HREF}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#fafaf9", color: "#1c1917" }}
        >
          <Mail className="w-5 h-5" /> Apply by email
        </a>
        <a
          href={CONTACT_PHONE_HREF}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 text-lg font-semibold hover:opacity-80 transition-opacity"
          style={{ borderColor: "#fafaf9", color: "#fafaf9" }}
        >
          <Phone className="w-5 h-5" /> Call {CONTACT_PHONE}
        </a>
      </div>
      <p className="mt-8 text-sm" style={{ color: "#a8a29e" }}>
        Looking for care instead? <Link to="/visits" className="underline underline-offset-2">Ask about a visit</Link>
      </p>
    </motion.div>
  </section>
);
