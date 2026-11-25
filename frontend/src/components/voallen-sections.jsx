import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Phone, Mail, Plus, Minus, Signal, BatteryFull } from "lucide-react";

// Home page sections adapted from the Voallen companionship website:
// Our Services, Thoughtful visits, Simple ways to stay connected, and Your questions answered.
// They use the app's own stone palette, rounded cards and type so they sit with the rest of the build.

const CONTACT_PHONE = "(267) 710-6454";
const CONTACT_PHONE_HREF = "tel:+12677106454";
const CONTACT_EMAIL = "info@voallenconcierge.com";

const Eyebrow = ({ children }) => (
  <p className="text-sm font-medium text-stone-500 mb-3">{children}</p>
);

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6 },
};

/* ---------------------------------------------------------------- Our Services */

const services = [
  {
    label: "Friendly Companionship Visits",
    title: "A friendly face. Meaningful company.",
    description: "Personalized companionship visits for your loved ones in nursing homes, assisted living communities, and private residences.",
    image: "/voallen/service-companionship.jpg",
    alt: "An older woman seated comfortably with a companion nearby.",
    note: "Friendly companionship",
  },
  {
    label: "Hospice Companionship Visits",
    title: "A calm, caring presence.",
    description: "Nonmedical companionship visits for loved ones receiving hospice care, with time for gentle conversation and a reassuring presence.",
    image: "/voallen/service-presence.jpg",
    alt: "A close-up of older adults gently holding hands.",
    note: "Hospice companionship",
  },
  {
    label: "Reading, Games & Social Engagement",
    title: "Time for shared interests.",
    description: "Reading, games, and social engagement offer simple, personal ways to spend meaningful time together.",
    image: "/voallen/service-activities.jpg",
    alt: "Older adults enjoying a lighthearted game together outdoors.",
    note: "Reading, games & social time",
  },
  {
    label: "Family Video Call Assistance",
    title: "Familiar faces, a little closer.",
    description: "Assistance with family video calls helps your loved one stay connected with family and friends.",
    image: "/voallen/service-calls.jpg",
    alt: "An older woman smiling while using a phone outdoors.",
    note: "Family video call assistance",
  },
  {
    label: "Birthday & Special Occasion Visits",
    title: "Make room for special moments.",
    description: "Companionship visits for birthdays and special occasions, so there is someone to share the moment.",
    image: "/voallen/service-celebration.jpg",
    alt: "An older woman holding a birthday cake at an indoor celebration.",
    note: "Birthday & special occasion visits",
  },
  {
    label: "Visit Updates to Authorized Family Members",
    title: "Connection for them. Reassurance for you.",
    description: "Visit updates to authorized family members help you stay connected with your loved one’s companionship visits.",
    image: "/voallen/service-updates.jpg",
    alt: "An older woman using a tablet while seated comfortably at home.",
    note: "Updates for authorized family",
  },
];

export const OurServicesSection = () => {
  const [active, setActive] = useState(0);
  const service = services[active];

  return (
    <section id="our-services" className="py-16 sm:py-24 scroll-mt-24" data-testid="our-services-section">
      <motion.div {...reveal} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <Eyebrow>Personalized companionship visits</Eyebrow>
        <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight mb-4">Our Services</h2>
        <p className="text-lg sm:text-xl text-stone-500">
          Reduce loneliness. Stay connected.
          <br />
          Gain peace of mind.
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
              className={`snap-start shrink-0 w-40 lg:w-auto flex flex-col items-center text-center gap-3 rounded-2xl border px-3 pt-4 pb-5 transition-all ${
                selected
                  ? "bg-stone-50 border-stone-800 shadow-sm"
                  : "bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50"
              }`}
              data-testid={`service-tab-${i}`}
            >
              <img src={`/voallen/service-icon-${i}.png`} alt="" className="w-20 h-20 object-contain" loading="lazy" />
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
            <h3 className="text-3xl sm:text-4xl font-bold text-stone-800 leading-tight mb-4">{service.title}</h3>
            <p className="text-lg text-stone-600 leading-relaxed mb-8">{service.description}</p>
            <Link
              to="/contact"
              className="inline-block px-8 py-4 bg-stone-800 text-white rounded-2xl font-semibold hover:bg-stone-700 transition-all"
            >
              Ask about a visit
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ------------------------------------------------------- Phone mockup (shared) */

const PhoneMockup = ({ children, className = "" }) => (
  <div
    className={`relative w-[260px] sm:w-[290px] rounded-[2.75rem] border-[10px] border-stone-800 bg-white shadow-2xl overflow-hidden ${className}`}
    aria-hidden="true"
  >
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-stone-800" />
    <div className="flex items-center justify-between px-6 pt-3 pb-2 text-xs font-semibold text-stone-800">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <Signal className="w-3.5 h-3.5" />
        <BatteryFull className="w-4 h-4" />
      </span>
    </div>
    <div className="px-6 pb-8 pt-3">
      <div className="pb-3 mb-4 border-b border-stone-200">
        <p className="text-2xl font-bold text-stone-800 leading-none">Voallen</p>
        <p className="text-[10px] font-semibold tracking-widest text-stone-500 mt-1">ELDERLY CONCIERGE</p>
      </div>
      {children}
    </div>
  </div>
);

/* --------------------------------------------- Thoughtful visits section */

export const ThoughtfulVisitsSection = () => (
  <section className="py-16 sm:py-24" data-testid="thoughtful-visits-section">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <motion.div {...reveal}>
        <Eyebrow>A trusted, professional approach</Eyebrow>
        <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight mb-6">
          Thoughtful visits.
          <br />
          Personal connection.
        </h2>
        <p className="text-xl text-stone-600 leading-relaxed mb-8 max-w-md">
          Founded by a healthcare administrator with experience in senior living and personal care services.
        </p>
        <a
          href="#our-services"
          className="inline-block px-8 py-4 bg-stone-800 text-white rounded-2xl font-semibold hover:bg-stone-700 transition-all"
        >
          Explore our services
        </a>
      </motion.div>

      <motion.figure {...reveal} className="flex flex-col items-center">
        <div className="w-full rounded-3xl bg-stone-100 py-10 flex justify-center">
          <PhoneMockup>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">Example visit overview</p>
            <p className="text-2xl font-bold text-stone-800 leading-tight mb-3">
              Companionship. Connection. Peace of mind.
            </p>
            <p className="text-sm text-stone-500 mb-5">Personalized companionship visits for your loved ones.</p>
            <div className="w-full py-3 rounded-xl bg-stone-800 text-white text-center text-sm font-semibold mb-4">Contact Voallen</div>
            <p className="text-sm font-semibold text-stone-800">{CONTACT_PHONE}</p>
            <p className="text-xs text-stone-500">{CONTACT_EMAIL}</p>
          </PhoneMockup>
        </div>
        <figcaption className="mt-4 text-sm text-stone-500">Illustrative example · Nonmedical companionship</figcaption>
      </motion.figure>
    </div>
  </section>
);

/* ------------------------------------------ Simple ways to stay connected */

const connectionItems = [
  {
    title: "Companionship",
    body: "Personalized visits and meaningful time together.",
    screen: {
      label: "Example visit update",
      heading: "Good company. Meaningful time.",
      intro: "A friendly visit can include:",
      list: ["Conversation", "Reading together", "Games & social time"],
      footer: "Visit updates for authorized family members.",
    },
  },
  {
    title: "Shared activities",
    body: "Reading, games, and social engagement shaped around familiar interests.",
    screen: {
      label: "Today’s visit",
      heading: "Time for shared interests.",
      intro: "Planned around what they enjoy:",
      list: ["A favorite book", "Cards & board games", "Stories and conversation"],
      footer: "Every visit is personal.",
    },
  },
  {
    title: "Family video calls",
    body: "Assistance connecting your loved one with family through a video call.",
    screen: {
      label: "Family video call",
      heading: "A familiar voice, a little closer.",
      intro: "We help with:",
      list: ["Setting up the call", "Holding the device", "Staying for the chat"],
      footer: "Connect with family and friends.",
    },
  },
  {
    title: "Family updates",
    body: "Visit updates to authorized family members help you stay connected.",
    screen: {
      label: "Message to family",
      heading: "Today’s visit went well.",
      intro: "Your loved one enjoyed:",
      list: ["A walk and a chat", "Reading the paper", "Looking at old photos"],
      footer: "Shared with authorized family only.",
    },
  },
];

export const StayConnectedSection = () => {
  const [open, setOpen] = useState(0);
  const screen = connectionItems[open].screen;

  return (
    <section id="stay-connected" className="py-16 sm:py-24 scroll-mt-24" data-testid="stay-connected-section">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...reveal} className="order-2 lg:order-1 rounded-3xl bg-stone-100 pt-10 flex justify-center overflow-hidden h-[460px] sm:h-[520px]">
          <PhoneMockup>
            <AnimatePresence mode="wait">
              <motion.div
                key={open}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">{screen.label}</p>
                <p className="text-2xl font-bold text-stone-800 leading-tight mb-4">{screen.heading}</p>
                <p className="text-sm text-stone-600 mb-3">{screen.intro}</p>
                <ul className="space-y-2 mb-5">
                  {screen.list.map((item) => (
                    <li key={item} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-stone-100 text-sm font-medium text-stone-800">
                      <span className="w-2 h-2 rounded-full bg-stone-800" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-stone-500">{screen.footer}</p>
              </motion.div>
            </AnimatePresence>
          </PhoneMockup>
        </motion.div>

        <motion.div {...reveal} className="order-1 lg:order-2">
          <Eyebrow>Companionship, with family connection</Eyebrow>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight mb-4">
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
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight mb-4">
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
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-800 text-white rounded-2xl font-semibold hover:bg-stone-700 transition-all"
            >
              <Phone className="w-5 h-5" /> Call {CONTACT_PHONE}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border border-stone-200 text-stone-800 rounded-2xl font-semibold hover:bg-stone-100 transition-all"
            >
              <Mail className="w-5 h-5" /> Email us
            </a>
          </div>
        </motion.div>

        <div className="space-y-4">
          {questionGroups.map((group, i) => {
            const isOpen = i === open;
            return (
              <div key={group.title} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
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
