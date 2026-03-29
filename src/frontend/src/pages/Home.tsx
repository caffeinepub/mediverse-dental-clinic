import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

const CLINIC_NAME = "Mediverse Dental Clinic";
const CLINIC_PHONE = "+91 9142345153";
const CLINIC_WA = "919142345153";
const CLINIC_ADDRESS =
  "V-466, Central School Rd, Jogipur, Kankarbagh, Bankman Colony, Patna, Bihar 800020";

const TREATMENTS = [
  "Teeth Cleaning",
  "Root Canal",
  "Dental Braces",
  "Dental Implants",
  "Teeth Whitening",
  "Consultation",
];

const SERVICES = [
  {
    icon: "🦷",
    name: "Teeth Cleaning",
    desc: "Professional scaling & polishing to remove plaque and tartar. Keep gums healthy and smile bright.",
    color: "#0EA5E9",
  },
  {
    icon: "🔬",
    name: "Root Canal Treatment",
    desc: "Painless root canal to save infected teeth and relieve pain using advanced, gentle techniques.",
    color: "#6366F1",
  },
  {
    icon: "😁",
    name: "Dental Braces",
    desc: "Metal & ceramic braces and clear aligners for perfectly aligned teeth and a confident smile.",
    color: "#22C55E",
  },
  {
    icon: "🦴",
    name: "Dental Implants",
    desc: "Premium titanium implants that look, feel, and function just like your natural teeth permanently.",
    color: "#0EA5E9",
  },
  {
    icon: "✨",
    name: "Teeth Whitening",
    desc: "Advanced whitening treatments to remove stains and brighten your smile up to 8 shades.",
    color: "#6366F1",
  },
  {
    icon: "💎",
    name: "Cosmetic Dentistry",
    desc: "Veneers, bonding, and smile makeovers for the perfect aesthetic smile you've always dreamed of.",
    color: "#22C55E",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    text: "Absolutely amazing experience! Dr. Verma was so gentle and professional. My root canal was completely painless. Highly recommend Mediverse to anyone!",
    rating: 5,
    avatar: "P",
  },
  {
    name: "Rahul Mehta",
    role: "Teacher",
    text: "I was terrified of dentists but the team here put me completely at ease. Got my braces done and the results are stunning. Best dental clinic in Patna!",
    rating: 5,
    avatar: "R",
  },
  {
    name: "Sunita Devi",
    role: "Homemaker",
    text: "Affordable and professional service. The clinic is spotlessly clean and the staff is very friendly. Teeth whitening results exceeded my expectations!",
    rating: 5,
    avatar: "S",
  },
  {
    name: "Amit Kumar",
    role: "Business Owner",
    text: "Got dental implants here and couldn't be happier. The procedure was smooth and the follow-up care was exceptional. I smile with confidence now!",
    rating: 5,
    avatar: "A",
  },
];

const TRUST_PILLARS = [
  {
    icon: Award,
    title: "10+ Years Experience",
    value: "10+",
    desc: "Years serving Patna",
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.1)",
  },
  {
    icon: Users,
    title: "500+ Happy Patients",
    value: "500+",
    desc: "Smiles transformed",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
  },
  {
    icon: Zap,
    title: "Modern Equipment",
    value: "100%",
    desc: "Digital & laser tech",
    color: "#6366F1",
    bg: "rgba(99,102,241,0.1)",
  },
  {
    icon: Heart,
    title: "Gentle Approach",
    value: "4.9★",
    desc: "Patient satisfaction",
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.1)",
  },
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  treatment: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  date: "",
  time: "",
  treatment: "",
  notes: "",
};

const glassStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 8px 32px rgba(14,165,233,0.08)",
};

const glassStrongStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow: "0 8px 40px rgba(14,165,233,0.12)",
};

export default function Home() {
  const { actor } = useActor();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Active section tracking
  useEffect(() => {
    const sections = [
      "home",
      "about",
      "services",
      "testimonials",
      "booking",
      "contact",
    ];
    const observers: IntersectionObserver[] = [];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.4 },
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  // Auto-sliding carousel
  useEffect(() => {
    carouselRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => {
      if (carouselRef.current) clearInterval(carouselRef.current);
    };
  }, []);

  function resetCarouselTimer() {
    if (carouselRef.current) clearInterval(carouselRef.current);
    carouselRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
  }

  function prevSlide() {
    setCarouselIndex(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
    resetCarouselTimer();
  }

  function nextSlide() {
    setCarouselIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    resetCarouselTimer();
  }

  function scrollToBooking() {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (
      !form.name ||
      !form.phone ||
      !form.date ||
      !form.time ||
      !form.treatment
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    const message = `Hello ${CLINIC_NAME}, I would like to book an appointment.\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nDate: ${form.date}\nTime: ${form.time}\nTreatment: ${form.treatment}\nNotes: ${form.notes}`;
    try {
      if (actor) {
        await actor.submitAppointment(
          form.name,
          form.phone,
          form.email,
          form.date,
          form.time,
          form.treatment,
          form.notes,
        );
      }
    } catch (err) {
      console.error("Backend save failed:", err);
    }
    window.open(
      `https://wa.me/${CLINIC_WA}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setSubmitSuccess(true);
    setForm(INITIAL_FORM);
    setIsSubmitting(false);
  }

  const navLinks = [
    { href: "#home", label: "Home", id: "home" },
    { href: "#about", label: "About", id: "about" },
    { href: "#services", label: "Services", id: "services" },
    { href: "#testimonials", label: "Testimonials", id: "testimonials" },
    { href: "#booking", label: "Book Appointment", id: "booking" },
    { href: "#contact", label: "Contact", id: "contact" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F8FAFC", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* ── NAVBAR ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={
          scrolled
            ? glassStrongStyle
            : {
                background: "rgba(248,250,252,0.6)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(14,165,233,0.08)",
              }
        }
      >
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <a href="#home" className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                }}
              >
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span
                  className="font-bold text-sm block"
                  style={{
                    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Mediverse
                </span>
                <span className="text-xs text-muted-foreground">
                  Dental Clinic
                </span>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                  style={
                    activeSection === l.id
                      ? {
                          background: "rgba(14,165,233,0.12)",
                          color: "#0EA5E9",
                        }
                      : { color: "#475569" }
                  }
                  data-ocid="nav.link"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button
                size="sm"
                className="btn-shine btn-glow text-white font-semibold rounded-full px-5"
                style={{
                  background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                  border: "none",
                }}
                onClick={scrollToBooking}
                data-ocid="nav.primary_button"
              >
                Book Now
              </Button>
            </div>

            <button
              type="button"
              className="md:hidden p-2 rounded-xl"
              style={{ background: "rgba(14,165,233,0.08)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              data-ocid="nav.toggle"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" style={{ color: "#0EA5E9" }} />
              ) : (
                <Menu className="w-5 h-5" style={{ color: "#0EA5E9" }} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
              style={{
                borderTop: "1px solid rgba(14,165,233,0.1)",
                background: "rgba(248,250,252,0.95)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-sm font-medium py-2.5 px-4 rounded-xl transition-all"
                    style={
                      activeSection === l.id
                        ? {
                            background: "rgba(14,165,233,0.1)",
                            color: "#0EA5E9",
                          }
                        : { color: "#475569" }
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
                <Button
                  className="btn-shine text-white w-full mt-2 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                    border: "none",
                  }}
                  onClick={scrollToBooking}
                >
                  Book Appointment
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0c1a3a 0%, #0a2a6e 35%, #0e4f8a 65%, #0d6ea8 100%)",
        }}
      >
        {/* Animated blobs */}
        <div
          className="blob"
          style={{
            width: 500,
            height: 500,
            background: "#0EA5E9",
            top: "-100px",
            left: "-100px",
            animationDelay: "0s",
          }}
        />
        <div
          className="blob"
          style={{
            width: 400,
            height: 400,
            background: "#22C55E",
            bottom: "-80px",
            right: "10%",
            animationDelay: "2.5s",
          }}
        />
        <div
          className="blob"
          style={{
            width: 350,
            height: 350,
            background: "#6366F1",
            top: "30%",
            right: "-50px",
            animationDelay: "5s",
          }}
        />

        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-6 font-medium"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#bae6fd",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Trusted by 500+ patients in Patna
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-5">
                <span className="text-white">Your Health,</span>
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #38bdf8, #86efac, #a5b4fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Our Priority
                </span>
              </h1>

              <p
                className="text-lg mb-8 max-w-lg"
                style={{ color: "rgba(186,230,253,0.85)" }}
              >
                Trusted dental care in Jogipur — modern treatments,
                compassionate service, and a commitment to your perfect smile.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button
                  size="lg"
                  className="btn-shine btn-glow font-semibold text-white rounded-full px-8"
                  style={{
                    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                    border: "none",
                  }}
                  onClick={scrollToBooking}
                  data-ocid="hero.primary_button"
                >
                  Book Appointment
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                  asChild
                  data-ocid="hero.secondary_button"
                >
                  <a href="#about">Learn More</a>
                </Button>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-6">
                {["500+ Patients", "10+ Years Exp.", "4.9★ Rating"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#22C55E" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "rgba(186,230,253,0.9)" }}
                      >
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </motion.div>

            {/* Floating glass stat cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex flex-col gap-4 items-end"
            >
              {[
                {
                  label: "Happy Patients",
                  value: "500+",
                  icon: "😊",
                  color: "#0EA5E9",
                },
                {
                  label: "Years of Care",
                  value: "10+",
                  icon: "🏥",
                  color: "#22C55E",
                },
                {
                  label: "Patient Rating",
                  value: "4.9 ★",
                  icon: "⭐",
                  color: "#6366F1",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.8,
                    ease: "easeInOut",
                  }}
                  className="rounded-2xl p-4 flex items-center gap-4 w-56"
                  style={{
                    ...glassStyle,
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <div className="text-3xl">{stat.icon}</div>
                  <div>
                    <div className="text-xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(186,230,253,0.8)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Wave decoration"
          >
            <title>Wave decoration</title>
            <path
              d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
              fill="#F8FAFC"
            />
          </svg>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 soft-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
              style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9" }}
            >
              <Shield className="w-4 h-4" /> About Mediverse
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#0f172a" }}
            >
              Why Choose{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Mediverse?
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
              At Mediverse Dental Clinic, we combine advanced technology with
              compassionate care to deliver outstanding dental results. Located
              in Kankarbagh, Patna — serving patients of all ages.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 text-center card-hover cursor-default"
                style={glassStyle}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: pillar.bg }}
                >
                  <pillar.icon
                    className="w-7 h-7"
                    style={{ color: pillar.color }}
                  />
                </div>
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: pillar.color }}
                >
                  {pillar.value}
                </div>
                <h3 className="font-semibold mb-1" style={{ color: "#0f172a" }}>
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section
        id="services"
        className="py-24"
        style={{ background: "#F8FAFC" }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
              style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
            >
              <Sparkles className="w-4 h-4" /> Our Services
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#0f172a" }}
            >
              Comprehensive{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #22C55E, #0EA5E9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Dental Care
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From routine cleanings to advanced restorative treatments — we
              cover it all with expertise and care.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-6 card-hover cursor-default group"
                style={glassStyle}
              >
                <div
                  className="text-4xl mb-4 w-16 h-16 flex items-center justify-center rounded-2xl"
                  style={{ background: `${service.color}18` }}
                >
                  {service.icon}
                </div>
                <h3
                  className="font-bold text-lg mb-2 transition-colors"
                  style={{ color: "#0f172a" }}
                >
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {service.desc}
                </p>
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="text-sm font-semibold flex items-center gap-1 transition-all hover:gap-2"
                  style={{ color: service.color }}
                  data-ocid="services.primary_button"
                >
                  Book Now <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 soft-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
              style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}
            >
              <Star className="w-4 h-4" /> Patient Reviews
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#0f172a" }}
            >
              What Our{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #6366F1, #0EA5E9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Patients Say
              </span>
            </h2>
            <p className="text-muted-foreground">
              Real reviews from real patients who trust Mediverse for their
              dental care.
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl p-8 md:p-10"
                style={glassStrongStyle}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from(
                    { length: TESTIMONIALS[carouselIndex].rating },
                    (_, j) => j,
                  ).map((starPos) => (
                    <Star
                      key={`star-${TESTIMONIALS[carouselIndex].name}-${starPos}`}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p
                  className="text-base leading-relaxed mb-6"
                  style={{ color: "#334155" }}
                >
                  &ldquo;{TESTIMONIALS[carouselIndex].text}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                    }}
                  >
                    {TESTIMONIALS[carouselIndex].avatar}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "#0f172a" }}>
                      {TESTIMONIALS[carouselIndex].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {TESTIMONIALS[carouselIndex].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={prevSlide}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={glassStyle}
                data-ocid="testimonials.secondary_button"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: "#0EA5E9" }} />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((t, idx) => (
                  <button
                    type="button"
                    key={`dot-${t.name}`}
                    onClick={() => {
                      setCarouselIndex(idx);
                      resetCarouselTimer();
                    }}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: idx === carouselIndex ? 24 : 8,
                      height: 8,
                      background:
                        idx === carouselIndex
                          ? "#0EA5E9"
                          : "rgba(14,165,233,0.3)",
                    }}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextSlide}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={glassStyle}
                data-ocid="testimonials.primary_button"
              >
                <ChevronRight
                  className="w-5 h-5"
                  style={{ color: "#0EA5E9" }}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOKING FORM ── */}
      <section
        id="booking"
        className="py-24 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)",
        }}
      >
        <div
          className="blob"
          style={{
            width: 400,
            height: 400,
            background: "#22C55E",
            top: "-80px",
            right: "-80px",
            animationDelay: "1s",
            opacity: 0.3,
          }}
        />
        <div
          className="blob"
          style={{
            width: 300,
            height: 300,
            background: "#0EA5E9",
            bottom: "-60px",
            left: "-60px",
            animationDelay: "3s",
            opacity: 0.3,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Book Your Appointment
            </h2>
            <p
              style={{ color: "rgba(255,255,255,0.8)" }}
              className="max-w-xl mx-auto"
            >
              Fill in the form and we&apos;ll connect you instantly via WhatsApp
              to confirm your appointment.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl p-10 text-center"
                  style={glassStrongStyle}
                  data-ocid="booking.success_state"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "rgba(34,197,94,0.15)" }}
                  >
                    <CheckCircle
                      className="w-10 h-10"
                      style={{ color: "#22C55E" }}
                    />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#0f172a" }}
                  >
                    Appointment Booked!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your request has been submitted. WhatsApp has opened to send
                    your details directly to us.
                  </p>
                  <Button
                    onClick={() => setSubmitSuccess(false)}
                    className="btn-shine text-white rounded-full px-8"
                    style={{
                      background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                      border: "none",
                    }}
                    data-ocid="booking.secondary_button"
                  >
                    Book Another Appointment
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="rounded-3xl p-8"
                  style={glassStrongStyle}
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="b-name"
                        className="font-medium"
                        style={{ color: "#0f172a" }}
                      >
                        Full Name <span style={{ color: "#ef4444" }}>*</span>
                      </Label>
                      <Input
                        id="b-name"
                        placeholder="e.g. Rahul Kumar"
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        required
                        className="rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(14,165,233,0.2)",
                        }}
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="b-phone"
                        className="font-medium"
                        style={{ color: "#0f172a" }}
                      >
                        Phone Number <span style={{ color: "#ef4444" }}>*</span>
                      </Label>
                      <Input
                        id="b-phone"
                        placeholder="e.g. 9876543210"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        required
                        className="rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(14,165,233,0.2)",
                        }}
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label
                        htmlFor="b-email"
                        className="font-medium"
                        style={{ color: "#0f172a" }}
                      >
                        Email Address
                      </Label>
                      <Input
                        id="b-email"
                        type="email"
                        placeholder="e.g. you@email.com"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        className="rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(14,165,233,0.2)",
                        }}
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="b-date"
                        className="font-medium"
                        style={{ color: "#0f172a" }}
                      >
                        Preferred Date{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </Label>
                      <Input
                        id="b-date"
                        type="date"
                        value={form.date}
                        onChange={(e) => updateForm("date", e.target.value)}
                        required
                        className="rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(14,165,233,0.2)",
                        }}
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="b-time"
                        className="font-medium"
                        style={{ color: "#0f172a" }}
                      >
                        Preferred Time{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </Label>
                      <Input
                        id="b-time"
                        type="time"
                        value={form.time}
                        onChange={(e) => updateForm("time", e.target.value)}
                        required
                        className="rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(14,165,233,0.2)",
                        }}
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label
                        className="font-medium"
                        style={{ color: "#0f172a" }}
                      >
                        Treatment Type{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </Label>
                      <Select
                        value={form.treatment}
                        onValueChange={(v) => updateForm("treatment", v)}
                      >
                        <SelectTrigger
                          className="rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.8)",
                            border: "1px solid rgba(14,165,233,0.2)",
                          }}
                          data-ocid="booking.select"
                        >
                          <SelectValue placeholder="Select treatment" />
                        </SelectTrigger>
                        <SelectContent>
                          {TREATMENTS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label
                        htmlFor="b-notes"
                        className="font-medium"
                        style={{ color: "#0f172a" }}
                      >
                        Additional Notes
                      </Label>
                      <Textarea
                        id="b-notes"
                        placeholder="Any specific concerns or questions..."
                        value={form.notes}
                        onChange={(e) => updateForm("notes", e.target.value)}
                        rows={3}
                        className="rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(14,165,233,0.2)",
                        }}
                        data-ocid="booking.textarea"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p
                      className="text-sm mt-3 font-medium"
                      style={{ color: "#ef4444" }}
                      data-ocid="booking.error_state"
                    >
                      {formError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-6 btn-shine btn-glow-green text-white font-bold rounded-full text-base"
                    style={{
                      background: "linear-gradient(135deg, #22C55E, #0EA5E9)",
                      border: "none",
                    }}
                    disabled={isSubmitting}
                    data-ocid="booking.submit_button"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <MessageCircle className="mr-2 h-5 w-5" />
                    )}
                    {isSubmitting ? "Booking..." : "Book via WhatsApp"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 soft-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
              style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9" }}
            >
              <MapPin className="w-4 h-4" /> Find Us
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#0f172a" }}
            >
              Get In{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #0EA5E9, #22C55E)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Touch
              </span>
            </h2>
            <p className="text-muted-foreground">
              We&apos;re here to help. Reach out to us anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-8 space-y-6"
              style={glassStyle}
            >
              <h3 className="font-bold text-xl" style={{ color: "#0f172a" }}>
                Contact Information
              </h3>

              {[
                {
                  icon: MapPin,
                  label: "Address",
                  value: CLINIC_ADDRESS,
                  color: "#0EA5E9",
                  href: undefined,
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: CLINIC_PHONE,
                  color: "#22C55E",
                  href: `tel:${CLINIC_PHONE}`,
                },
                {
                  icon: MessageCircle,
                  label: "WhatsApp",
                  value: "+91 9142345153",
                  color: "#22C55E",
                  href: `https://wa.me/${CLINIC_WA}`,
                },
                {
                  icon: Clock,
                  label: "Hours",
                  value: "Mon–Sat: 9:00 AM – 7:00 PM",
                  color: "#6366F1",
                  href: undefined,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}18` }}
                  >
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: item.color }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5 font-medium">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={
                          item.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel="noreferrer"
                        className="text-sm font-medium hover:underline"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#334155" }}
                      >
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 btn-shine text-white rounded-full font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                    border: "none",
                  }}
                  asChild
                  data-ocid="contact.primary_button"
                >
                  <a href={`tel:${CLINIC_PHONE}`}>
                    <Phone className="w-4 h-4 mr-2" /> Call Now
                  </a>
                </Button>
                <Button
                  className="flex-1 btn-shine btn-glow-green text-white rounded-full font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #22C55E, #16a34a)",
                    border: "none",
                  }}
                  asChild
                  data-ocid="contact.secondary_button"
                >
                  <a
                    href={`https://wa.me/${CLINIC_WA}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden h-96"
              style={{ boxShadow: "0 8px 40px rgba(14,165,233,0.12)" }}
            >
              <iframe
                title="Mediverse Dental Clinic Location"
                src="https://maps.google.com/maps?q=Jogipur+Kankarbagh+Patna+Bihar&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{ background: "#0F172A", color: "white" }}
        className="py-14"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                  }}
                >
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">{CLINIC_NAME}</span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#94a3b8" }}
              >
                Premium dental care in Patna. Expert treatments for your perfect
                smile with compassion and modern technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#bae6fd" }}>
                Quick Links
              </h4>
              <div className="space-y-2">
                {[
                  ["#about", "About"],
                  ["#services", "Services"],
                  ["#testimonials", "Testimonials"],
                  ["#booking", "Book Appointment"],
                  ["#contact", "Contact"],
                  ["/admin/login", "Admin Login"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="block text-sm transition-colors hover:text-white"
                    style={{ color: "#64748b" }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#bae6fd" }}>
                Contact Info
              </h4>
              <div className="space-y-3 text-sm" style={{ color: "#64748b" }}>
                <p className="flex items-start gap-2">
                  <MapPin
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "#0EA5E9" }}
                  />
                  {CLINIC_ADDRESS}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: "#22C55E" }} />
                  {CLINIC_PHONE}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "#6366F1" }} />
                  Mon–Sat: 9:00 AM – 7:00 PM
                </p>
              </div>
            </div>
          </div>
          <div
            className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              color: "#475569",
            }}
          >
            <p>
              &copy; {new Date().getFullYear()} {CLINIC_NAME}. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a
        href={`https://wa.me/${CLINIC_WA}`}
        target="_blank"
        rel="noreferrer"
        className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg whatsapp-pulse hover:scale-110 transition-transform"
        style={{ bottom: 24, right: 24, background: "#25d366" }}
        aria-label="WhatsApp us"
        data-ocid="floating.primary_button"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 fill-white"
          role="img"
          aria-label="WhatsApp"
        >
          <title>WhatsApp</title>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}
