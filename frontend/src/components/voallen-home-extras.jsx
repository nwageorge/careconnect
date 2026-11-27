import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Phone, Mail, Camera, Clock, MessageCircle, Footprints, Puzzle, BookOpen, Video } from "lucide-react";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, CONTACT_EMAIL } from "@/components/voallen-sections";
import { VoallenLogo } from "@/components/voallen-logo";

const INK = "#1A1A2E";
const CORAL = "#FF6B6B";

// Extra home page sections: a numbered "How it works" timeline, a two card row,
// a closing call to action and the footer. Styled in the OnePermit design system:
// warm pastel gradients, liquid glass cards, rounded-3xl and gradient pill buttons.

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { type: "spring", stiffness: 100, damping: 20 },
};

const Eyebrow = ({ children }) => (
  <p className="eyebrow mb-4">{children}</p>
);

/* ------------------------------------------------------------- How it works */

const steps = [
  {
    title: "Tell us about your loved one",
    body: "A short call about their routine, what they enjoy, and the kind of company that would brighten their week.",
  },
  {
    title: "We pick the right companion",
    body: "Every companion is background checked and matched on personality, interests and schedule.",
  },
  {
    title: "Visits start where they live",
    body: "At home, in assisted living or in a care community. Weekly, a few times a week, or for a special day.",
  },
  {
    title: "You see every visit",
    body: "Photos, a short note and the time of each visit land on your phone, so you never have to wonder.",
  },
  {
    title: "Change anything, anytime",
    body: "More visits, fewer visits or a new companion. One message and we adjust.",
  },
];

export const HowVoallenWorks = () => (
  <section id="how-it-works" className="py-16 sm:py-24 scroll-mt-24" data-testid="how-it-works-section">
    <div className="grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-start">
      <motion.div {...reveal} className="lg:sticky lg:top-32">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="font-display text-5xl sm:text-6xl text-stone-900 leading-[0.95] mb-6">
          We visit.
          <br />
          <span className="relative inline-flex items-center gap-3">
            <span className="relative">
              You see it.
              <svg
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute left-0 -bottom-2 w-full h-3"
                aria-hidden="true"
              >
                <path d="M2 8 Q 100 1 198 7" stroke={CORAL} strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            <span
              className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full btn-joy"
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
            </span>
          </span>
        </h2>
        <p className="text-lg text-stone-500 max-w-md">
          Five simple steps from the first call to a calendar full of good company, with proof after every visit.
        </p>
      </motion.div>

      <motion.ol {...reveal} className="glass-card rounded-3xl relative px-6 py-8 sm:px-10 sm:py-10">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step.title} className="relative flex gap-5 sm:gap-6 pb-8 last:pb-0">
              {!last && (
                <span className="absolute left-5 sm:left-6 top-12 bottom-0 w-px bg-gradient-to-b from-[#FFB7B2] to-[#E6E6FA]" aria-hidden="true" />
              )}
              <span
                className={`relative z-10 shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm sm:text-base font-bold ${last ? "btn-joy" : "bg-joy-hero text-stone-900"}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-1.5 sm:pt-2.5">
                <h3 className="text-lg sm:text-xl font-semibold text-stone-800 tracking-[-0.01em] mb-1.5">{step.title}</h3>
                <p className="text-stone-500 leading-relaxed">{step.body}</p>
              </div>
            </li>
          );
        })}
      </motion.ol>
    </div>
  </section>
);


/* ----------------------------------------------- Peach to lavender band: what a visit holds */

const visitMoments = [
  { icon: MessageCircle, title: "Good conversation", body: "Stories, news and a listening ear." },
  { icon: Footprints, title: "Short walks", body: "Fresh air around the block or the garden." },
  { icon: Puzzle, title: "Games and puzzles", body: "Cards, crosswords and friendly competition." },
  { icon: BookOpen, title: "Reading aloud", body: "The paper, a favorite novel or letters from family." },
  { icon: Video, title: "Video calls", body: "We set up the call and hold the tablet." },
  { icon: Camera, title: "Photos for you", body: "A few snapshots from every visit." },
];

export const VisitMomentsBand = () => (
  <section className="py-16 sm:py-24" data-testid="visit-moments-section">
    <div className="rounded-[2.5rem] p-4 sm:p-6 lg:p-8 bg-joy-hero">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-4 sm:gap-5">
        <motion.div {...reveal} className="glass-card overflow-hidden flex flex-col">
          <div className="p-7 sm:p-8">
            <h2 className="font-display text-4xl sm:text-5xl leading-[0.98] text-stone-900">
              Every visit is shaped around them
            </h2>
          </div>
          <img
            src="/voallen/breakfast.jpg"
            alt="A young companion sharing breakfast with an older woman at her kitchen table."
            className="w-full flex-1 min-h-[220px] object-cover"
          />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {visitMoments.map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              {...reveal}
              className="glass-card glass-lift p-6 sm:p-7 flex flex-col justify-between min-h-[150px] sm:min-h-[180px] text-stone-900"
            >
              <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-white/70 dark:bg-white/10 shadow-sm"><Icon className="w-6 h-6" strokeWidth={1.5} style={{ color: CORAL }} /></span>
              <div className="mt-8">
                <h3 className="text-xl font-semibold tracking-[-0.02em] mb-1 text-stone-900">{title}</h3>
                <p className="text-sm text-stone-600">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ----------------------------------------------------------- Two card row */

export const TwoPathsSection = () => (
  <section className="pb-4" data-testid="two-paths-section">
    <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
      {/* White card: book a visit */}
      <motion.div
        {...reveal}
        className="glass-card glass-lift rounded-3xl p-8 sm:p-10 flex flex-col"
      >
        <Eyebrow>For families</Eyebrow>
        <h3 className="font-display text-3xl sm:text-4xl text-stone-900 leading-[1.02] mb-4">
          Company for the people you love, on their schedule.
        </h3>
        <p className="text-stone-500 text-lg mb-8 max-w-md">
          Friendly visits, special occasions, hospice companionship and video calls, all with a familiar face.
        </p>
        <Link
          to="/visits"
          className="btn-joy rounded-full mt-auto self-start inline-flex items-center gap-2 px-6 py-3.5 rounded-full"
        >
          See how visits work <ArrowUpRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Blush card: proof after every visit */}
      <motion.div
        {...reveal}
        className="rounded-3xl p-8 sm:p-10 flex flex-col bg-joy-blush text-stone-900 glass-lift"
      >
        <p className="eyebrow mb-4" style={{ color: INK, opacity: 0.6 }}>Proof of care</p>
        <h3 className="font-display text-3xl sm:text-4xl leading-[1.02] mb-6 text-stone-900">
          After every visit, a little note lands on your phone.
        </h3>
        {/* Example update card */}
        <div className="mt-auto glass-card p-4 sm:p-5 text-stone-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Visit update</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0EE] px-2.5 py-1 text-xs font-bold" style={{ color: "#C9374A" }}>
              <Check className="w-3.5 h-3.5" strokeWidth={3} /> Visit complete
            </span>
          </div>
          <div className="flex gap-3 items-start">
            <img
              src="/voallen/photo-album.jpg"
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
            />
            <div className="text-sm leading-relaxed">
              <p className="mb-2">"We looked through the old photo albums and she told me all about the lake house."</p>
              <p className="flex items-center gap-3 text-xs opacity-70">
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 2:00 to 4:00 PM</span>
                <span className="inline-flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> 3 photos</span>
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs mt-3 opacity-75">Example of an update</p>
      </motion.div>
    </div>
  </section>
);

/* ---------------------------------------------------------- Closing CTA */

export const ClosingCTASection = () => (
  <section className="py-16 sm:py-24" data-testid="closing-cta-section">
    <motion.div
      {...reveal}
      className="rounded-[2.5rem] bg-joy-hero px-6 py-14 sm:px-12 sm:py-20 lg:px-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
    >
      <div className="max-w-xl">
        <h2 className="font-display text-5xl sm:text-6xl text-stone-900 leading-[0.95] mb-5">
          Ready for a friendly face at the door?
        </h2>
        <p className="text-lg text-stone-500">
          Tell us about your loved one and we'll suggest a companion and a visit plan, usually within a day.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <a
          href={CONTACT_PHONE_HREF}
          className="btn-joy inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg"
        >
          <Phone className="w-5 h-5" /> Book a call
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="btn-glass inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold"
        >
          <Mail className="w-5 h-5" /> Email us
        </a>
      </div>
    </motion.div>
  </section>
);

/* --------------------------------------------------------------- Footer */

// Minimal, clean footer on a glass panel, as in the OnePermit footer.
const footerLink = "text-sm text-stone-600 hover:text-stone-900 transition";
const footerHead = "text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4";

export const HomeFooter = () => (
  <footer className="relative px-3 sm:px-6 lg:px-[3vw] pb-4 sm:pb-6 pt-8">
    <div className="glass-card max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <VoallenLogo size="sm" className="mb-4" />
          <p className="text-sm text-stone-600 leading-relaxed max-w-xs">
            Warm companionship visits for older adults, with proof of care after every visit.
          </p>
          <p className="text-sm text-stone-600 mt-3">Serving Philadelphia, PA</p>
        </div>
        <div>
          <h4 className={footerHead}>Visits</h4>
          <ul className="space-y-2.5">
            <li><Link to="/visits" className={footerLink}>Friendly companionship</Link></li>
            <li><Link to="/visits" className={footerLink}>Special occasions</Link></li>
            <li><Link to="/visits" className={footerLink}>Hospice companionship</Link></li>
            <li><Link to="/visits" className={footerLink}>Video calls</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={footerHead}>Company</h4>
          <ul className="space-y-2.5">
            <li><Link to="/about" className={footerLink}>About us</Link></li>
            <li><Link to="/how-it-works" className={footerLink}>How it works</Link></li>
            <li><Link to="/caregivers" className={footerLink}>Caregiver jobs</Link></li>
            <li><Link to="/faq" className={footerLink}>FAQ</Link></li>
            <li><Link to="/contact" className={footerLink}>Contact us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={footerHead}>Contact</h4>
          <ul className="space-y-2.5">
            <li><a href={CONTACT_PHONE_HREF} className={`${footerLink} inline-flex items-center gap-2`}><Phone className="w-4 h-4" style={{ color: CORAL }} /> {CONTACT_PHONE}</a></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`} className={`${footerLink} inline-flex items-center gap-2 break-all`}><Mail className="w-4 h-4 shrink-0" style={{ color: CORAL }} /> {CONTACT_EMAIL}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-stone-500">© {new Date().getFullYear()} Voallen. All rights reserved.</p>
        <div className="flex gap-5">
          <Link to="/privacy" className="text-xs text-stone-500 hover:text-stone-900 transition">Privacy</Link>
          <Link to="/terms" className="text-xs text-stone-500 hover:text-stone-900 transition">Terms</Link>
          <Link to="/contact" className="text-xs text-stone-500 hover:text-stone-900 transition">Accessibility help</Link>
        </div>
      </div>
    </div>
  </footer>
);

// The same footer is used on every page
export const SiteFooter = HomeFooter;
