import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Phone, Mail, Camera, Clock, MessageCircle, Footprints, Puzzle, BookOpen, Video } from "lucide-react";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, CONTACT_EMAIL } from "@/components/voallen-sections";
import { VoallenLogo } from "@/components/voallen-logo";

const BLUE = "#1f4fff";

// Extra home page sections: a numbered "How it works" list, a two column row,
// a closing call to action and the footer. Editorial style: oversized type,
// hairline rules instead of boxes, large photos, blue accents, a coral CTA and
// a dark footer that doubles as the closing call to action.

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
        <h2 className="font-display text-5xl sm:text-6xl lg:text-[5.25rem] text-stone-900 leading-[0.98] mb-6">
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
                <path d="M2 8 Q 100 1 198 7" stroke={BLUE} strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            <span
              className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full btn-primary"
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
            </span>
          </span>
        </h2>
        <p className="text-lg text-stone-500 max-w-md">
          Five simple steps from the first call to a calendar full of good company, with proof after every visit.
        </p>
      </motion.div>

      <motion.ol {...reveal} className="border-b border-stone-200">
        {steps.map((step, i) => (
          <li key={step.title} className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[6rem_1fr] gap-4 sm:gap-6 py-7 sm:py-9 border-t border-stone-200">
            <span className="font-display text-3xl sm:text-5xl leading-none" style={{ color: BLUE }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-2xl sm:text-[28px] font-semibold text-stone-900 mb-2">{step.title}</h3>
              <p className="text-stone-500 text-[17px] leading-relaxed max-w-xl">{step.body}</p>
            </div>
          </li>
        ))}
      </motion.ol>
    </div>
  </section>
);


/* ----------------------------------------------- Mist band: what a visit holds */

const visitMoments = [
  { icon: MessageCircle, title: "Good conversation", body: "Stories, news and a listening ear." },
  { icon: Footprints, title: "Short walks", body: "Fresh air around the block or the garden." },
  { icon: Puzzle, title: "Games and puzzles", body: "Cards, crosswords and friendly competition." },
  { icon: BookOpen, title: "Reading aloud", body: "The paper, a favorite novel or letters from family." },
  { icon: Video, title: "Video calls", body: "We set up the call and hold the tablet." },
  { icon: Camera, title: "Photos for you", body: "A few snapshots from every visit." },
];

export const VisitMomentsBand = () => (
  <section className="py-16 sm:py-28" data-testid="visit-moments-section">
    <div className="grid lg:grid-cols-[5fr_6fr] gap-10 lg:gap-20 items-stretch">
      <motion.div {...reveal} className="relative rounded-[20px] overflow-hidden min-h-[380px] sm:min-h-[520px]">
        <img
          src="/voallen/breakfast.jpg"
          alt="A young companion sharing breakfast with an older woman at her kitchen table."
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
      <motion.div {...reveal} className="flex flex-col">
        <Eyebrow>What a visit holds</Eyebrow>
        <h2 className="font-display text-5xl sm:text-6xl lg:text-[5.25rem] leading-[0.98] text-stone-900 mb-10 sm:mb-14">
          Every visit is shaped around them
        </h2>
        <ul className="grid sm:grid-cols-2 gap-x-10">
          {visitMoments.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4 py-5 border-t border-stone-200">
              <Icon className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={1.6} style={{ color: BLUE }} />
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-0.5">{title}</h3>
                <p className="text-[15px] text-stone-500">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
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
        className="rounded-[20px] p-8 sm:p-10 flex flex-col bg-ink"
      >
        <p className="eyebrow mb-4" style={{ color: "#8fa8ff" }}>For families</p>
        <h3 className="font-display text-4xl sm:text-5xl leading-[1] mb-5">
          Company for the people you love, on their schedule.
        </h3>
        <p className="text-lg mb-8 max-w-md">
          Friendly visits, special occasions, hospice companionship and video calls, all with a familiar face.
        </p>
        <Link
          to="/visits"
          className="btn-coral rounded-full mt-auto self-start inline-flex items-center gap-2 px-6 py-3.5"
        >
          See how visits work <ArrowUpRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Mist card: proof after every visit */}
      <motion.div
        {...reveal}
        className="rounded-[20px] p-8 sm:p-10 flex flex-col bg-mist text-stone-900"
      >
        <p className="eyebrow mb-4">Proof of care</p>
        <h3 className="font-display text-4xl sm:text-5xl leading-[1] mb-8 text-stone-900">
          After every visit, a little note lands on your phone.
        </h3>
        {/* Example update card */}
        <div className="mt-auto op-card p-4 sm:p-5 text-stone-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Visit update</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e9eeff] px-2.5 py-1 text-xs font-semibold" style={{ color: "#1f4fff" }}>
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
      className="rounded-[20px] bg-mist px-6 py-14 sm:px-12 sm:py-20 lg:px-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
    >
      <div className="max-w-xl">
        <h2 className="font-display text-5xl sm:text-6xl lg:text-[5.25rem] text-stone-900 leading-[0.98] mb-5">
          Ready for a friendly face at the door?
        </h2>
        <p className="text-lg text-stone-500">
          Tell us about your loved one and we'll suggest a companion and a visit plan, usually within a day.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <a
          href={CONTACT_PHONE_HREF}
          className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg"
        >
          <Phone className="w-5 h-5" /> Book a call
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="btn-outline inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold"
        >
          <Mail className="w-5 h-5" /> Email us
        </a>
      </div>
    </motion.div>
  </section>
);

/* --------------------------------------------------------------- Footer */

// Dark editorial footer that doubles as the closing call to action: a large
// headline with the coral "Book a call" button, then compact Visits, Company
// and Contact columns. It sits 64 to 80px below the last section.
const footerLink = "text-[15px] text-white/70 hover:text-white transition-colors";
const footerHead = "text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45 mb-4";

export const HomeFooter = () => (
  <footer className="bg-ink relative mt-16 md:mt-20" data-testid="site-footer">
    <div className="max-w-[1360px] mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-8">
      <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 lg:items-end pb-14 sm:pb-20 border-b border-white/15">
        <div className="max-w-3xl">
          <h2 className="font-display text-[2.75rem] sm:text-6xl lg:text-[5.5rem] leading-[0.96]">
            Ready for a friendly face at the door?
          </h2>
          <p className="text-lg sm:text-xl mt-6 max-w-xl">
            Tell us about your loved one and we'll suggest a companion and a visit plan, usually within a day.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <a
            href={CONTACT_PHONE_HREF}
            className="btn-coral inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-[17px]"
          >
            <Phone className="w-5 h-5" /> Book a call
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-[17px] font-medium text-white border border-white/40 hover:bg-white hover:text-[#0b0b0c] transition-colors"
          >
            <Mail className="w-5 h-5" /> Email us
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1.4fr] gap-10 py-12 sm:py-14">
        <div className="col-span-2 md:col-span-1">
          <VoallenLogo size="sm" tone="light" className="mb-4" />
          <p className="text-[15px] leading-relaxed max-w-xs">
            Warm companionship visits for older adults, with proof of care after every visit. Serving Philadelphia, PA.
          </p>
        </div>
        <div>
          <h4 className={footerHead}>Explore</h4>
          <ul className="space-y-3">
            <li><Link to="/visits" className={footerLink}>Visits</Link></li>
            <li><Link to="/how-it-works" className={footerLink}>How it works</Link></li>
            <li><Link to="/agencies" className={footerLink}>Find care</Link></li>
            <li><Link to="/caregivers" className={footerLink}>Caregiver jobs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={footerHead}>Company</h4>
          <ul className="space-y-3">
            <li><Link to="/about" className={footerLink}>About us</Link></li>
            <li><Link to="/faq" className={footerLink}>FAQ</Link></li>
            <li><Link to="/contact" className={footerLink}>Contact us</Link></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <h4 className={footerHead}>Contact</h4>
          <ul className="space-y-3">
            <li><a href={CONTACT_PHONE_HREF} className={`${footerLink} inline-flex items-center gap-2`}><Phone className="w-4 h-4" /> {CONTACT_PHONE}</a></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`} className={`${footerLink} inline-flex items-center gap-2 [overflow-wrap:anywhere]`}><Mail className="w-4 h-4 shrink-0" /> {CONTACT_EMAIL}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 pt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
        <p className="text-[13px] !text-white/50">Copyright © {new Date().getFullYear()} Voallen. All rights reserved.</p>
        <div className="flex gap-6 sm:ml-auto">
          <Link to="/privacy" className="text-[13px] text-white/60 hover:text-white">Privacy</Link>
          <Link to="/terms" className="text-[13px] text-white/60 hover:text-white">Terms</Link>
          <Link to="/contact" className="text-[13px] text-white/60 hover:text-white">Accessibility help</Link>
        </div>
      </div>
    </div>
  </footer>
);

// The same footer is used on every page
export const SiteFooter = HomeFooter;
