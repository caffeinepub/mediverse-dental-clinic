import { Link } from "@tanstack/react-router";
import { MessageCircle, RotateCcw, XCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919142345153";

export default function PaymentFailure() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundColor: "#F9FAFB",
        fontFamily: "'DM Sans', sans-serif",
      }}
      data-ocid="payment_failure.page"
    >
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 sm:p-14 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#fff7ed" }}
          >
            <XCircle className="w-10 h-10" style={{ color: "#ea580c" }} />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: "#0A1F44", fontFamily: "'DM Serif Display', serif" }}
        >
          Payment Cancelled
        </h1>

        {/* Sub text */}
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          Your payment was not completed. You can try again or contact us on
          WhatsApp.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/plans"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2"
            style={{ backgroundColor: "#0ABFBC" }}
            data-ocid="payment_failure.primary_button"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2"
            style={{
              backgroundColor: "transparent",
              border: "2px solid #0A1F44",
              color: "#0A1F44",
            }}
            data-ocid="payment_failure.secondary_button"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Us
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
