import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Star, MapPin, Clock, Shield, Phone, Mail, ChevronLeft, ChevronRight, Menu, X, Search, Calendar, User, LogOut, Users, CheckCircle, Award, Sparkles, Building2, Image, MessageSquare, BadgeCheck, Camera, Activity, Download } from "lucide-react";
import React from "react";
import { HeroSection as NewHeroSection } from "@/components/ui/hero-section";
import { TestimonialsSplit } from "@/components/ui/split-testimonial";
import { AuthComponent } from "@/components/ui/sign-up";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminDashboard, AdminAgencyDetail } from "@/components/admin-dashboard";
import { VisitHero, VisitBenefits, VisitStatBanner, VisitFAQ } from "@/components/visit-page";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, CONTACT_EMAIL, OurServicesSection, ThoughtfulVisitsSection, StayConnectedSection, QuestionsAnsweredSection, CaregiverJobsSection } from "@/components/voallen-sections";
import { SiteHeader, ScrollToTop, usePageTitle, PageIntro } from "@/components/site-chrome";
import { AboutPage, HowItWorksPage, PrivacyPage, TermsPage, NotFoundPage } from "@/components/site-pages";
import { VisitMomentsBand, HowVoallenWorks, TwoPathsSection, HomeFooter, SiteFooter } from "@/components/voallen-home-extras";
import { CaregiverHero, CaregiverWaysToHelp, CaregiverReasons, CaregiverSteps, CaregiverSafety, CaregiverFAQ, CaregiverCTA } from "@/components/caregiver-page";

// Empty means the API is served from the same site as the app (production build)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  // Read the saved session synchronously so pages don't redirect to login on a refresh
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      return token && savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const loading = false;

  // Refresh the saved user from the server (picks up role or admin changes, drops expired sessions)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      });
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Wishlist Context
const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleWishlist = (agencyId) => {
    setWishlist(prev => {
      const newList = prev.includes(agencyId)
        ? prev.filter(id => id !== agencyId)
        : [...prev, agencyId];
      localStorage.setItem("wishlist", JSON.stringify(newList));
      return newList;
    });
  };

  const isWishlisted = (agencyId) => wishlist.includes(agencyId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Page background: warm pastel gradient (OnePermit-style)
const PageBackground = ({ children, className = "", tone = "cream" }) => {
  return (
    <div className={`min-h-screen w-full relative ${className}`}>
      {/* Page background: the soft blush-to-lavender wash used on every page */}
      <div className="fixed inset-0 z-0 bg-page" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Navigation: the shared site header (same as the home page)
const Navigation = () => <SiteHeader />;

// Agency Card Component - Exact Airbnb Style
import { GlareCard } from "@/components/ui/glare-card";

const AgencyCard = ({ agency, index }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/agencies/${agency.id}`)}
      data-testid={`agency-card-${agency.id}`}
    >
      {/* Image Container - Airbnb 4:3 aspect ratio with rounded corners */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
        <img
          src={agency.image_url}
          alt={agency.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        
        {/* Guest Favorite Badge - Top Left (Airbnb style) */}
        {agency.is_verified && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-stone-800 shadow-sm flex items-center gap-1">
            <Award className="w-3 h-3" />
            Top rated
          </div>
        )}
        
        {/* Wishlist Heart - Top Right (Airbnb style) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(agency.id);
          }}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center z-10 hover:scale-110 transition-transform"
          data-testid={`wishlist-btn-${agency.id}`}
        >
          <Heart
            className={`w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-colors ${
              isWishlisted(agency.id) 
                ? "fill-red-500 text-red-500" 
                : "fill-black/40 text-white stroke-[1.5]"
            }`}
          />
        </button>

        {/* Photo dots, only when there is more than one photo */}
        {agency.gallery_images?.length > 0 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {[agency.image_url, ...agency.gallery_images].slice(0, 5).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>
      
      {/* Content - Exact Airbnb typography */}
      <div className="space-y-0.5 px-0.5">
        {/* Title Row with Rating */}
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-medium text-[15px] text-stone-900 leading-tight line-clamp-1">
            {agency.name}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-3 h-3 fill-stone-900 text-stone-900" />
            <span className="text-[13px] text-stone-900">{agency.rating}</span>
          </div>
        </div>
        
        {/* Location - Gray text */}
        <p className="text-[14px] text-stone-500 leading-tight line-clamp-1">{(agency.location || agency.city || "").replace(/, PA$/, "")}</p>
        
        {/* Specialty - Gray text */}
        <p className="text-[14px] text-stone-500 leading-tight">
          {agency.specialties?.[0]}
        </p>
        
        {/* Price - Bold with unit */}
        <p className="text-[15px] text-stone-900 pt-0.5">
          <span className="font-semibold">${agency.price_per_hour}</span>
          <span className="font-normal text-stone-600"> /hour</span>
        </p>
      </div>
    </motion.div>
  );
};

// Agency Carousel Component - Airbnb Style
const AgencyCarousel = ({ title, agencies, viewAllLink, large = false }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef(null);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = 250;
      const newPosition = direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className={large ? "font-display text-4xl sm:text-5xl lg:text-6xl text-stone-900 leading-[0.98] pr-4" : "text-lg sm:text-[22px] font-semibold text-stone-900"}>{title}</h2>
        <div className="flex items-center gap-2">
          <Link
            to={viewAllLink}
            className="hidden sm:block text-sm font-medium text-stone-900 hover:underline"
          >
            Show all
          </Link>
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 bg-white border border-stone-300 rounded-full flex items-center justify-center hover:border-stone-400 hover:shadow-sm transition disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 text-stone-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 bg-white border border-stone-300 rounded-full flex items-center justify-center hover:border-stone-400 hover:shadow-sm transition disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* Card container - 5 cards on desktop, 2 on mobile */}
      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {agencies.map((agency, index) => (
          <div 
            key={agency.id} 
            className="flex-shrink-0 w-[calc((100%-12px)/2)] sm:w-[calc((100%-48px)/5)] lg:w-[calc((100%-64px)/5)]" 
            style={{ scrollSnapAlign: "start" }}
          >
            <AgencyCard agency={agency} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
};

// Testimonials Section - Using Split Testimonial Component
const TestimonialsSection = () => {
  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <p className="text-stone-500 text-center max-w-2xl mx-auto mb-12">
          Families across Philadelphia trust Voallen companions to keep their loved ones company
        </p>
      </div>
      <TestimonialsSplit />
    </section>
  );
};

// Hero Section - Warm Nature Theme
const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/agencies?search=${searchQuery}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Trusted by 10,000+ families
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-semibold text-stone-800 leading-tight mb-6">
              Compassionate
              <span className="text-stone-500"> Home Care </span>
              For Your Loved Ones
            </h1>
            
            <p className="text-xl text-stone-600 mb-8 leading-relaxed">
              Connect with verified, professional in-home caregivers for elderly care, 
              pediatric support, and specialized health services.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by city or care type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-200 outline-none transition shadow-sm"
                  data-testid="hero-search-input"
                />
              </div>
              <button
                type="submit"
                className="btn-primary rounded-full px-8 py-4"
                data-testid="hero-search-btn"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop"
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-stone-500">4.9 average from 2,000+ reviews</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ y: -8 }} className="rounded-[20px] overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop" alt="Caregiver" className="w-full h-72 object-cover" />
              </motion.div>
              <motion.div whileHover={{ y: -8 }} className="rounded-[20px] overflow-hidden shadow-2xl mt-8">
                <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop" alt="Nurse" className="w-full h-72 object-cover" />
              </motion.div>
              <motion.div whileHover={{ y: -8 }} className="rounded-[20px] overflow-hidden shadow-2xl -mt-8">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop" alt="Healthcare worker" className="w-full h-72 object-cover" />
              </motion.div>
              <motion.div whileHover={{ y: -8 }} className="rounded-[20px] overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop" alt="Medical professional" className="w-full h-72 object-cover" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Features Section - Black & White Theme
// Home Page
const HomePage = () => {
  usePageTitle();
  return (
    <PageBackground tone="cream">
      {/* New Hero Section with integrated header */}
      <NewHeroSection />
      
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Companionship sections, in the same order as the Voallen companionship website */}
        <OurServicesSection />
        <ThoughtfulVisitsSection />
        <StayConnectedSection />
      </div>

      {/* For caregivers looking for work: full-width cream band */}
      <CaregiverJobsSection />

      <div className="max-w-7xl mx-auto px-6">
        <VisitMomentsBand />
        <HowVoallenWorks />
        <TwoPathsSection />
        <QuestionsAnsweredSection />
      </div>

      <TestimonialsSection />

      {/* The dark footer carries the closing call to action */}
      <HomeFooter />
    </PageBackground>
  );
};

// "Ask about a visit" page: companionship visits plus the Philadelphia caregivers
const VisitPage = () => {
  usePageTitle("Companionship visits");
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get(`${API}/agencies`, { params: { city: "Philadelphia, PA" } })
      .then((response) => setAgencies(response.data.filter((a) => a.city === "Philadelphia, PA")))
      .catch((error) => console.error("Error fetching agencies:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageBackground>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <VisitHero />
        <VisitBenefits />
        <div id="philadelphia-agencies" className="scroll-mt-24" data-testid="visit-agencies">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-stone-500">Loading care agencies...</p>
            </div>
          ) : agencies.length > 0 ? (
            <AgencyCarousel
              large
              title="Highly rated care in Philadelphia"
              agencies={agencies}
              viewAllLink={`/agencies?city=${encodeURIComponent("Philadelphia, PA")}`}
            />
          ) : null}
          <div className="flex justify-center pt-6 pb-10">
            <Link
              to={`/agencies?city=${encodeURIComponent("Philadelphia, PA")}`}
              className="btn-outline w-full sm:w-auto sm:min-w-[360px] text-center px-8 py-4 rounded-full font-semibold"
            >
              View all Philadelphia caregivers
            </Link>
          </div>
        </div>
        <VisitStatBanner agencyCount={agencies.length} />
        <VisitFAQ />
      </div>
      <SiteFooter />
    </PageBackground>
  );
};

// Work with us page for caregivers looking for jobs (/caregivers)
const CaregiverPage = () => {
  usePageTitle("Caregiver jobs");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <PageBackground>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <CaregiverHero />
        <CaregiverWaysToHelp />
        <CaregiverReasons />
        <CaregiverSteps />
        <CaregiverSafety />
        <CaregiverFAQ />
        <CaregiverCTA />
      </div>
      <SiteFooter />
    </PageBackground>
  );
};

// Login Page - Using New Auth Component
const LoginPage = () => {
  usePageTitle("Log in");
  return <AuthComponent mode="login" />;
};

// Signup Page - Using New Auth Component
const SignupPage = () => {
  usePageTitle("Join Voallen");
  return <AuthComponent mode="signup" />;
};

// Agencies Page - Warm Nature Theme
const AgenciesPage = () => {
  usePageTitle("Find care");
  const [agencies, setAgencies] = useState([]);
  const [allAgencies, setAllAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const cities = [...new Set(allAgencies.map((a) => a.city).filter(Boolean))].sort();
  const specialties = ["Companionship", "Memory Care Companionship", "Meal Prep", "Errands & Shopping", "Light Housekeeping", "Transportation & Appointments", "Hobbies & Outings", "Video Calls & Tech Help", "Overnight Companionship", "Respite for Families"];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get("city");
    const specialtyParam = params.get("specialty");
    const searchParam = params.get("search");
    if (cityParam) setSelectedCity(cityParam);
    if (specialtyParam) setSelectedSpecialty(specialtyParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [location]);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await axios.get(`${API}/agencies`);
        setAllAgencies(response.data);
      } catch (error) {
        console.error("Error fetching agencies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  // Filter agencies based on city, specialty, and search query
  useEffect(() => {
    let filtered = [...allAgencies];
    
    if (selectedCity) {
      filtered = filtered.filter(a => a.city === selectedCity);
    }
    
    if (selectedSpecialty) {
      filtered = filtered.filter(a => a.specialties?.includes(selectedSpecialty));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.name?.toLowerCase().includes(query) ||
        a.city?.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query) ||
        a.bio?.toLowerCase().includes(query) ||
        a.specialties?.some(s => s.toLowerCase().includes(query))
      );
    }
    
    setAgencies(filtered);
  }, [allAgencies, selectedCity, selectedSpecialty, searchQuery]);

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-[112px] sm:pt-[124px] pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-[5.25rem] text-stone-900 leading-[0.98] mb-3">Find care in Philadelphia</h1>
            <p className="text-stone-500">Meet background-checked, non-medical companions near your loved one</p>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search by city, zip code, or care type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition shadow-sm"
                data-testid="search-input"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="px-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-stone-400 outline-none shadow-sm" data-testid="filter-city">
              <option value="">All Cities</option>
              {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
            </select>
            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="px-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-stone-400 outline-none shadow-sm" data-testid="filter-specialty">
              <option value="">All Specialties</option>
              {specialties.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            {(selectedCity || selectedSpecialty || searchQuery) && (
              <button 
                onClick={() => { setSelectedCity(""); setSelectedSpecialty(""); setSearchQuery(""); }}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 font-medium transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="animate-spin w-12 h-12 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agencies.map((agency, index) => (<AgencyCard key={agency.id} agency={agency} index={index} />))}
            </div>
          )}
          {!loading && agencies.length === 0 && <div className="text-center py-20"><p className="text-stone-500">No caregivers match your search yet. Try another service, or call us and we will find someone.</p></div>}
        </div>
      </div>
      <SiteFooter />
    </PageBackground>
  );
};

// Agency Detail Page - Warm Nature Theme
const AgencyDetailPage = () => {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [bookingData, setBookingData] = useState({ service_type: "", date: "", time_slot: "", patient_name: "", patient_age: "", care_needs: "", notes: "" });
  usePageTitle(agency?.name || "Caregiver");
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        // Send the session too, so owners and admins can preview a listing that isn't public yet
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/agencies/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
        setAgency(response.data);
      } catch (error) {
        console.error("Error fetching agency:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgency();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/bookings`, { ...bookingData, agency_id: id, patient_age: bookingData.patient_age ? parseInt(bookingData.patient_age) : null }, { headers: { Authorization: `Bearer ${token}` } });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      navigate("/booking-success");
    } catch (error) {
      alert(error.response?.data?.detail || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <PageBackground className="flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-stone-700 border-t-transparent rounded-full" /></PageBackground>;
  if (!agency) return <PageBackground className="flex items-center justify-center"><div className="text-center"><h1 className="font-display font-light text-4xl text-stone-900 mb-3">Caregiver not found</h1><p className="text-stone-500 mb-6">It may have been removed or the link is out of date.</p><Link to="/agencies" className="btn-primary rounded-full inline-flex px-6 py-3 rounded-full">Browse caregivers</Link></div></PageBackground>;

  const allImages = [agency.image_url, ...(agency.gallery_images || [])];
  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  return (
    <PageBackground>
      <Navigation />
      
      {/* Full-screen Image Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setShowGallery(false)}
          >
            <button 
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={() => setShowGallery(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev > 0 ? prev - 1 : allImages.length - 1); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev < allImages.length - 1 ? prev + 1 : 0); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <img 
              src={allImages[selectedImage]} 
              alt="Gallery" 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full transition ${idx === selectedImage ? 'bg-white' : 'bg-white/40'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(idx); }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-[112px] sm:pt-[124px] pb-16">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Caregiver photo with their own words, when the profile has a single photo */}
          {!(agency.gallery_images?.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 grid md:grid-cols-[minmax(0,480px)_1fr] gap-4 sm:gap-6" data-testid="caregiver-photo">
              <button type="button" onClick={() => setShowGallery(true)} className="block rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100" aria-label={`Open ${agency.name}'s photo`}>
                <img src={agency.image_url} alt={agency.name} className="w-full h-full object-cover" />
              </button>
              <div className="rounded-[20px] p-7 sm:p-10 flex flex-col justify-end bg-mist">
                <p className="eyebrow mb-4">Meet {agency.name?.split(" ")[0]}</p>
                <p className="font-display text-2xl sm:text-3xl leading-[1.15] text-stone-900">"{agency.bio}"</p>
                {agency.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {agency.certifications.slice(0, 3).map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.7)", color: "#1A1A2E" }}>
                        <CheckCircle className="w-3.5 h-3.5" /> {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Photo gallery, for profiles that have more than one photo */}
          {agency.gallery_images?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="grid grid-cols-4 gap-2 h-[400px] rounded-2xl overflow-hidden cursor-pointer" onClick={() => setShowGallery(true)}>
              <div className="col-span-2 row-span-2 relative group">
                <img src={allImages[0]} alt={agency.name} className="w-full h-full object-cover transition group-hover:brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              {allImages.slice(1, 5).map((img, idx) => (
                <div key={idx} className="relative group overflow-hidden">
                  <img src={img} alt={`${agency.name} ${idx + 2}`} className="w-full h-full object-cover transition group-hover:brightness-90" />
                  {idx === 3 && allImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                      <Camera className="w-5 h-5 mr-2" />
                      +{allImages.length - 5} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowGallery(true)}
              className="mt-3 flex items-center gap-2 text-stone-600 hover:text-stone-800 transition text-sm"
            >
              <Image className="w-4 h-4" />
              View all {allImages.length} photos
            </button>
          </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="op-card rounded-[20px] p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {agency.is_verified && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" />Background checked
                        </span>
                      )}
                      {agency.is_new && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />New
                        </span>
                      )}
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.98] text-stone-900 mb-2">{agency.name}</h1>
                    <div className="flex items-center gap-2 text-stone-500">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{agency.location}</span>
                    </div>
                  </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 bg-stone-800 text-white px-3 py-1.5 rounded-lg">
                      <Star className="w-4 h-4 fill-white" />
                      <span className="font-semibold">{agency.rating}</span>
                    </div>
                    <p className="text-sm text-stone-500 mt-1">{agency.review_count} {agency.review_count === 1 ? "review" : "reviews"}</p>
                  </div>
                </div>

                {/* Quick Stats - TripAdvisor Style */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-stone-800">{agency.experience_years || agency.years_in_business || 0}</div>
                    <div className="text-xs text-stone-500">Years caring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-stone-800">{agency.families_served || 0}</div>
                    <div className="text-xs text-stone-500">Families helped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-stone-800">{agency.review_count || 0}</div>
                    <div className="text-xs text-stone-500">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-amber-600">${agency.price_per_hour}</div>
                    <div className="text-xs text-stone-500">Per Hour</div>
                  </div>
                </div>
              </motion.div>

              {/* About Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="op-card rounded-[20px] p-6"
              >
                <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  About {agency.name}
                </h2>
                <p className="text-stone-600 leading-relaxed mb-4">{agency.bio}</p>
                {agency.description && <p className="text-stone-600 leading-relaxed">{agency.description}</p>}
              </motion.div>

              {/* Services & Certifications */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="op-card rounded-[20px] p-6">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4">How I can help</h2>
                  <div className="flex flex-wrap gap-2">
                    {agency.specialties?.map((s, i) => (
                      <span key={i} className="px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="op-card rounded-[20px] p-6">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4">Certifications</h2>
                  <div className="space-y-2">
                    {agency.certifications?.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-stone-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Reviews Section - TripAdvisor Style */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="op-card rounded-[20px] p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Family Reviews
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(agency.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                      ))}
                    </div>
                    <span className="font-semibold text-stone-800">{agency.rating}</span>
                    <span className="text-stone-500">({agency.review_count} {agency.review_count === 1 ? "review" : "reviews"})</span>
                  </div>
                </div>

                {agency.reviews && agency.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {agency.reviews.map((review, idx) => (
                      <motion.div 
                        key={review.id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-stone-50 rounded-xl border border-stone-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                              <span className="text-stone-600 font-semibold">{review.user_name?.charAt(0) || 'U'}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-stone-800">{review.user_name}</p>
                              <p className="text-xs text-stone-500">{review.relationship} • {review.care_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">"{review.comment}"</p>
                        <p className="text-xs text-stone-400 mt-2">{review.date}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 text-center py-8">No reviews yet. Be the first to share your experience!</p>
                )}
              </motion.div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }} 
                className="op-card rounded-[20px] p-6 sticky top-28"
              >
                <div className="text-center mb-6 pb-6 border-b border-stone-100">
                  <div className="text-4xl font-semibold text-stone-800">
                    ${agency.price_per_hour}
                    <span className="text-lg font-normal text-stone-500">/hour</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">Per hour</p>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">What would you like help with?</label>
                    <select 
                      value={bookingData.service_type} 
                      onChange={(e) => setBookingData({ ...bookingData, service_type: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none bg-white" 
                      required 
                      data-testid="booking-service"
                    >
                      <option value="">Choose a service</option>
                      {agency.specialties?.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">First meeting date</label>
                    <input 
                      type="date" 
                      value={bookingData.date} 
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none" 
                      required 
                      min={new Date().toISOString().split("T")[0]} 
                      data-testid="booking-date" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Preferred Time</label>
                    <select 
                      value={bookingData.time_slot} 
                      onChange={(e) => setBookingData({ ...bookingData, time_slot: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none bg-white" 
                      required 
                      data-testid="booking-time"
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Who is the visit for?</label>
                    <input 
                      type="text" 
                      value={bookingData.patient_name} 
                      onChange={(e) => setBookingData({ ...bookingData, patient_name: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none" 
                      placeholder="Your loved one's name" 
                      required 
                      data-testid="booking-patient" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Anything we should know? (optional)</label>
                    <textarea 
                      value={bookingData.care_needs} 
                      onChange={(e) => setBookingData({ ...bookingData, care_needs: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none resize-none" 
                      rows={3} 
                      placeholder="Their routine, interests, or what a good visit looks like..." 
                      data-testid="booking-needs" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={bookingLoading} 
                    className="btn-primary rounded-full w-full py-4 disabled:opacity-50 flex items-center justify-center gap-2" 
                    data-testid="booking-submit"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Book a free first meeting
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free first meeting, no commitment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime before confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Non-medical companionship only</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageBackground>
  );
};

// Dashboard Page - clients see their bookings, agencies manage incoming requests
const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-stone-100 text-stone-700",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors.completed}`} data-testid="booking-status">
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value }) => (
  <div className="op-card rounded-[20px] p-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}><Icon className={`w-6 h-6 ${iconColor}`} /></div>
      <div><p className="text-sm text-stone-500">{label}</p><p className="text-2xl font-semibold text-stone-800">{value}</p></div>
    </div>
  </div>
);

const ReviewForm = ({ booking, onDone }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.post(`${API}/reviews`, { booking_id: booking.id, rating, comment }, authHeaders());
      onDone();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save your review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-100" data-testid="review-form">
      <p className="text-sm font-semibold text-stone-800 mb-2">How was your visit with {booking.agency?.name || "your caregiver"}?</p>
      <div className="flex gap-1 mb-3" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} data-testid={`review-star-${n}`}>
            <Star className={`w-6 h-6 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
          </button>
        ))}
      </div>
      <textarea required value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={2000}
        placeholder="Share what went well and what could be better"
        className="w-full px-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-stone-400 outline-none text-sm" data-testid="review-comment" />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary rounded-full mt-3 px-5 py-2 text-sm disabled:opacity-50" data-testid="review-submit">
        {saving ? "Saving..." : "Post review"}
      </button>
    </form>
  );
};

const ClientDashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  const load = async () => {
    try {
      const response = await axios.get(`${API}/bookings`, authHeaders());
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const cancel = async (booking) => {
    try {
      await axios.patch(`${API}/bookings/${booking.id}/status`, { status: "cancelled" }, authHeaders());
      load();
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  return (
    <>
      <div className="mb-8"><h1 className="text-3xl font-semibold text-stone-800 mb-2">Welcome back, {user?.name}!</h1><p className="text-stone-500">Manage your care bookings and account</p></div>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={Calendar} iconBg="bg-stone-100" iconColor="text-stone-800" label="Total Bookings" value={bookings.length} />
        <StatCard icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" label="Confirmed" value={bookings.filter(b => b.status === "confirmed").length} />
        <StatCard icon={Clock} iconBg="bg-amber-100" iconColor="text-amber-600" label="Pending" value={bookings.filter(b => b.status === "pending").length} />
      </div>
      <div className="op-card rounded-[20px]">
        <div className="p-6 border-b border-stone-100"><h2 className="text-xl font-semibold text-stone-800">Your Bookings</h2></div>
        {loading ? (<div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" /></div>) : bookings.length === 0 ? (
          <div className="p-12 text-center"><p className="text-stone-500 mb-4">You haven't made any bookings yet.</p><Link to="/agencies" className="btn-primary rounded-full inline-flex items-center gap-2 px-6 py-3">Find Care<ChevronRight className="w-4 h-4" /></Link></div>
        ) : (
          <div className="divide-y divide-stone-100">{bookings.map((booking) => (
            <div key={booking.id} className="p-6" data-testid="client-booking">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">{booking.agency && <img src={booking.agency.image_url} alt={booking.agency.name} className="w-16 h-16 rounded-xl object-cover" />}<div><h3 className="font-semibold text-stone-800">{booking.agency?.name || "Care Agency"}</h3><p className="text-sm text-stone-500">{booking.service_type}</p><div className="flex items-center gap-4 mt-2 text-sm text-stone-500"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.date}</span><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{booking.time_slot}</span></div></div></div>
                <div className="text-right shrink-0">
                  <StatusBadge status={booking.status} />
                  <p className="mt-2 font-semibold text-stone-800">${booking.total_price}/hr</p>
                  {["pending", "confirmed"].includes(booking.status) && (
                    <button onClick={() => cancel(booking)} className="mt-2 text-sm text-red-600 hover:underline" data-testid="cancel-booking">Cancel</button>
                  )}
                  {booking.status === "completed" && !booking.review_id && reviewing !== booking.id && (
                    <button onClick={() => setReviewing(booking.id)} className="mt-2 block ml-auto text-sm font-medium text-stone-800 underline" data-testid="leave-review">Leave a review</button>
                  )}
                  {booking.review_id && <p className="mt-2 text-sm text-green-700">Reviewed, thank you</p>}
                </div>
              </div>
              {reviewing === booking.id && <ReviewForm booking={booking} onDone={() => { setReviewing(null); load(); }} />}
            </div>
          ))}</div>
        )}
      </div>
    </>
  );
};

const AgencyProfileForm = ({ onCreated }) => {
  const [form, setForm] = useState({ name: "", bio: "", description: "", location: "", city: "", price_per_hour: "", experience_years: "", specialties: "", image_url: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const years = parseInt(form.experience_years || "0", 10);
      await axios.post(`${API}/agencies`, {
        ...form,
        price_per_hour: parseFloat(form.price_per_hour),
        experience_years: years,
        years_in_business: years,
        specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        image_url: form.image_url || "/voallen/caregivers/default.svg",
        profile_type: "individual",
      }, authHeaders());
      onCreated();
    } catch (err) {
      setError(err.response?.data?.detail?.toString() || "Could not create your profile");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full px-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-stone-400 outline-none text-sm";
  return (
    <form onSubmit={submit} className="op-card rounded-[20px] p-6 grid md:grid-cols-2 gap-4" data-testid="agency-profile-form">
      <div className="md:col-span-2"><h2 className="text-xl font-semibold text-stone-800">Create your caregiver profile</h2><p className="text-sm text-stone-500 mt-1">Families can find and book you once your profile is live.</p></div>
      <input required placeholder="Your name (first name and last initial)" value={form.name} onChange={set("name")} className={input} />
      <input required placeholder="City, e.g. Philadelphia, PA" value={form.city} onChange={set("city")} className={input} />
      <input required placeholder="Neighborhood, e.g. Fishtown, Philadelphia, PA" value={form.location} onChange={set("location")} className={`${input} md:col-span-2`} />
      <input required placeholder="One-line summary" value={form.bio} onChange={set("bio")} className={`${input} md:col-span-2`} />
      <textarea placeholder="About you: what you enjoy doing with the people you visit" rows={3} value={form.description} onChange={set("description")} className={`${input} md:col-span-2`} />
      <input required type="number" min="1" step="0.5" placeholder="Price per hour ($)" value={form.price_per_hour} onChange={set("price_per_hour")} className={input} />
      <input required type="number" min="0" placeholder="Years of experience" value={form.experience_years} onChange={set("experience_years")} className={input} />
      <input placeholder="What you help with, e.g. Companionship, Meal Prep" value={form.specialties} onChange={set("specialties")} className={input} />
      <input placeholder="Photo link (optional)" value={form.image_url} onChange={set("image_url")} className={input} />
      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
      <div className="md:col-span-2"><button type="submit" disabled={saving} className="btn-primary rounded-full px-6 py-3 disabled:opacity-50">{saving ? "Saving..." : "Publish profile"}</button></div>
    </form>
  );
};

const AgencyDashboard = ({ user }) => {
  const [agency, setAgency] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const me = await axios.get(`${API}/agency/me`, authHeaders()).catch((err) => {
        if (err.response?.status === 404) return { data: null };
        throw err;
      });
      setAgency(me.data);
      if (me.data) {
        const response = await axios.get(`${API}/agency/bookings`, authHeaders());
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error loading agency dashboard:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (booking, status) => {
    setBusy(booking.id);
    try {
      await axios.patch(`${API}/bookings/${booking.id}/status`, { status }, authHeaders());
      await load();
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <>
      <div className="mb-8"><h1 className="text-3xl font-semibold text-stone-800 mb-2">Welcome back, {user?.name}!</h1><p className="text-stone-500">{agency ? <>Manage visit requests for your profile, <Link to={`/agencies/${agency.id}`} className="underline">{agency.name}</Link></> : "Create your caregiver profile so families can find and book you"}</p></div>
      {!agency ? <AgencyProfileForm onCreated={load} /> : (
        <>
          {agency.status === "pending_approval" && (
            <div className="mb-6 p-4 rounded-xl bg-amber-100 text-amber-700 text-sm" data-testid="agency-pending-banner">
              Your profile is waiting for approval from the Voallen team. Families will be able to find and book you once it's approved. We'll email you.
            </div>
          )}
          {agency.status === "unavailable" && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 text-red-700 text-sm">
              Your listing is currently set to unavailable by the Voallen team, so families can't see or book you. Contact us if you have questions.
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard icon={Clock} iconBg="bg-amber-100" iconColor="text-amber-600" label="Awaiting your answer" value={bookings.filter(b => b.status === "pending").length} />
            <StatCard icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" label="Confirmed" value={bookings.filter(b => b.status === "confirmed").length} />
            <StatCard icon={Star} iconBg="bg-stone-100" iconColor="text-stone-800" label="Rating" value={agency.review_count ? `${agency.rating} (${agency.review_count})` : "No reviews yet"} />
          </div>
          <div className="op-card rounded-[20px]">
            <div className="p-6 border-b border-stone-100"><h2 className="text-xl font-semibold text-stone-800">Consultation requests</h2></div>
            {bookings.length === 0 ? <div className="p-12 text-center text-stone-500">No requests yet.</div> : (
              <div className="divide-y divide-stone-100">{bookings.map((booking) => (
                <div key={booking.id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4" data-testid="agency-booking">
                  <div>
                    <h3 className="font-semibold text-stone-800">{booking.patient_name}{booking.patient_age ? `, ${booking.patient_age}` : ""}</h3>
                    <p className="text-sm text-stone-500">{booking.service_type}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-stone-500"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.date}</span><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{booking.time_slot}</span></div>
                    {booking.client && <p className="text-sm text-stone-500 mt-2">Requested by {booking.client.name} · {booking.client.email}{booking.client.phone ? ` · ${booking.client.phone}` : ""}</p>}
                    {booking.care_needs && <p className="text-sm text-stone-600 mt-2">Care needs: {booking.care_needs}</p>}
                    {booking.notes && <p className="text-sm text-stone-600 mt-1">Notes: {booking.notes}</p>}
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                    <StatusBadge status={booking.status} />
                    <div className="flex gap-2">
                      {booking.status === "pending" && (<>
                        <button disabled={busy === booking.id} onClick={() => setStatus(booking, "confirmed")} className="btn-primary rounded-full px-4 py-2 text-sm disabled:opacity-50" data-testid="accept-booking">Accept</button>
                        <button disabled={busy === booking.id} onClick={() => setStatus(booking, "declined")} className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 disabled:opacity-50" data-testid="decline-booking">Decline</button>
                      </>)}
                      {booking.status === "confirmed" && (
                        <button disabled={busy === booking.id} onClick={() => setStatus(booking, "completed")} className="btn-primary rounded-full px-4 py-2 text-sm disabled:opacity-50" data-testid="complete-booking">Mark visit complete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        </>
      )}
    </>
  );
};

const DashboardPage = () => {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("admin");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;
  return (
    <PageBackground>
      <Navigation />
      <div className="pt-[112px] sm:pt-[124px] pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {user.is_admin && user.role !== "admin" && (
            <div className="grid grid-cols-2 gap-2 p-2 mb-8 bg-stone-100 rounded-2xl max-w-md" role="tablist" aria-label="Which dashboard">
              {[["admin", "Admin"], ["own", user.role === "agency" ? "My profile" : "My bookings"]].map(([id, label]) => (
                <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
                  className={`min-h-[52px] px-4 rounded-xl text-lg font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-400 ${view === id ? "bg-stone-900 text-white" : "text-stone-800 hover:bg-white"}`}
                  data-testid={`dashboard-view-${id}`}>{label}</button>
              ))}
            </div>
          )}
          {user.is_admin && (user.role === "admin" || view === "admin")
            ? <AdminDashboard />
            : user.role === "agency" ? <AgencyDashboard user={user} /> : <ClientDashboard user={user} />}
        </div>
      </div>
    </PageBackground>
  );
};

// Admin view of a single agency: profile, listing controls and every booking with its history
const AdminAgencyPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate("/login");
    else if (!user.is_admin) navigate("/dashboard");
  }, [user, navigate]);
  if (!user?.is_admin) return null;
  return (
    <PageBackground>
      <Navigation />
      <div className="pt-[112px] sm:pt-[124px] pb-16">
        <div className="max-w-7xl mx-auto px-6"><AdminAgencyDetail agencyId={id} /></div>
      </div>
    </PageBackground>
  );
};

// Booking Success Page
const BookingSuccessPage = () => {
  usePageTitle("Request sent");
  useEffect(() => { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); }, []);
  return (
    <PageBackground className="flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="op-card rounded-[20px] shadow-2xl p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></div>
        <h1 className="text-3xl font-semibold text-stone-800 mb-4">Request Sent!</h1>
        <p className="text-stone-500 mb-8">We sent your visit request to the caregiver and emailed you a copy. You'll get an email as soon as they accept it.</p>
        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="btn-primary rounded-full px-6 py-3">View My Bookings</Link>
          <Link to="/" className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition">Back to Home</Link>
        </div>
      </motion.div>
    </PageBackground>
  );
};

// Contact Page - Warm Nature Theme
const ContactPage = () => {
  usePageTitle("Contact us");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-[64px] sm:pt-[76px] pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <PageIntro center eyebrow="Contact" title="We'd love to hear from you" lead="Questions about visits, a loved one, or working with us? Send a note or give us a call." />
          {success ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="op-card rounded-[20px] p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              <h2 className="text-2xl font-semibold text-stone-800 mb-2">Message Sent!</h2>
              <p className="text-stone-500 mb-6">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSuccess(false)} className="btn-primary rounded-full px-6 py-3">Send Another Message</button>
            </motion.div>
          ) : (
            <div className="op-card rounded-[20px] p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-stone-700 mb-2">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition" required data-testid="contact-name" /></div>
                  <div><label className="block text-sm font-medium text-stone-700 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition" required data-testid="contact-email" /></div>
                </div>
                <div><label className="block text-sm font-medium text-stone-700 mb-2">Subject</label><input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition" required data-testid="contact-subject" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-2">Message</label><textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition resize-none" rows={6} required data-testid="contact-message" /></div>
                <button type="submit" disabled={loading} className="btn-primary rounded-full w-full py-4 disabled:opacity-50" data-testid="contact-submit">{loading ? "Sending..." : "Send Message"}</button>
              </form>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <a href={CONTACT_PHONE_HREF} className="op-card rounded-[20px] p-6 text-center transition"><div className="w-12 h-12 bg-mist rounded-2xl flex items-center justify-center mx-auto mb-4"><Phone className="w-6 h-6 text-[#1f4fff]" /></div><h3 className="font-semibold text-stone-800 mb-1">Phone</h3><p className="text-stone-500">{CONTACT_PHONE}</p></a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="op-card rounded-[20px] p-6 text-center transition"><div className="w-12 h-12 bg-mist rounded-2xl flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-[#1f4fff]" /></div><h3 className="font-semibold text-stone-800 mb-1">Email</h3><p className="text-stone-500 text-sm [overflow-wrap:anywhere]">{CONTACT_EMAIL}</p></a>
            <div className="op-card rounded-[20px] p-6 text-center"><div className="w-12 h-12 bg-mist rounded-2xl flex items-center justify-center mx-auto mb-4"><MapPin className="w-6 h-6 text-[#1f4fff]" /></div><h3 className="font-semibold text-stone-800 mb-1">Service area</h3><p className="text-stone-500">Philadelphia, PA</p></div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageBackground>
  );
};

// FAQ Page - Warm Nature Theme
const FAQPage = () => {
  usePageTitle("FAQ");
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = [
    { question: "What kind of help do Voallen caregivers offer?", answer: "Voallen caregivers are non-medical companions. They offer company and conversation, memory care companionship, meal prep, errands and shopping, light housekeeping, rides to appointments, walks and hobbies, help with video calls, and overnight or respite companionship so family caregivers can rest." },
    { question: "Do caregivers provide medical care?", answer: "No. Our caregivers don't give medication, wound care or any other medical or nursing care. If your loved one needs medical help at home, please talk with their doctor about a licensed home health provider." },
    { question: "Who are the caregivers?", answer: "Individual people from Philadelphia neighborhoods, not companies. Each one has their own profile with their experience, what they enjoy doing, their hourly rate and reviews from families. Every caregiver is background checked before they can be booked." },
    { question: "How much does it cost?", answer: "Each caregiver sets their own hourly rate, shown on their profile. Most are between $15 and $20 an hour." },
    { question: "Can I meet the caregiver before booking?", answer: "Yes. We encourage families to have a first call or visit to meet the caregiver, talk about your loved one's routine and interests, and make sure it feels like a good match." },
    { question: "What if I need to cancel or reschedule?", answer: "Plans change. Let your caregiver or our team know as early as you can and we'll find a new time." },
    { question: "What areas do you serve?", answer: "We currently serve Philadelphia, PA." },
    { question: "How do I pay?", answer: "You pay for the hours of each visit at the caregiver's hourly rate. Call or email us if you have questions about payment." },
  ];

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-[64px] sm:pt-[76px] pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <PageIntro center eyebrow="FAQ" title="Questions, answered" lead="Everything families usually ask before their first visit." />
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="op-card rounded-[20px] overflow-hidden">
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-stone-50 transition" data-testid={`faq-${index}`}>
                  <span className="font-semibold text-stone-800 pr-4">{faq.question}</span>
                  <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronRight className="w-5 h-5 text-stone-500 rotate-90" /></motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-6 pb-5 text-stone-600 leading-relaxed">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 rounded-[20px] p-8 sm:p-12 text-center bg-mist">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-stone-900 mb-4">Still have questions?</h2>
            <p className="mb-6 text-stone-600">We're happy to talk it through, no pressure.</p>
            <Link to="/contact" className="btn-primary inline-flex items-center px-8 py-4 rounded-full text-lg">Contact us</Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageBackground>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <AuthProvider>
      <WishlistProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/agencies" element={<AgenciesPage />} />
            <Route path="/agencies/:id" element={<AgencyDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/agencies/:id" element={<AdminAgencyPage />} />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/visits" element={<VisitPage />} />
            <Route path="/caregivers" element={<CaregiverPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
