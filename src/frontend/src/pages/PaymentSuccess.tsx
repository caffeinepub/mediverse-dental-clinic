import { Link } from "@tanstack/react-router";
import { CheckCircle2, Home, MessageCircle } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundColor: "#F9FAFB",
        fontFamily: "'DM Sans', sans-serif",
      }}
      data-ocid="payment_success.page"
    >
      {/* Card */}
      <div
        className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 sm:p-14 max-w-md w-full text-center"
        style={{ boxShadow: "0 8px 40px rgba(10,191,188,0.10)" }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#dcfce7" }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: "#16a34a" }} />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: "#0A1F44", fontFamily: "'DM Serif Display', serif" }}
        >
          Payment Successful!
        </h1>

        {/* Sub text */}
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          Your plan is now active. You'll receive a confirmation via WhatsApp
          shortly.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2"
            style={{ backgroundColor: "#0A1F44" }}
            data-ocid="payment_success.primary_button"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
          <a
            href="https://wa.me/919142345153"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2"
            style={{
              backgroundColor: "transparent",
              border: "2px solid #0ABFBC",
              color: "#0ABFBC",
            }}
            data-ocid="payment_success.secondary_button"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Mediverse branding */}
      <div className="mt-8 flex items-center gap-2 opacity-60">
        <svg
          width="18"
          height="18"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <rect x="9" y="0" width="4" height="22" rx="2" fill="#0ABFBC" />
          <rect x="0" y="9" width="22" height="4" rx="2" fill="#0ABFBC" />
        </svg>
        <span
          className="text-sm text-slate-400"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Mediverse
        </span>
      </div>
    </div>
  );
}
