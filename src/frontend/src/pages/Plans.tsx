import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Loader2, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ShoppingItem } from "../declarations/backend.did.d";
import { useActor } from "../hooks/useActor";
import { useCreateCheckoutSession } from "../hooks/useCheckout";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Feature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  badge: string;
  badgeStyle: "gray" | "teal" | "navy";
  monthlyPrice: string;
  annualPrice: string;
  annualOriginal?: string;
  features: Feature[];
  ctaLabel: string;
  ctaStyle: "outlined" | "teal" | "navy";
  highlighted: boolean;
  whatsappMessage: string;
}

// ── WhatsApp helper ────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "919142345153";
function openWhatsApp(message: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.click();
}

// ── Data ──────────────────────────────────────────────────────────────────────
const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    badge: "Get Started",
    badgeStyle: "gray",
    monthlyPrice: "₹1,099",
    annualPrice: "₹10,550",
    annualOriginal: "₹13,188",
    features: [
      { text: "2 consultations/month", included: true },
      { text: "Chat with a general physician", included: true },
      { text: "Digital prescription", included: true },
      { text: "Priority booking", included: false },
      { text: "Specialist access", included: false },
      { text: "Health reports storage", included: false },
    ],
    ctaLabel: "Get Started",
    ctaStyle: "outlined",
    highlighted: false,
    whatsappMessage:
      "Hi Mediverse! I'm interested in the Basic Plan (₹1,099/month). Please help me get started with my subscription.",
  },
  {
    id: "standard",
    name: "Standard",
    badge: "Most Popular",
    badgeStyle: "teal",
    monthlyPrice: "₹1,599",
    annualPrice: "₹15,350",
    annualOriginal: "₹19,188",
    features: [
      { text: "8 consultations/month", included: true },
      { text: "Chat + Video with general physician", included: true },
      { text: "Digital prescription", included: true },
      { text: "Priority booking", included: true },
      { text: "Health report storage (10 reports)", included: true },
      { text: "Specialist access", included: false },
    ],
    ctaLabel: "Get Standard",
    ctaStyle: "teal",
    highlighted: true,
    whatsappMessage:
      "Hi Mediverse! I'd like to subscribe to the Standard Plan (₹1,599/month). Please assist me with enrollment.",
  },
  {
    id: "premium",
    name: "Premium",
    badge: "Best Value",
    badgeStyle: "navy",
    monthlyPrice: "₹2,599",
    annualPrice: "₹24,950",
    annualOriginal: "₹31,188",
    features: [
      { text: "Unlimited consultations/month", included: true },
      { text: "Chat + Video with any doctor", included: true },
      { text: "Digital prescription", included: true },
      { text: "Priority booking", included: true },
      {
        text: "Specialist access (Cardiologist, Dermatologist, etc.)",
        included: true,
      },
      { text: "Unlimited health report storage", included: true },
      { text: "Dedicated care manager", included: true },
    ],
    ctaLabel: "Go Premium",
    ctaStyle: "navy",
    highlighted: false,
    whatsappMessage:
      "Hi Mediverse! I want to subscribe to the Premium Plan (₹2,599/month). Please help me get started with the full experience.",
  },
];

const TABLE_ROWS = [
  {
    key: "consultations",
    feature: "Consultations/month",
    basic: "2",
    standard: "8",
    premium: "Unlimited",
  },
  {
    key: "consultation-type",
    feature: "Consultation type",
    basic: "Chat only",
    standard: "Chat + Video",
    premium: "Chat + Video",
  },
  {
    key: "prescription",
    feature: "Digital prescription",
    basic: true,
    standard: true,
    premium: true,
  },
  {
    key: "priority-booking",
    feature: "Priority booking",
    basic: false,
    standard: true,
    premium: true,
  },
  {
    key: "specialist",
    feature: "Specialist access",
    basic: false,
    standard: false,
    premium: true,
  },
  {
    key: "reports",
    feature: "Health reports storage",
    basic: false,
    standard: "10 reports",
    premium: "Unlimited",
  },
  {
    key: "care-manager",
    feature: "Dedicated care manager",
    basic: false,
    standard: false,
    premium: true,
  },
];

const FAQS = [
  {
    id: "cancel",
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time with no cancellation fees. Your plan remains active until the end of the current billing period.",
  },
  {
    id: "specialists",
    q: "What specialists are available in Premium?",
    a: "Premium gives you access to Cardiologists, Dermatologists, Orthopedists, Neurologists, ENT specialists, and more. New specialties are added regularly.",
  },
  {
    id: "prescription",
    q: "How do I get a digital prescription?",
    a: "After your consultation, your doctor will issue a digitally signed prescription directly to your Mediverse account. You can download or share it anytime.",
  },
  {
    id: "security",
    q: "Is my health data secure?",
    a: "Absolutely. All your health records and consultation data are encrypted and stored securely. We follow strict privacy standards and never share your data with third parties.",
  },
];

const CROSS_POSITIONS = [
  { id: "c1", x: "8%", y: "20%" },
  { id: "c2", x: "85%", y: "15%" },
  { id: "c3", x: "92%", y: "70%" },
  { id: "c4", x: "5%", y: "75%" },
  { id: "c5", x: "50%", y: "10%" },
];

// ── Scroll-reveal hook ─────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function BadgePill({
  label,
  style,
}: { label: string; style: "gray" | "teal" | "navy" }) {
  const base =
    "inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide";
  const styles = {
    gray: `${base} bg-slate-100 text-slate-600`,
    teal: `${base} text-white`,
    navy: `${base} text-white`,
  };
  const inlineStyle =
    style === "teal"
      ? { backgroundColor: "#0ABFBC" }
      : style === "navy"
        ? { backgroundColor: "#0A1F44" }
        : {};
  return (
    <span className={styles[style]} style={inlineStyle}>
      {label}
    </span>
  );
}

function FeatureRow({ feature }: { feature: Feature }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      {feature.included ? (
        <Check
          className="mt-0.5 shrink-0 h-4 w-4"
          style={{ color: "#0ABFBC" }}
        />
      ) : (
        <X className="mt-0.5 shrink-0 h-4 w-4" style={{ color: "#CBD5E1" }} />
      )}
      <span style={{ color: feature.included ? "#1E2A3A" : "#94A3B8" }}>
        {feature.text}
      </span>
    </li>
  );
}

function TableCellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <td className="px-4 py-3 text-center">
        <Check className="mx-auto h-4 w-4" style={{ color: "#0ABFBC" }} />
      </td>
    );
  }
  if (value === false) {
    return (
      <td className="px-4 py-3 text-center">
        <X className="mx-auto h-4 w-4" style={{ color: "#CBD5E1" }} />
      </td>
    );
  }
  return (
    <td
      className="px-4 py-3 text-center text-sm font-semibold"
      style={{ color: "#0A1F44" }}
    >
      {value}
    </td>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
// ── Plan items for Stripe ────────────────────────────────────────────────────
const STRIPE_ITEMS: Record<string, ShoppingItem> = {
  basic: {
    currency: "inr",
    productName: "Basic Plan",
    productDescription: "2 consultations/month",
    priceInCents: 109900n,
    quantity: 1n,
  },
  standard: {
    currency: "inr",
    productName: "Standard Plan",
    productDescription: "8 consultations/month",
    priceInCents: 159900n,
    quantity: 1n,
  },
  premium: {
    currency: "inr",
    productName: "Premium Plan",
    productDescription: "Unlimited consultations/month",
    priceInCents: 259900n,
    quantity: 1n,
  },
};

export default function Plans() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { actor } = useActor();
  const checkout = useCreateCheckoutSession();

  const { data: stripeConfigured } = useQuery<boolean>({
    queryKey: ["stripe-configured"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isStripeConfigured();
    },
    enabled: !!actor,
    staleTime: 60000,
  });

  async function handlePlanClick(planId: string, whatsappMessage: string) {
    if (loadingPlan) return;
    setLoadingPlan(planId);
    try {
      const item = STRIPE_ITEMS[planId];
      const session = await checkout.mutateAsync([item]);
      window.location.href = session.url;
    } catch {
      // Stripe not configured or failed — fall back to WhatsApp
      toast.error(
        stripeConfigured === false
          ? "Payment setup is not yet configured. Redirecting you to WhatsApp to subscribe."
          : "Payment setup is not yet configured. Please contact us on WhatsApp to subscribe.",
        { duration: 4000 },
      );
      setTimeout(() => openWhatsApp(whatsappMessage), 800);
    } finally {
      setLoadingPlan(null);
    }
  }

  const heroRef = useReveal() as React.RefObject<HTMLElement>;
  const toggleRef = useReveal() as React.RefObject<HTMLElement>;
  const cardsRef = useReveal() as React.RefObject<HTMLElement>;
  const tableRef = useReveal() as React.RefObject<HTMLElement>;
  const faqRef = useReveal() as React.RefObject<HTMLElement>;
  const ctaRef = useReveal() as React.RefObject<HTMLElement>;

  return (
    <div
      className="font-dm-sans min-h-screen"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      {/* ── Sticky Nav ── */}
      <header
        className="sticky top-0 z-50 bg-white border-b border-slate-200"
        style={{ boxShadow: "0 1px 8px rgba(10,31,68,0.07)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
            >
              <rect x="9" y="0" width="4" height="22" rx="2" fill="#0ABFBC" />
              <rect x="0" y="9" width="22" height="4" rx="2" fill="#0ABFBC" />
            </svg>
            <span
              className="font-dm-serif text-xl font-bold"
              style={{ color: "#0A1F44" }}
            >
              Mediverse
            </span>
          </div>

          {/* Back link */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "#0A1F44" }}
            data-ocid="plans.nav.link"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        ref={heroRef as React.RefObject<HTMLDivElement>}
        className="reveal relative overflow-hidden py-20 sm:py-28"
        style={{ backgroundColor: "#0A1F44" }}
        data-ocid="plans.hero.section"
      >
        {/* SVG ECG pattern background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="ecg"
              x="0"
              y="0"
              width="200"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 30 L30 30 L38 10 L46 50 L54 30 L70 30 L80 30 L88 10 L96 50 L104 30 L120 30 L130 30 L138 10 L146 50 L154 30 L170 30 L200 30"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                opacity="0.07"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ecg)" />
          {/* Scattered medical cross icons */}
          {CROSS_POSITIONS.map((pos) => (
            <g
              key={pos.id}
              transform={`translate(${pos.x},${pos.y})`}
              opacity="0.07"
            >
              <rect x="-8" y="-2" width="16" height="4" rx="1" fill="white" />
              <rect x="-2" y="-8" width="4" height="16" rx="1" fill="white" />
            </g>
          ))}
        </svg>

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-dm-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight mb-4">
            Choose Your Care Plan
          </h1>
          <p
            className="text-lg sm:text-xl mt-4"
            style={{ color: "rgba(255,255,255,0.78)" }}
          >
            Premium online doctor consultations — anytime, anywhere.
          </p>
        </div>
      </section>

      {/* ── Billing Toggle ── */}
      <section
        ref={toggleRef as React.RefObject<HTMLDivElement>}
        className="reveal pt-10 pb-4 flex flex-col items-center gap-3"
        data-ocid="plans.billing.toggle"
      >
        <div className="flex items-center gap-4 bg-white rounded-full px-6 py-3 border border-slate-200 shadow-sm">
          <span
            className="text-sm font-medium transition-all duration-200"
            style={{
              color: isAnnual ? "#94A3B8" : "#0A1F44",
              fontWeight: isAnnual ? 400 : 600,
            }}
          >
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            data-ocid="plans.billing.switch"
            style={{ "--primary": "55.2% 0.2 193" } as React.CSSProperties}
          />
          <span
            className="text-sm transition-all duration-200 flex items-center gap-1.5"
            style={{
              color: isAnnual ? "#0A1F44" : "#94A3B8",
              fontWeight: isAnnual ? 600 : 400,
            }}
          >
            Annual
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
              style={{ backgroundColor: "#0ABFBC" }}
            >
              Save 20%
            </span>
          </span>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section
        ref={cardsRef as React.RefObject<HTMLDivElement>}
        className="reveal max-w-6xl mx-auto px-4 sm:px-6 py-10"
        data-ocid="plans.cards.section"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={[
                "relative bg-white rounded-2xl border flex flex-col",
                "transition-all duration-200 hover:-translate-y-2 cursor-default",
                plan.highlighted
                  ? "border-2 shadow-xl md:scale-105 md:-translate-y-1"
                  : "border-slate-200 shadow-sm hover:shadow-lg",
              ].join(" ")}
              style={
                plan.highlighted
                  ? {
                      borderColor: "#0ABFBC",
                      boxShadow:
                        "0 0 0 3px rgba(10,191,188,0.18), 0 20px 60px rgba(10,191,188,0.18)",
                    }
                  : {}
              }
              data-ocid={`plans.${plan.id}.card`}
            >
              {/* Top accent bar for highlighted */}
              {plan.highlighted && (
                <div
                  className="h-1.5 rounded-t-2xl"
                  style={{ backgroundColor: "#0ABFBC" }}
                />
              )}

              <div className="p-7 flex flex-col gap-5 flex-1">
                {/* Badge + Name */}
                <div className="flex flex-col gap-2">
                  <BadgePill label={plan.badge} style={plan.badgeStyle} />
                  <h2
                    className="font-dm-serif text-2xl font-normal"
                    style={{ color: "#0A1F44" }}
                  >
                    {plan.name}
                  </h2>
                </div>

                {/* Price */}
                <div className="pb-2 border-b border-slate-100">
                  <div
                    className="text-4xl font-bold transition-all duration-300"
                    style={{ color: "#0A1F44" }}
                  >
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    {!isAnnual && (
                      <span className="text-sm font-normal text-slate-400 ml-1">
                        /month
                      </span>
                    )}
                    {isAnnual && (
                      <span className="text-sm font-normal text-slate-400 ml-1">
                        /year
                      </span>
                    )}
                  </div>
                  {isAnnual && plan.annualOriginal && (
                    <p className="text-sm text-slate-400 mt-1">
                      <span className="line-through">
                        {plan.annualOriginal}/yr
                      </span>
                      <span
                        className="ml-2 font-medium"
                        style={{ color: "#0ABFBC" }}
                      >
                        20% off
                      </span>
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((f) => (
                    <FeatureRow key={f.text} feature={f} />
                  ))}
                </ul>

                {/* CTA */}
                <button
                  type="button"
                  disabled={loadingPlan === plan.id}
                  onClick={() =>
                    handlePlanClick(
                      plan.id,
                      isAnnual
                        ? plan.whatsappMessage
                            .replace("/month", "/year")
                            .replace(plan.monthlyPrice, plan.annualPrice)
                        : plan.whatsappMessage,
                    )
                  }
                  className="w-full mt-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={
                    plan.ctaStyle === "outlined"
                      ? {
                          border: "2px solid #0A1F44",
                          color: "#0A1F44",
                          background: "transparent",
                        }
                      : plan.ctaStyle === "teal"
                        ? {
                            background: "#0ABFBC",
                            color: "white",
                            border: "2px solid #0ABFBC",
                          }
                        : {
                            background: "#0A1F44",
                            color: "white",
                            border: "2px solid #0A1F44",
                          }
                  }
                  onMouseEnter={(e) => {
                    if (loadingPlan === plan.id) return;
                    const el = e.currentTarget;
                    if (plan.ctaStyle === "outlined") {
                      el.style.background = "#0A1F44";
                      el.style.color = "white";
                    } else if (plan.ctaStyle === "teal") {
                      el.style.background = "#089e9b";
                      el.style.borderColor = "#089e9b";
                    } else {
                      el.style.background = "#060e1f";
                      el.style.borderColor = "#060e1f";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (loadingPlan === plan.id) return;
                    const el = e.currentTarget;
                    if (plan.ctaStyle === "outlined") {
                      el.style.background = "transparent";
                      el.style.color = "#0A1F44";
                    } else if (plan.ctaStyle === "teal") {
                      el.style.background = "#0ABFBC";
                      el.style.borderColor = "#0ABFBC";
                    } else {
                      el.style.background = "#0A1F44";
                      el.style.borderColor = "#0A1F44";
                    }
                  }}
                  data-ocid={`plans.${plan.id}.primary_button`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 shrink-0" />
                  )}
                  {loadingPlan === plan.id ? "Redirecting..." : plan.ctaLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section
        ref={tableRef as React.RefObject<HTMLDivElement>}
        className="reveal max-w-6xl mx-auto px-4 sm:px-6 py-12"
        data-ocid="plans.comparison.section"
      >
        <h2
          className="font-dm-serif text-3xl sm:text-4xl text-center mb-8"
          style={{ color: "#0A1F44" }}
        >
          Compare Plans
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr style={{ backgroundColor: "#0A1F44" }}>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-white">
                    Basic
                  </th>
                  <th
                    className="px-4 py-4 text-center text-sm font-semibold"
                    style={{ color: "#0ABFBC" }}
                  >
                    Standard
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-white">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.key}
                    className="border-t border-slate-100"
                    style={{
                      backgroundColor: i % 2 === 0 ? "white" : "#F8FAFC",
                    }}
                  >
                    <td
                      className="px-6 py-3 text-sm font-medium"
                      style={{ color: "#1E2A3A" }}
                    >
                      {row.feature}
                    </td>
                    <TableCellValue value={row.basic} />
                    <TableCellValue value={row.standard} />
                    <TableCellValue value={row.premium} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        ref={faqRef as React.RefObject<HTMLDivElement>}
        className="reveal max-w-3xl mx-auto px-4 sm:px-6 py-12"
        data-ocid="plans.faq.section"
      >
        <h2
          className="font-dm-serif text-3xl sm:text-4xl text-center mb-8"
          style={{ color: "#0A1F44" }}
        >
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.id}
              value={`faq-${faq.id}`}
              className="bg-white border border-slate-200 rounded-xl px-6 shadow-sm"
              data-ocid={`plans.faq.item.${i + 1}`}
            >
              <AccordionTrigger
                className="text-sm font-semibold py-4 hover:no-underline text-left"
                style={{ color: "#0A1F44" }}
              >
                {faq.q}
              </AccordionTrigger>
              <AccordionContent
                className="text-sm pb-4 leading-relaxed"
                style={{ color: "#475569" }}
              >
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── CTA Banner ── */}
      <section
        ref={ctaRef as React.RefObject<HTMLDivElement>}
        className="reveal mx-4 sm:mx-6 max-w-5xl md:mx-auto mb-16 rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#0A1F44" }}
        data-ocid="plans.cta.section"
      >
        {/* Decorative top stripe */}
        <div
          className="h-1"
          style={{
            background: "linear-gradient(90deg,#0ABFBC 0%,#089e9b 100%)",
          }}
        />
        <div className="px-8 py-12 text-center">
          <h2 className="font-dm-serif text-3xl sm:text-4xl text-white mb-3">
            Not sure which plan?
          </h2>
          <p
            className="text-sm sm:text-base mb-8"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Talk to us and we&apos;ll help you choose the right care plan.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Mediverse! I need help choosing the right care plan for me. Can you guide me?")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: "#25D366" }}
            data-ocid="plans.cta.primary_button"
          >
            <MessageCircle className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Mediverse. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-slate-600 transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
