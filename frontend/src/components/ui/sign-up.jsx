'use client';

// Log in and sign up pages in the editorial style: a large companionship photo
// on one side with an oversized Inter Tight headline, and a plain form on the
// other. The form sits in normal page flow, so it scrolls on short and mobile
// screens; the photo panel only pins to the viewport on large screens.

import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback, Children } from 'react';
import { ArrowRight, ArrowLeft, Mail, Lock, Eye, EyeOff, X, AlertCircle, PartyPopper, Loader, Heart, UserRound, Check } from 'lucide-react';
import { VoallenLogo } from "@/components/voallen-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/App';

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

// --- CONFETTI LOGIC ---
const Confetti = forwardRef((props, ref) => {
  const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props;
  const instanceRef = useRef(null);
  const canvasRef = useCallback((node) => {
    if (node !== null) {
      if (instanceRef.current) return;
      instanceRef.current = confetti.create(node, { ...globalOptions, resize: true });
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    }
  }, [globalOptions]);
  const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options]);
  const api = useMemo(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => { if (!manualstart) fire(); }, [manualstart, fire]);
  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = 'Confetti';

// --- TEXT LOOP ANIMATION COMPONENT ---
function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          clearInterval(timer);
          return current;
        }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);
  const motionVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };
  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants || motionVariants}>
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- GOOGLE ICON ---
const GoogleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-6 h-6">
    <g fillRule="evenodd" fill="none">
      <g fillRule="nonzero" transform="translate(3, 2)">
        <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"></path>
        <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"></path>
        <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"></path>
        <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"></path>
      </g>
    </g>
  </svg>
);

const modalSteps = [
  { message: 'Setting up your account...', icon: <Loader className="w-12 h-12 text-stone-600 animate-spin" /> },
  { message: 'Preparing your dashboard...', icon: <Loader className="w-12 h-12 text-stone-600 animate-spin" /> },
  { message: 'Almost there...', icon: <Loader className="w-12 h-12 text-stone-600 animate-spin" /> },
  { message: 'Welcome to Voallen!', icon: <PartyPopper className="w-12 h-12 text-green-500" /> }
];
const TEXT_LOOP_INTERVAL = 1.5;


// Photo and headline for each page. Both photos are Voallen's own companionship images.
const PANELS = {
  login: {
    image: '/voallen/hero.jpg',
    alt: 'Two women laughing together over coffee at dusk.',
    eyebrow: 'Welcome back',
    title: 'Proof of care, not promises.',
    position: 'object-[50%_50%]',
  },
  signup: {
    image: '/voallen/groceries.jpg',
    alt: 'A young man smiling as he hands a bag of groceries to an older woman.',
    eyebrow: 'Join Voallen',
    title: 'Transparent care for your loved ones.',
    position: 'object-[50%_30%]',
  },
};

// --- USER TYPE SELECTION ---
const USER_TYPES = [
  { id: 'family', icon: Heart, title: 'Family Seeking Care', text: 'Find trusted in-home caregivers' },
  { id: 'agency', icon: UserRound, title: 'Caregiver', text: 'Create your profile & meet families' },
];

const UserTypeSelection = ({ selectedType, onSelect, invalid }) => (
  <div role="radiogroup" aria-label="How you'd like to use Voallen" className="grid sm:grid-cols-2 gap-3 w-full">
    {USER_TYPES.map(({ id, icon: Icon, title, text }) => {
      const selected = selectedType === id;
      return (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onSelect(id)}
          data-testid={`user-type-${id}`}
          className={cn(
            'relative flex flex-col gap-3 p-4 rounded-[20px] border text-left transition-colors',
            selected
              ? 'border-stone-900 ring-1 ring-stone-900'
              : invalid
                ? 'border-[#ff6b4a] hover:border-stone-500'
                : 'border-stone-300 hover:border-stone-500'
          )}
        >
          <span className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            selected ? 'bg-[#1f4fff] text-white' : 'bg-stone-100 text-stone-700'
          )}>
            <Icon className="w-5 h-5" />
          </span>
          <span>
            <span className="block font-semibold text-stone-900 tracking-[-0.01em]">{title}</span>
            <span className="block text-sm text-stone-500 mt-0.5">{text}</span>
          </span>
          {selected && (
            <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-stone-900 text-white dark:text-black flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// --- TEXT FIELD ---
const Field = forwardRef(({ id, label, icon: Icon, error, hint, trailing, ...props }, ref) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-sm font-medium text-stone-800 mb-2">{label}</label>
    <div className={cn(
      'flex items-center gap-3 h-14 px-4 rounded-2xl border bg-transparent transition-colors',
      'focus-within:border-[#1f4fff] focus-within:ring-2 focus-within:ring-[#1f4fff]/20',
      error ? 'border-[#ff6b4a]' : 'border-stone-300'
    )}>
      <Icon className="w-5 h-5 text-stone-400 flex-shrink-0" aria-hidden="true" />
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-note` : undefined}
        className="h-full w-0 flex-grow bg-transparent text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
        {...props}
      />
      {trailing}
    </div>
    {(error || hint) && (
      <p id={`${id}-note`} className={cn('text-sm mt-2', error ? 'text-[#d9432a] dark:text-[#ff8466]' : 'text-stone-500')}>
        {error || hint}
      </p>
    )}
  </div>
));
Field.displayName = 'Field';

// --- PHOTO PANEL ---
const PhotoPanel = ({ panel }) => (
  <aside className="relative w-full h-[38vh] min-h-[240px] max-h-[360px] lg:h-[100dvh] lg:max-h-none lg:sticky lg:top-0 overflow-hidden bg-[#0b0b0c]">
    <img
      src={panel.image}
      alt={panel.alt}
      className={cn('absolute inset-0 w-full h-full object-cover', panel.position)}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" aria-hidden="true" />
    <Link to="/" aria-label="Voallen home" className="absolute top-5 left-5 sm:top-7 sm:left-8 z-10">
      <VoallenLogo size="md" tone="light" />
    </Link>
    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-12 z-10">
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-white/80 mb-3 lg:mb-5">{panel.eyebrow}</p>
      <p className="font-display text-white leading-[0.95] text-[2.25rem] sm:text-5xl lg:text-[clamp(3.5rem,5.6vw,6rem)] max-w-[15ch]">
        {panel.title}
      </p>
    </div>
  </aside>
);

// --- MAIN AUTH COMPONENT ---
export const AuthComponent = ({ mode = 'signup' }) => {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userType, setUserType] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalStatus, setModalStatus] = useState('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const confettiRef = useRef(null);
  const firstFieldRef = useRef(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const isNameValid = name.trim().length >= 2;

  const errors = submitted ? {
    userType: !isLogin && !userType ? "Choose how you'd like to use Voallen" : '',
    name: !isLogin && !isNameValid ? 'Please enter your name' : '',
    email: !isEmailValid ? 'Please enter a valid email address' : '',
    password: !isPasswordValid ? 'Password must be at least 6 characters' : '',
  } : {};

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    // Only focus on larger screens, so phones don't jump straight to the keyboard.
    if (isLogin && window.matchMedia('(min-width: 1024px)').matches) firstFieldRef.current?.focus();
  }, [isLogin]);

  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const particleCount = 50;
      fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
      fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
    }
  };

  const handleLogin = async () => {
    setModalStatus('loading');
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      login(response.data.access_token, response.data.user);
      fireSideCanons();
      setModalStatus('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setModalErrorMessage(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setModalStatus('error');
    }
  };

  const handleSignup = async () => {
    setModalStatus('loading');
    try {
      const response = await axios.post(`${API}/auth/signup`, {
        name: name.trim(),
        email,
        password,
        role: userType === 'agency' ? 'agency' : 'client'
      });
      login(response.data.access_token, response.data.user);
      const loadingStepsCount = modalSteps.length - 1;
      const totalDuration = loadingStepsCount * TEXT_LOOP_INTERVAL * 1000;
      setTimeout(() => {
        fireSideCanons();
        setModalStatus('success');
        setTimeout(() => navigate('/dashboard'), 1500);
      }, totalDuration);
    } catch (err) {
      setModalErrorMessage(err.response?.data?.detail || 'Signup failed. Please try again.');
      setModalStatus('error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalStatus !== 'closed') return;
    setSubmitted(true);
    if (isLogin) {
      if (isEmailValid && isPasswordValid) handleLogin();
    } else if (userType && isNameValid && isEmailValid && isPasswordValid) {
      handleSignup();
    }
  };

  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };

  const panel = PANELS[isLogin ? 'login' : 'signup'];

  return (
    <div className="bg-page min-h-[100dvh] w-full lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />

      {/* Status dialog while the account is checked or created */}
      <AnimatePresence>
        {modalStatus !== 'closed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-live="polite"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="op-card relative p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-2"
            >
              {(modalStatus === 'error' || modalStatus === 'success') && (
                <button onClick={closeModal} aria-label="Close" className="absolute top-3 right-3 p-1 text-stone-400 hover:text-stone-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
              {modalStatus === 'error' && (
                <>
                  <AlertCircle className="w-12 h-12 text-[#ff6b4a]" />
                  <p className="text-lg font-medium text-stone-900 text-center">{modalErrorMessage}</p>
                  <button onClick={closeModal} className="btn-primary rounded-full px-6 py-3 mt-2">Try Again</button>
                </>
              )}
              {modalStatus === 'loading' && (
                <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd={true}>
                  {modalSteps.slice(0, -1).map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-4">
                      {step.icon}
                      <p className="text-lg font-medium text-stone-900">{step.message}</p>
                    </div>
                  ))}
                </TextLoop>
              )}
              {modalStatus === 'success' && (
                <div className="flex flex-col items-center gap-4">
                  {modalSteps[modalSteps.length - 1].icon}
                  <p className="text-lg font-medium text-stone-900">{modalSteps[modalSteps.length - 1].message}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PhotoPanel panel={panel} />

      {/* Form column: normal page flow, so it always scrolls */}
      <main className="flex flex-col min-w-0 lg:min-h-[100dvh]">
        <div className="flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <ThemeToggle className="text-stone-800 hover:bg-stone-100" />
        </div>

        <div className="flex-1 flex items-center px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-[460px] mx-auto"
          >
            <p className="eyebrow mb-4">{isLogin ? 'Log in' : 'Sign up'}</p>
            <h1 className="font-display text-stone-900 text-[2.75rem] sm:text-6xl leading-[0.95]">
              {isLogin ? 'Welcome Back' : 'Join Voallen'}
            </h1>
            <p className="text-stone-500 text-base sm:text-lg mt-4">
              {isLogin ? 'Sign in to your Voallen account' : "Select how you'd like to use Voallen"}
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 sm:mt-10">
              <fieldset disabled={modalStatus !== 'closed'} className="flex flex-col gap-5">
                {isLogin ? (
                  <>
                    <button
                      type="button"
                      className="w-full h-14 rounded-full border border-stone-300 hover:border-stone-900 flex items-center justify-center gap-3 font-medium text-stone-900 transition-colors"
                    >
                      <GoogleIcon /> Continue with Google
                    </button>
                    <div className="flex items-center gap-3" aria-hidden="true">
                      <span className="flex-1 rule" />
                      <span className="text-xs font-semibold tracking-[0.14em] text-stone-400">OR</span>
                      <span className="flex-1 rule" />
                    </div>
                  </>
                ) : (
                  <div>
                    <UserTypeSelection selectedType={userType} onSelect={setUserType} invalid={!!errors.userType} />
                    {errors.userType && <p className="text-sm mt-2 text-[#d9432a] dark:text-[#ff8466]">{errors.userType}</p>}
                  </div>
                )}

                {!isLogin && (
                  <Field
                    id="auth-name"
                    label={userType === 'agency' ? 'Your name' : "What's your name?"}
                    icon={userType === 'agency' ? UserRound : Heart}
                    type="text"
                    autoComplete="name"
                    placeholder={userType === 'agency' ? 'First name and last initial' : 'Full name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    data-testid="auth-name-input"
                  />
                )}

                <Field
                  id="auth-email"
                  ref={firstFieldRef}
                  label="Email address"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  data-testid="auth-email-input"
                />

                <Field
                  id="auth-password"
                  label={isLogin ? 'Password' : 'Create a password'}
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  hint={!isLogin ? 'At least 6 characters' : undefined}
                  data-testid="auth-password-input"
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="p-1 -mr-1 rounded-full text-stone-500 hover:text-stone-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                />

                <button
                  type="submit"
                  data-testid="auth-submit"
                  className={cn(
                    'w-full h-14 rounded-full inline-flex items-center justify-center gap-2 text-base mt-2',
                    isLogin ? 'btn-primary' : 'btn-coral'
                  )}
                >
                  {isLogin ? 'Sign in' : 'Create account'} <ArrowRight className="w-4 h-4" />
                </button>
              </fieldset>
            </form>

            <p className="text-sm text-stone-500 mt-8">
              {isLogin ? (
                <>Don't have an account? <Link to="/signup" className="op-link font-medium">Sign up</Link></>
              ) : (
                <>Already have an account? <Link to="/login" className="op-link font-medium">Sign in</Link></>
              )}
            </p>
            {!isLogin && (
              <p className="text-xs text-stone-400 mt-4 leading-relaxed">
                By creating an account you agree to our <Link to="/terms" className="underline hover:text-stone-700">Terms</Link> and <Link to="/privacy" className="underline hover:text-stone-700">Privacy Policy</Link>.
              </p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AuthComponent;
