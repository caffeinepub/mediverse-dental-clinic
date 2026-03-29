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
  CheckCircle,
  ChevronRight,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

const CLINIC_NAME = "Mediverse Dental Clinic";
const CLINIC_PHONE = "+91 9142345153";
const CLINIC_WA = "919142345153";
const CLINIC_EMAIL = "info4clinic@gmail.com";
const CLINIC_ADDRESS =
  "V-466, Central School Rd, Jogipur, Kankarbagh, Bankman Colony, Patna, Bihar 800020";

const TREATMENTS = [
  "Dental Cleaning",
  "Root Canal",
  "Braces",
  "Dental Implants",
  "Teeth Whitening",
  "Other",
];

const SERVICES = [
  {
    icon: "🦷",
    name: "Dental Cleaning",
    desc: "Professional scaling and polishing to remove plaque and tartar, keeping your gums healthy and your smile bright.",
  },
  {
    icon: "🔬",
    name: "Root Canal",
    desc: "Painless root canal treatment to save infected teeth and relieve pain with our advanced techniques.",
  },
  {
    icon: "😁",
    name: "Braces & Aligners",
    desc: "Metal braces and clear aligners for perfectly aligned teeth and a confident, beautiful smile.",
  },
  {
    icon: "🦴",
    name: "Dental Implants",
    desc: "Premium titanium implants that look, feel, and function just like natural teeth for a permanent solution.",
  },
  {
    icon: "✨",
    name: "Teeth Whitening",
    desc: "Advanced whitening treatments to remove stains and brighten your smile by up to 8 shades.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    text: "Absolutely amazing experience! Dr. Verma was so gentle and professional. My root canal was completely painless. Highly recommend Mediverse to anyone!",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Teacher",
    text: "I was terrified of dentists but the team here put me completely at ease. Got my braces done here and the results are stunning. Best dental clinic in Patna!",
    rating: 5,
  },
  {
    name: "Sunita Devi",
    role: "Homemaker",
    text: "Affordable and professional service. The clinic is spotlessly clean and the staff is very friendly. Teeth whitening results exceeded my expectations!",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    role: "Business Owner",
    text: "Got dental implants here and couldn't be happier. The procedure was smooth and the follow-up care was exceptional. I smile with confidence now!",
    rating: 5,
  },
];

const TRUST_PILLARS = [
  {
    icon: Shield,
    title: "Expert Dentists",
    desc: "BDS & MDS qualified specialists with 10+ years experience",
  },
  {
    icon: Sparkles,
    title: "Modern Equipment",
    desc: "Digital X-rays, laser dentistry, and latest sterilization tech",
  },
  {
    icon: Heart,
    title: "Gentle Approach",
    desc: "Anxiety-free, pain-minimized treatments for all ages",
  },
  {
    icon: CheckCircle,
    title: "Affordable Care",
    desc: "Transparent pricing with flexible payment options",
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

export default function Home() {
  const { actor } = useActor();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

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
      !form.email ||
      !form.date ||
      !form.time ||
      !form.treatment
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!actor) {
      setFormError("Connection not ready. Please try again.");
      return;
    }
    setIsSubmitting(true);
    try {
      await actor.submitAppointment(
        form.name,
        form.phone,
        form.email,
        form.date,
        form.time,
        form.treatment,
        form.notes,
      );
      const message = `Hello ${CLINIC_NAME}, I have booked an appointment. Here are my details:\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nDate: ${form.date}\nTime: ${form.time}\nTreatment: ${form.treatment}\nNotes: ${form.notes}`;
      window.open(
        `https://wa.me/${CLINIC_WA}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
      setSubmitSuccess(true);
      setForm(INITIAL_FORM);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#booking", label: "Book Appointment" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <a href="#home" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-clinic-blue-light flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-clinic-blue" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-clinic-navy text-sm block">
                  Mediverse
                </span>
                <span className="text-xs text-muted-foreground">
                  Dental Clinic
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-foreground/70 hover:text-clinic-blue transition-colors"
                  data-ocid="nav.link"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button
                size="sm"
                className="bg-clinic-blue hover:bg-clinic-blue-dark text-white"
                onClick={scrollToBooking}
                data-ocid="nav.primary_button"
              >
                Book Appointment
              </Button>
            </div>

            {/* Mobile */}
            <button
              type="button"
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              data-ocid="nav.toggle"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-sm font-medium py-2 border-b border-border last:border-0"
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
                <Button
                  className="bg-clinic-blue hover:bg-clinic-blue-dark text-white w-full mt-2"
                  onClick={scrollToBooking}
                >
                  Book Appointment
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="clinic-gradient pt-16 min-h-[90vh] flex items-center"
      >
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Trusted by 5000+ patients in Patna
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Book Your Dental
                <br />
                <span className="text-yellow-300">Appointment Today</span>
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-lg">
                Expert dental care you can trust. Professional, gentle, and
                affordable treatments for you and your family.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-clinic-blue hover:bg-blue-50 font-semibold shadow-lg"
                  onClick={scrollToBooking}
                  data-ocid="hero.primary_button"
                >
                  Book Appointment
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent"
                  asChild
                  data-ocid="hero.secondary_button"
                >
                  <a href={`tel:${CLINIC_PHONE}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-10">
                {["5000+ Patients", "15+ Years Exp.", "Expert Dentists"].map(
                  (item) => (
                    <div key={item} className="text-center">
                      <div className="text-white/80 text-xs">{item}</div>
                    </div>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl" />
                <img
                  src="/assets/generated/dental-hero.dim_600x500.png"
                  alt="Dental clinic professional care"
                  className="relative rounded-3xl shadow-2xl max-w-full h-auto"
                  style={{ maxHeight: 420 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 clinic-gradient-soft">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-clinic-navy mb-4">
              Why Choose Mediverse?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              At Mediverse Dental Clinic, we combine advanced technology with
              compassionate care to deliver outstanding dental results.
              Conveniently located in Kankarbagh, Patna, we serve patients of
              all ages.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card card-hover border border-border/50 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-clinic-blue-light flex items-center justify-center mx-auto mb-4">
                  <pillar.icon className="w-7 h-7 text-clinic-blue" />
                </div>
                <h3 className="font-bold text-clinic-navy mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-clinic-navy mb-4">
              Our Dental Services
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive dental care covering everything from routine
              cleanings to advanced restorative treatments.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 shadow-card card-hover border border-border/50 group cursor-default"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-bold text-clinic-navy text-lg mb-2 group-hover:text-clinic-blue transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.desc}
                </p>
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="mt-4 text-clinic-blue text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  data-ocid="services.primary_button"
                >
                  Book Now <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 clinic-gradient-soft">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-clinic-navy mb-4">
              What Our Patients Say
            </h2>
            <p className="text-muted-foreground">
              Real reviews from real patients who trust Mediverse for their
              dental care.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card card-hover border border-border/50"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }, (_, j) => (
                    <Star
                      key={`${t.name}-star-${j}`}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-clinic-blue-light flex items-center justify-center">
                    <span className="text-xs font-bold text-clinic-blue">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-clinic-navy">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-clinic-navy mb-4">
              Book Your Appointment
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fill in the form below and we&apos;ll confirm your appointment.
              You&apos;ll also be redirected to WhatsApp to send your details
              directly.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center"
                  data-ocid="booking.success_state"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Appointment Booked!
                  </h3>
                  <p className="text-green-700 mb-6">
                    Your appointment request has been submitted. WhatsApp has
                    opened to send your details directly to us.
                  </p>
                  <Button
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-clinic-blue hover:bg-clinic-blue-dark text-white"
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
                  className="bg-white rounded-2xl shadow-card border border-border/50 p-8"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="b-name">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="b-name"
                        placeholder="e.g. Rahul Kumar"
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        required
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="b-phone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="b-phone"
                        placeholder="e.g. 9876543210"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        required
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="b-email">
                        Email Address{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="b-email"
                        type="email"
                        placeholder="e.g. you@email.com"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        required
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="b-date">
                        Preferred Date{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="b-date"
                        type="date"
                        value={form.date}
                        onChange={(e) => updateForm("date", e.target.value)}
                        required
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="b-time">
                        Preferred Time{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="b-time"
                        type="time"
                        value={form.time}
                        onChange={(e) => updateForm("time", e.target.value)}
                        required
                        data-ocid="booking.input"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>
                        Treatment Type{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.treatment}
                        onValueChange={(v) => updateForm("treatment", v)}
                      >
                        <SelectTrigger data-ocid="booking.select">
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
                      <Label htmlFor="b-notes">Additional Notes</Label>
                      <Textarea
                        id="b-notes"
                        placeholder="Any specific concerns or questions..."
                        value={form.notes}
                        onChange={(e) => updateForm("notes", e.target.value)}
                        rows={3}
                        data-ocid="booking.textarea"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p
                      className="text-sm text-destructive mt-3 font-medium"
                      data-ocid="booking.error_state"
                    >
                      {formError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-6 bg-clinic-blue hover:bg-clinic-blue-dark text-white font-semibold"
                    disabled={isSubmitting}
                    data-ocid="booking.submit_button"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting
                      ? "Booking..."
                      : "Book Appointment & Open WhatsApp"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 clinic-gradient-soft">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-clinic-navy mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground">
              We&apos;re here to help. Reach out to us anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-card border border-border/50">
                <h3 className="font-bold text-clinic-navy mb-4">
                  Get In Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-clinic-blue-light flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-clinic-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Address
                      </p>
                      <p className="text-sm font-medium text-clinic-navy">
                        {CLINIC_ADDRESS}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-clinic-blue-light flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-clinic-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Phone
                      </p>
                      <a
                        href={`tel:${CLINIC_PHONE}`}
                        className="text-sm font-medium text-clinic-blue hover:underline"
                      >
                        {CLINIC_PHONE}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-clinic-blue-light flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-clinic-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Email
                      </p>
                      <a
                        href={`mailto:${CLINIC_EMAIL}`}
                        className="text-sm font-medium text-clinic-blue hover:underline"
                      >
                        {CLINIC_EMAIL}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    className="flex-1 bg-clinic-blue hover:bg-clinic-blue-dark text-white"
                    asChild
                    data-ocid="contact.primary_button"
                  >
                    <a href={`tel:${CLINIC_PHONE}`}>
                      <Phone className="w-4 h-4 mr-2" /> Call Now
                    </a>
                  </Button>
                  <Button
                    className="flex-1 bg-[#25d366] hover:bg-[#20b655] text-white"
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
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-card border border-border/50 h-80">
              <iframe
                title="Mediverse Dental Clinic Location"
                src="https://maps.google.com/maps?q=V-466+Central+School+Rd+Jogipur+Kankarbagh+Patna+Bihar+800020&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-clinic-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-blue-300" />
                </div>
                <span className="font-bold">{CLINIC_NAME}</span>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                Professional dental care in Patna. Expert treatments for your
                perfect smile.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-100">Quick Links</h4>
              <div className="space-y-2">
                {[
                  "#about",
                  "#services",
                  "#testimonials",
                  "#booking",
                  "#contact",
                ].map((href) => (
                  <a
                    key={href}
                    href={href}
                    className="block text-sm text-blue-300 hover:text-white transition-colors"
                  >
                    {href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-100">Contact Info</h4>
              <div className="space-y-2 text-sm text-blue-300">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {CLINIC_ADDRESS}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {CLINIC_PHONE}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {CLINIC_EMAIL}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-blue-300">
            <p>
              &copy; {new Date().getFullYear()} {CLINIC_NAME}. All rights
              reserved.
            </p>
            <p>
              Built with &hearts; using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-200 hover:text-white"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${CLINIC_WA}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center shadow-lg whatsapp-pulse hover:scale-110 transition-transform"
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
