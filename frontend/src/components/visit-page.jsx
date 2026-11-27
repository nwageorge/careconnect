import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Phone, Mail, ShieldCheck } from "lucide-react";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, CONTACT_EMAIL } from "@/components/voallen-sections";

// Sections of the "Ask about a visit" page (/visits). The caregiver carousel between them
// lives in App.js because it reuses the app's AgencyCarousel and live caregiver data.

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { type: "spring", stiffness: 100, damping: 20 },
};

/* ------------------------------------------------------------------ Hero */

export const VisitHero = () => (
  <section className="pt-24 sm:pt-28" data-testid="visit-hero">
    <div className="relative rounded-3xl overflow-hidden bg-stone-100 min-h-[560px] lg:min-h-[600px] flex items-end lg:items-center lg:justify-end">
      <img
        src="/voallen/photo-album.jpg"
        alt="An older woman and a companion looking through a photo album by the window."
        className="absolute inset-0 w-full h-full object-cover"
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative m-4 sm:m-8 lg:m-12 w-full sm:max-w-md bg-white rounded-3xl shadow-2xl p-7 sm:p-10"
      >
        <h1 className="font-display text-4xl sm:text-6xl leading-[0.95] text-stone-800 leading-tight mb-4">
          Companionship visits near you
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed mb-8">
          Friendly, personal visits for your loved one at home, in assisted living, or in a nursing home.
        </p>
        <a
          href="#philadelphia-agencies"
          className="btn-joy rounded-full block w-full text-center px-8 py-4 text-lg mb-3"
          data-testid="visit-hero-cta"
        >
          Find care in Philadelphia
        </a>
        <a
          href={CONTACT_PHONE_HREF}
          className="btn-glass rounded-full flex items-center justify-center gap-2 w-full px-8 py-4 text-stone-800 font-semibold"
        >
          <Phone className="w-5 h-5" /> Call {CONTACT_PHONE}
        </a>
      </motion.div>
    </div>
    <div className="mt-4 rounded-2xl bg-stone-50 border border-stone-100 px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
      <ShieldCheck className="w-5 h-5 text-stone-700 shrink-0" />
      <p className="text-stone-700">
        Every caregiver is background checked and reviewed by our team before they appear on Voallen.{" "}
        <Link to="/faq" className="font-semibold underline underline-offset-2 hover:text-stone-900">
          How it works
        </Link>
      </p>
    </div>
  </section>
);

/* ------------------------------------------- Home away from home benefits */

const benefits = [
  {
    title: "Visits where they already live",
    body: "We visit your loved one at home, in assisted living, or in a nursing home, so they stay in familiar surroundings and keep their own routines.",
  },
  {
    title: "Companions you can trust",
    body: "Meet Philadelphia caregivers, read reviews from families, and choose the person your loved one will look forward to seeing.",
  },
  {
    title: "Updates for the family",
    body: "Authorized family members can get visit updates, and we can help with family video calls so everyone stays close.",
  },
];

export const VisitBenefits = () => (
  <section className="py-16 sm:py-24" data-testid="visit-benefits">
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <motion.div {...reveal} className="rounded-3xl overflow-hidden bg-stone-100 aspect-[4/5] max-h-[600px] shadow-lg">
        <img
          src="/voallen/window.jpg"
          alt="An older woman holding hands with a companion while looking out a window."
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 35%" }}
          loading="lazy"
        />
      </motion.div>
      <motion.div {...reveal}>
        <h2 className="font-display text-5xl sm:text-6xl text-stone-900 leading-[0.95] mb-10">
          A familiar face, close to home
        </h2>
        <ul className="space-y-8">
          {benefits.map((b) => (
            <li key={b.title} className="flex gap-5">
              <span className="mt-1 w-9 h-9 shrink-0 rounded-full bg-stone-800 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-stone-800 mb-1">{b.title}</h3>
                <p className="text-lg text-stone-600 leading-relaxed">{b.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  </section>
);

/* --------------------------------------------------------- Stat banner */

export const VisitStatBanner = ({ agencyCount }) => (
  <section className="py-8" data-testid="visit-stat-banner">
    <div className="rounded-3xl bg-stone-100 overflow-hidden flex flex-col sm:flex-row items-center">
      <img
        src="/voallen/groceries.jpg"
        alt=""
        className="w-full sm:w-56 h-48 sm:h-44 object-cover"
        style={{ objectPosition: "center 20%" }}
        loading="lazy"
      />
      <p className="px-8 py-8 text-xl sm:text-2xl text-stone-800 text-center sm:text-left leading-snug">
        {agencyCount > 0 ? (
          <>
            <span className="font-bold bg-white rounded-lg px-2">{agencyCount} trusted caregivers</span> are ready to visit
            your loved one in Philadelphia.
          </>
        ) : (
          <>Trusted caregivers are ready to visit your loved one in Philadelphia.</>
        )}
      </p>
    </div>
  </section>
);

/* -------------------------------------------------------------- FAQ */

const visitFaqs = [
  {
    q: "What happens during a companionship visit?",
    a: [
      "A companion spends time with your loved one doing the things they enjoy: conversation, reading, games, a walk, or simply keeping them company.",
      "Before the first visit, we talk with you about your loved one's interests, routines and anything the companion should know, so every visit feels personal.",
    ],
  },
  {
    q: "Where do visits take place?",
    a: ["Visits happen wherever your loved one lives: their own home, an assisted living community, or a nursing home in Philadelphia and the surrounding area."],
  },
  {
    q: "Is this medical care?",
    a: ["No. Companionship visits are nonmedical. Companions offer friendship and support, while your loved one's care team continues to handle their medical needs."],
  },
  {
    q: "Can family members get updates after a visit?",
    a: ["Yes. Family members you authorize can receive visit updates, and companions can help your loved one join a family video call."],
  },
  {
    q: "How do I choose the right caregiver?",
    a: ["Compare the Philadelphia caregivers above. Each profile shows what they help with, their hourly rate and reviews from other families. You can ask for a first meeting before booking any visits."],
  },
  {
    q: "Can I book a visit for a birthday or special occasion?",
    a: ["Yes. Birthday and special occasion visits are one of our services, so your loved one has someone to share the moment with."],
  },
  {
    q: "How do I get started?",
    a: [
      <>
        Call us at{" "}
        <a href={CONTACT_PHONE_HREF} className="font-semibold text-stone-800 underline underline-offset-2">{CONTACT_PHONE}</a>, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-stone-800 underline underline-offset-2">{CONTACT_EMAIL}</a>, or pick a
        caregiver above and request a first meeting.
      </>,
    ],
  },
];

export const VisitFAQ = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-16 sm:py-24" data-testid="visit-faq">
      <div className="max-w-4xl">
        <h2 className="font-display text-5xl sm:text-6xl text-stone-900 leading-[0.95] mb-3">Companionship visit FAQs</h2>
        <p className="text-lg text-stone-500 mb-10">Common questions about visits with Voallen</p>
        <div className="border-t border-stone-200">
          {visitFaqs.map((item, i) => {
            const isOpen = i === open;
            return (
              <div key={item.q} className="border-b border-stone-200">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 py-6 text-left"
                  data-testid={`visit-faq-${i}`}
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
                      <div className="pl-9 pb-6 space-y-4 text-lg text-stone-600 leading-relaxed">
                        {item.a.map((para, j) => (
                          <p key={j}>{para}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href={CONTACT_PHONE_HREF}
            className="btn-joy rounded-full inline-flex items-center justify-center gap-2 px-6 py-4"
          >
            <Phone className="w-5 h-5" /> Call {CONTACT_PHONE}
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="btn-glass rounded-full inline-flex items-center justify-center gap-2 px-6 py-4 text-stone-800 font-semibold"
          >
            <Mail className="w-5 h-5" /> Email us
          </a>
        </div>
      </div>
    </section>
  );
};
