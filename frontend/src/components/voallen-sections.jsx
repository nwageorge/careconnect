import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Phone, Mail, Plus, Minus } from "lucide-react";

// Home page sections adapted from the Voallen companionship website:
// Our Services, Thoughtful visits, Simple ways to stay connected, and Your questions answered.
// They use the app's own stone palette, rounded cards and type so they sit with the rest of the build.

export const CONTACT_PHONE = "(267) 710-6454";
export const CONTACT_PHONE_HREF = "tel:+12677106454";
export const CONTACT_EMAIL = "info@voallenconcierge.com";

const Eyebrow = ({ children }) => (
  <p className="eyebrow mb-4">{children}</p>
);

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { type: "spring", stiffness: 100, damping: 20 },
};

/* ---------------------------------------------------------------- Our Services */

const services = [
  {
    icon: "/voallen/service-icon-4.png",
    label: "Birthday & Special Occasion Visits",
    title: "Make room for special moments.",
    description: "Companionship visits for birthdays and special occasions, so there is someone to share the moment.",
    image: "/voallen/celebration-gathering.jpg",
    alt: "Family and friends laughing together at an outdoor gathering.",
    note: "Birthday & special occasion visits",
  },
  {
    icon: "/voallen/service-icon-0.png",
    label: "Friendly Companionship Visits",
    title: "A friendly face. Meaningful company.",
    description: "Personalized companionship visits for your loved ones in nursing homes, assisted living communities, and private residences.",
    image: "/voallen/groceries.jpg",
    alt: "A young man and an older woman smiling at each other as he hands her a grocery bag.",
    position: "center 25%",
    note: "Friendly companionship",
  },
  {
    icon: "/voallen/service-icon-1.png",
    label: "Hospice Companionship Visits",
    title: "A calm, caring presence.",
    description: "Nonmedical companionship visits for loved ones receiving hospice care, with time for gentle conversation and a reassuring presence.",
    image: "/voallen/window.jpg",
    alt: "An older woman holding hands with a companion while looking out a window.",
    position: "center 35%",
    note: "Hospice companionship",
  },
  {
    icon: "/voallen/service-icon-2.png",
    label: "Reading, Games & Social Engagement",
    title: "Time for shared interests.",
    description: "Reading, games, and social engagement offer simple, personal ways to spend meaningful time together.",
    image: "/voallen/photo-album.jpg",
    alt: "An older woman and a companion looking through a photo album by the window.",
    note: "Reading, games & social time",
  },
  {
    icon: "/voallen/service-icon-3.png",
    label: "Family Video Call Assistance",
    title: "Familiar faces, a little closer.",
    description: "Assistance with family video calls helps your loved one stay connected with family and friends.",
    image: "/voallen/service-calls.jpg",
    alt: "An older woman smiling while using a phone outdoors.",
    note: "Family video call assistance",
  },
  {
    icon: "/voallen/service-icon-5.png",
    label: "Visit Updates to Authorized Family Members",
    title: "Connection for them. Reassurance for you.",
    description: "Visit updates to authorized family members help you stay connected with your loved one’s companionship visits.",
    image: "/voallen/breakfast.jpg",
    alt: "An older woman and a younger woman sharing breakfast at the kitchen table.",
    position: "center 40%",
    note: "Updates for authorized family",
  },
];

export const OurServicesSection = () => {
  const [active, setActive] = useState(0);
  const service = services[active];

  return (
    <section id="our-services" className="pt-10 sm:pt-14 pb-16 sm:pb-24 scroll-mt-24" data-testid="our-services-section">
      {/* Intro sits top left, right under the hero */}
      <motion.div {...reveal} className="max-w-3xl mb-8 sm:mb-10">
        <h2 className="font-display text-4xl sm:text-5xl text-stone-900 leading-[0.98] mb-3">Get to know our services</h2>
        <p className="text-lg sm:text-xl text-stone-500">
          Warm, personal company for the people you love, at home or wherever they live.
        </p>
      </motion.div>

      {/* Service picker: swipes sideways on phones, six across on desktop */}
      <div
        role="tablist"
        aria-label="Our services"
        className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-6 lg:scroll-px-0 pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((s, i) => {
          const selected = i === active;
          return (
            <button
              key={s.label}
              role="tab"
              id={`service-tab-${i}`}
              aria-selected={selected}
              aria-controls="service-panel"
              onClick={() => setActive(i)}
              className={`snap-start shrink-0 w-40 lg:w-auto flex flex-col items-center text-center gap-3 rounded-3xl px-3 pt-4 pb-5 transition-all duration-500 ${
                selected
                  ? "bg-joy-hero ring-2 ring-[#FF8A8A] shadow-[0_12px_28px_rgba(255,105,105,0.18)]"
                  : "glass-card hover:-translate-y-1"
              }`}
              data-testid={`service-tab-${i}`}
            >
              <img src={s.icon} alt="" className="w-20 h-20 object-contain" loading="lazy" />
              <span className={`text-sm leading-snug ${selected ? "font-semibold text-stone-900" : "font-medium text-stone-600"}`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected service */}
      <div
        id="service-panel"
        role="tabpanel"
        aria-labelledby={`service-tab-${active}`}
        className="mt-8 sm:mt-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center"
      >
        <div className="relative rounded-3xl overflow-hidden bg-stone-100 aspect-[4/3] shadow-lg">
          <AnimatePresence mode="wait">
            <motion.img
              key={service.image}
              src={service.image}
              alt={service.alt}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: service.position || "center" }}
            />
          </AnimatePresence>
          <span className="absolute left-4 bottom-4 px-4 py-2 rounded-full bg-white/95 text-sm font-medium text-stone-800 shadow-sm">
            {service.note}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={service.title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Eyebrow>{service.label}</Eyebrow>
            <h3 className="font-display text-4xl sm:text-5xl text-stone-900 leading-[0.98] mb-4">{service.title}</h3>
            <p className="text-lg text-stone-600 leading-relaxed mb-8">{service.description}</p>
            <Link
              to="/visits"
              data-testid="ask-about-visit"
              className="btn-joy rounded-full inline-block px-8 py-4"
            >
              Ask about a visit
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* --------------------------------------------- Thoughtful visits section */

export const ThoughtfulVisitsSection = () => (
  <section className="py-16 sm:py-24" data-testid="thoughtful-visits-section">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <motion.div {...reveal}>
        <Eyebrow>A trusted, professional approach</Eyebrow>
        <h2 className="font-display text-5xl sm:text-6xl text-stone-900 leading-[0.95] mb-6">
          Thoughtful visits.
          <br />
          Personal connection.
        </h2>
        <p className="text-xl text-stone-600 leading-relaxed mb-8 max-w-md">
          Founded by a healthcare administrator with experience in senior living and personal care services.
        </p>
        <a
          href="#our-services"
          className="btn-joy rounded-full inline-block px-8 py-4"
        >
          Explore our services
        </a>
      </motion.div>

      <motion.figure {...reveal} className="flex flex-col">
        <div className="rounded-3xl overflow-hidden bg-stone-100 aspect-[3/4] max-h-[640px] shadow-lg">
          <img
            src="/voallen/stairs.jpg"
            alt="A young man walking an older woman up the stairs, carrying her groceries."
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <figcaption className="mt-4 text-sm text-stone-500 text-center">A helping hand, at their pace.</figcaption>
      </motion.figure>
    </div>
  </section>
);

/* ------------------------------------------ Simple ways to stay connected */

const connectionItems = [
  {
    title: "Companionship",
    body: "Personalized visits and meaningful time together.",
    image: "/voallen/breakfast.jpg",
    alt: "An older woman and a younger woman sharing breakfast at the kitchen table.",
  },
  {
    title: "Shared activities",
    body: "Reading, games, and social engagement shaped around familiar interests.",
    image: "/voallen/breakfast.jpg",
    alt: "An older woman and a younger woman sharing breakfast at the kitchen table.",
  },
  {
    title: "Family video calls",
    body: "Assistance connecting your loved one with family through a video call.",
    image: "/voallen/window.jpg",
    alt: "An older woman holding hands with a companion while looking out a window.",
  },
  {
    title: "Family updates",
    body: "Visit updates to authorized family members help you stay connected.",
    image: "/voallen/window.jpg",
    alt: "An older woman holding hands with a companion while looking out a window.",
  },
];

export const StayConnectedSection = () => {
  const [open, setOpen] = useState(0);
  const item = connectionItems[open];

  return (
    <section id="stay-connected" className="py-16 sm:py-24 scroll-mt-24" data-testid="stay-connected-section">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...reveal} className="order-2 lg:order-1 relative rounded-3xl overflow-hidden bg-stone-100 aspect-[4/5] max-h-[620px] shadow-lg">
          <AnimatePresence initial={false}>
            <motion.img
              key={item.image}
              src={item.image}
              alt={item.alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </AnimatePresence>
          <span className="absolute left-4 bottom-4 px-4 py-2 rounded-full bg-white/95 text-sm font-medium text-stone-800 shadow-sm">
            {item.title}
          </span>
        </motion.div>

        <motion.div {...reveal} className="order-1 lg:order-2">
          <Eyebrow>Companionship, with family connection</Eyebrow>
          <h2 className="font-display text-5xl sm:text-6xl text-stone-900 leading-[0.95] mb-4">
            Simple ways to
            <br />
            stay connected.
          </h2>
          <p className="text-lg sm:text-xl text-stone-500 mb-8">
            Friendly visits. Shared interests.
            <br />
            Thoughtful updates for authorized family.
          </p>
          <div className="border-t border-stone-200">
            {connectionItems.map((item, i) => {
              const isOpen = i === open;
              return (
                <div key={item.title} className="border-b border-stone-200">
                  <button
                    onClick={() => setOpen(i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between py-5 text-left"
                    data-testid={`stay-connected-${i}`}
                  >
                    <span className={`text-lg ${isOpen ? "font-semibold text-stone-900" : "font-medium text-stone-700"}`}>{item.title}</span>
                    {isOpen ? <Minus className="w-5 h-5 text-stone-700" /> : <Plus className="w-5 h-5 text-stone-500" />}
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
                        <p className="pb-5 text-stone-600 leading-relaxed">{item.body}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ------------------------------------------------ Your questions, answered */

const questionGroups = [
  {
    title: "About our visits",
    items: [
      { q: "What is Voallen Elderly Concierge?", a: "Voallen provides personalized, nonmedical companionship visits for your loved ones." },
      { q: "Who are the visits for?", a: "Our service is for loved ones in nursing homes, assisted living communities, and private residences." },
      { q: "Does Voallen provide medical care?", a: "Voallen Elderly Concierge provides nonmedical companionship services. Contact us to discuss your loved one’s companionship needs." },
    ],
  },
  {
    title: "Our services & family connection",
    items: [
      { q: "What services are offered?", a: "Friendly companionship visits; hospice companionship visits; reading, games and social engagement; family video call assistance; birthday and special occasion visits; and visit updates to authorized family members." },
      { q: "Can you assist with family video calls?", a: "Family Video Call Assistance is one of our services, helping loved ones stay connected." },
      { q: "Can family members receive updates?", a: "Visit updates are available to authorized family members. Please contact Voallen to discuss who may receive updates." },
    ],
  },
  {
    title: "Availability & service area",
    items: [
      { q: "Where will Voallen offer visits?", a: "Our service area is Bensalem, PA and surrounding communities." },
      { q: "Is Voallen open yet?", a: "Voallen is opening soon and is now welcoming inquiries. Contact us to learn more or discuss scheduling a visit." },
    ],
  },
  {
    title: "Getting in touch",
    items: [
      {
        q: "How can I learn more or discuss a visit?",
        a: (
          <>
            Call <a href={CONTACT_PHONE_HREF} className="font-semibold text-stone-800 underline underline-offset-2">{CONTACT_PHONE}</a> or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-stone-800 underline underline-offset-2">{CONTACT_EMAIL}</a>.
          </>
        ),
      },
      { q: "What is the background behind Voallen?", a: "Voallen was founded by a healthcare administrator with experience in senior living and personal care services." },
    ],
  },
];

export const QuestionsAnsweredSection = () => {
  const [open, setOpen] = useState(0);

  return (
    <section id="your-questions" className="py-16 sm:py-24 scroll-mt-24" data-testid="questions-section">
      <div className="rounded-3xl bg-stone-50 border border-stone-100 px-6 py-10 sm:p-12 lg:p-16 grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16">
        <motion.div {...reveal}>
          <Eyebrow>A little clarity, before you reach out</Eyebrow>
          <h2 className="font-display text-5xl sm:text-6xl text-stone-900 leading-[0.95] mb-4">
            Your questions,
            <br />
            answered.
          </h2>
          <p className="text-lg sm:text-xl text-stone-500 mb-8">
            Learn about our visits
            <br />
            and how to get in touch.
          </p>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
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
        </motion.div>

        <div className="space-y-4">
          {questionGroups.map((group, i) => {
            const isOpen = i === open;
            return (
              <div key={group.title} className="glass-card rounded-3xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-stone-50 transition"
                  data-testid={`questions-group-${i}`}
                >
                  <span className="text-lg font-semibold text-stone-800 pr-4">{group.title}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-stone-500" />
                  </motion.span>
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
                      <dl className="px-6 pb-6 space-y-5">
                        {group.items.map((item) => (
                          <div key={item.q}>
                            <dt className="font-semibold text-stone-800 mb-1">{item.q}</dt>
                            <dd className="text-stone-600 leading-relaxed">{item.a}</dd>
                          </div>
                        ))}
                      </dl>
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

/* ------------------------------------------------ Caregiver recruiting */

const caregiverSteps = [
  {
    title: "Create your profile",
    body: "Tell us about your experience, the hours you can work and the neighborhoods you can reach. It only takes a few minutes.",
    image: "/voallen/photo-album.jpg",
    alt: "An older woman and a companion looking through a photo album by the window.",
    position: "center 40%",
  },
  {
    title: "Get booked by families",
    body: "Once your profile is approved, Philadelphia families can find you, read your reviews and book visits that fit your life.",
    image: "/voallen/window.jpg",
    alt: "An older woman holding hands with a companion while looking out a window.",
    position: "center 35%",
  },
  {
    title: "Start caring and get paid",
    body: "Visit seniors close to home, keep a schedule that works for you and get paid reliably for every visit.",
    image: "/voallen/stairs.jpg",
    alt: "A young man walking an older woman up the stairs, carrying her groceries.",
    position: "center 30%",
  },
];

// Full-width cream band, three numbered steps with round photos (for caregivers looking for work)
export const CaregiverJobsSection = () => (
  <section
    id="work-with-us"
    className="bg-joy-hero py-16 sm:py-24 scroll-mt-24"
    data-testid="caregiver-jobs-section"
  >
    <div className="max-w-7xl mx-auto px-6">
      <motion.div {...reveal} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <Eyebrow>For caregivers</Eyebrow>
        <h2 className="font-display text-4xl sm:text-6xl text-stone-900 leading-[0.95] mb-4">
          Find caregiving work that feels like family
        </h2>
        <p className="text-lg sm:text-xl text-stone-500">
          Put your kindness to work. Join Voallen and get matched with seniors who need a friendly face nearby.
        </p>
      </motion.div>

      <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
        {caregiverSteps.map((step, i) => (
          <motion.li
            key={step.title}
            {...reveal}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-7">
              {/* Soft offset circle behind the photo */}
              <span
                aria-hidden="true"
                className={`absolute inset-0 rounded-full bg-[#e6d9c7] dark:bg-stone-200 ${
                  i === 1 ? "-translate-x-3 -translate-y-2" : "translate-x-3 translate-y-2"
                }`}
              />
              <img
                src={step.image}
                alt={step.alt}
                className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full object-cover shadow-lg"
                style={{ objectPosition: step.position }}
                loading="lazy"
              />
              <span className="btn-joy rounded-full absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md">
                {i + 1}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-stone-800 mb-2">{step.title}</h3>
            <p className="text-lg text-stone-600 leading-relaxed max-w-sm">{step.body}</p>
          </motion.li>
        ))}
      </ol>

      <motion.div {...reveal} className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/caregivers"
          className="btn-joy rounded-full inline-flex items-center justify-center px-8 py-4 rounded-full text-lg"
          data-testid="caregiver-apply-btn"
        >
          Learn more and apply
        </Link>
        <a
          href={CONTACT_PHONE_HREF}
          className="btn-glass inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold"
        >
          Questions? Call {CONTACT_PHONE}
        </a>
      </motion.div>
    </div>
  </section>
);
