import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Camera, ShieldCheck, MapPin, ArrowUpRight, Phone, Mail } from "lucide-react";
import { SiteHeader, PageIntro, usePageTitle } from "@/components/site-chrome";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, CONTACT_EMAIL, QuestionsAnsweredSection } from "@/components/voallen-sections";
import {
  VisitMomentsBand,
  HowVoallenWorks,
  TwoPathsSection,
  SiteFooter,
} from "@/components/voallen-home-extras";

// New pages that round out the site: About, How it works, Privacy, Terms and Not found.
// They reuse the shared header, cream background, display headlines and teal footer.

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { type: "spring", stiffness: 100, damping: 20 },
};

// Page shell: cream background, shared header, content, teal footer.
const SitePage = ({ children, testId }) => (
  <div className="min-h-screen w-full relative" data-testid={testId}>
    <div className="fixed inset-0 z-0 bg-page" />
    <div className="relative z-10">
      <SiteHeader />
      <main className="pt-[64px] sm:pt-[76px]">{children}</main>
      <SiteFooter />
    </div>
  </div>
);

const Container = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-6 ${className}`}>{children}</div>
);

/* ------------------------------------------------------------------ About */

const values = [
  {
    icon: Heart,
    title: "Warmth comes first",
    body: "We match companions on personality and interests, so visits feel like time with a friend, not an appointment.",
    tone: "white",
  },
  {
    icon: Camera,
    title: "Proof, not promises",
    body: "After every visit you get the time, a short note and a few photos. You always know how it went.",
    tone: "apricot",
  },
  {
    icon: ShieldCheck,
    title: "Trust you can check",
    body: "Every companion is background checked before their first visit, and you can talk to us about anyone, anytime.",
    tone: "white",
  },
  {
    icon: MapPin,
    title: "Local to Philadelphia",
    body: "We focus on one city so we can know our companions, our families and the neighborhoods they live in.",
    tone: "green",
  },
];

const toneStyle = {
  white: { className: "op-card" },
  apricot: { className: "bg-mist" },
  green: { className: "bg-mist" },
};

export const AboutPage = () => {
  usePageTitle("About us");
  return (
    <SitePage testId="about-page">
      <Container>
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-end">
          <PageIntro
            eyebrow="About Voallen"
            title="Company for the people you love, with proof it happened."
            lead="Voallen sends friendly, background-checked companions to visit older adults in Philadelphia, and sends their families a short update after every visit."
          />
          <motion.div {...reveal} className="pb-8 sm:pb-12">
            <img
              src="/voallen/window.jpg"
              alt="An older woman and a companion holding hands and looking out of a window together."
              className="w-full h-[280px] sm:h-[380px] object-cover object-[center_30%] rounded-[20px]"
            />
          </motion.div>
        </div>
      </Container>

      {/* Story */}
      <Container className="py-12 sm:py-20">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-8 lg:gap-16">
          <motion.div {...reveal}>
            <p className="eyebrow mb-4">Why we started</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-stone-900 leading-[1]">
              Nobody should have to wonder how Mom's week went.
            </h2>
          </motion.div>
          <motion.div {...reveal} className="space-y-5 text-lg text-stone-600 leading-relaxed">
            <p>
              Many families live far from the people they love, or can't visit as often as they'd like. When someone
              else is helping, it usually happens out of sight, and you're left hoping it went well.
            </p>
            <p>
              We built Voallen so you don't have to hope. A companion spends real time with your loved one: talking,
              walking, playing cards, reading the paper, helping with a video call. Then you hear about it, with a note
              and photos, the same day.
            </p>
            <p>
              It's simple, it's human, and it gives everyone a little more peace of mind.
            </p>
          </motion.div>
        </div>
      </Container>

      {/* Values */}
      <Container className="pb-12 sm:pb-20">
        <motion.h2 {...reveal} className="font-display text-4xl sm:text-5xl lg:text-6xl text-stone-900 tracking-[-0.035em] mb-8">
          What we stand for
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map(({ icon: Icon, title, body, tone }) => {
            const t = toneStyle[tone];
            return (
              <motion.div key={title} {...reveal} className={`rounded-[20px] p-7 flex flex-col ${t.className}`}>
                <Icon className="w-7 h-7 mb-10" strokeWidth={1.5} style={{ color: "#1f4fff" }} />
                <h3 className="text-xl font-semibold mb-2 text-stone-900">
                  {title}
                </h3>
                <p className="text-stone-600">
                  {body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>

      {/* Two ways to be part of it */}
      <Container className="pb-4">
        <div className="rounded-[20px] p-8 sm:p-12 grid md:grid-cols-2 gap-8 items-center bg-mist">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.98] mb-4 text-stone-900">
              Want to be one of our companions?
            </h2>
            <p className="text-lg text-stone-600">
              We're always looking for kind, patient people in Philadelphia who enjoy spending time with older adults.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:justify-end gap-3">
            <Link
              to="/caregivers"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg"
            >
              See caregiver jobs <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Container>
    </SitePage>
  );
};

/* ------------------------------------------------------------ How it works */

export const HowItWorksPage = () => {
  usePageTitle("How it works");
  return (
    <SitePage testId="how-it-works-page">
      <Container>
        <PageIntro
          eyebrow="How Voallen works"
          title="From a first call to a familiar face at the door."
          lead="Here's what happens when you book companionship visits with Voallen, and what you'll see after each one."
        />
      </Container>
      <Container>
        <HowVoallenWorks />
        <VisitMomentsBand />
        <TwoPathsSection />
        <QuestionsAnsweredSection />
      </Container>
    </SitePage>
  );
};

/* -------------------------------------------------------------- Legal pages */

const LegalSection = ({ title, children }) => (
  <section className="py-6 border-t border-stone-200 first:border-t-0">
    <h2 className="text-xl sm:text-2xl font-semibold text-stone-800 mb-3">{title}</h2>
    <div className="space-y-3 text-stone-600 leading-relaxed">{children}</div>
  </section>
);

const LegalContact = () => (
  <p>
    Questions? Call <a href={CONTACT_PHONE_HREF} className="underline underline-offset-4">{CONTACT_PHONE}</a> or email{" "}
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 break-all">{CONTACT_EMAIL}</a>.
  </p>
);

const LegalPage = ({ testId, eyebrow, title, lead, children }) => (
  <SitePage testId={testId}>
    <div className="max-w-3xl mx-auto px-6 pb-16 sm:pb-24">
      <PageIntro eyebrow={eyebrow} title={title} lead={lead} />
      <div className="op-card rounded-[20px] px-6 sm:px-10 py-4 sm:py-6">{children}</div>
    </div>
  </SitePage>
);

export const PrivacyPage = () => {
  usePageTitle("Privacy");
  return (
    <LegalPage
      testId="privacy-page"
      eyebrow="Privacy"
      title="Your privacy"
      lead="A plain-language summary of what we collect, why, and the choices you have. Last updated November 2026."
    >
      <LegalSection title="What we collect">
        <p>
          When you create an account or book a visit, we collect your name, email and phone number, and the details you
          share about your loved one, such as their name, age, address and what kind of company they enjoy.
        </p>
        <p>
          After a visit, we keep the visit update: the time, the companion's note and any photos. If you contact us, we
          keep your message so we can reply.
        </p>
      </LegalSection>
      <LegalSection title="How we use it">
        <p>To arrange and run visits, send you visit updates, answer your questions and keep the site safe and working.</p>
      </LegalSection>
      <LegalSection title="Who we share it with">
        <p>
          Only with the people who need it to provide your visits, such as the caregiver you book, and with
          services that help us run the site, like hosting and email delivery. We don't sell your information.
        </p>
        <p>Visit photos and notes are shared only with the family account that booked the visit.</p>
      </LegalSection>
      <LegalSection title="Your choices">
        <p>
          You can ask us to see, correct or delete your information at any time. You can also ask us not to take photos
          during visits.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <LegalContact />
      </LegalSection>
    </LegalPage>
  );
};

export const TermsPage = () => {
  usePageTitle("Terms");
  return (
    <LegalPage
      testId="terms-page"
      eyebrow="Terms"
      title="Terms of use"
      lead="The basics of using Voallen, in plain language. Last updated November 2026."
    >
      <LegalSection title="What Voallen is">
        <p>
          Voallen helps families in Philadelphia find non-medical caregivers and companionship visits for older adults, and shares
          updates after each visit.
        </p>
      </LegalSection>
      <LegalSection title="Not for emergencies">
        <p>
          Voallen is not an emergency or medical service. If someone needs urgent help, call 911.
        </p>
      </LegalSection>
      <LegalSection title="Your account">
        <p>
          Please give accurate information and keep your login private. You're responsible for activity on your account.
        </p>
      </LegalSection>
      <LegalSection title="Bookings and changes">
        <p>
          When you request a visit or consultation, the caregiver confirms it. If you need to change or cancel,
          let us or your caregiver know as early as you can.
        </p>
      </LegalSection>
      <LegalSection title="Respectful use">
        <p>
          Treat caregivers, families and our team with respect, and don't misuse the site or post anything harmful or
          misleading.
        </p>
      </LegalSection>
      <LegalSection title="Changes">
        <p>We may update these terms. If we make a big change, we'll let account holders know.</p>
      </LegalSection>
      <LegalSection title="Contact">
        <LegalContact />
      </LegalSection>
    </LegalPage>
  );
};

/* ---------------------------------------------------------------- Not found */

export const NotFoundPage = () => {
  usePageTitle("Page not found");
  return (
    <SitePage testId="not-found-page">
      <div className="max-w-3xl mx-auto px-6 pb-20 sm:pb-28 text-center">
        <PageIntro
          center
          eyebrow="404"
          title="This page wandered off."
          lead="The link may be old or mistyped. Here are a few good places to go instead."
        />
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/" className="btn-primary inline-flex items-center justify-center px-7 py-4 rounded-full">
            Back to home
          </Link>
          <Link to="/visits" className="btn-outline inline-flex items-center justify-center px-7 py-4 rounded-full font-semibold">
            Companionship visits
          </Link>
          <a
            href={CONTACT_PHONE_HREF}
            className="btn-outline inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold"
          >
            <Phone className="w-5 h-5" /> Call us
          </a>
        </div>
        <p className="mt-8 text-sm text-stone-500 inline-flex items-center gap-2">
          <Mail className="w-4 h-4" style={{ color: "#1f4fff" }} /> {CONTACT_EMAIL}
        </p>
      </div>
    </SitePage>
  );
};
