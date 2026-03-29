import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
  buttons?: { label: string; action: string }[];
};

const BOT_RESPONSES: Record<
  string,
  { text: string; buttons?: { label: string; action: string }[] }
> = {
  greeting: {
    text: "Hello! Welcome to Mediverse Dental Clinic. How can I help you today?",
    buttons: [
      { label: "📅 Book Appointment", action: "appointment" },
      { label: "🦷 Our Services", action: "services" },
      { label: "📍 Clinic Details", action: "clinic" },
    ],
  },
  appointment: {
    text: "You can book an appointment easily! Scroll to the 'Book Appointment' section on our homepage, fill in your details and preferred service, then click Submit. We'll confirm your booking via WhatsApp.\n\nWorking hours: 9 AM – 7 PM.",
    buttons: [
      { label: "📅 Book Now", action: "scroll_booking" },
      { label: "🏠 Back to Menu", action: "menu" },
    ],
  },
  services: {
    text: "We offer the following dental services:\n\n🦷 Teeth Cleaning – Professional scaling & polishing\n🔬 Root Canal – Pain-free infection treatment\n😁 Braces – Metal & ceramic alignment\n🔩 Dental Implants – Permanent tooth replacement\n✨ Teeth Whitening – Professional brightening\n\nAll treatments by certified specialists.",
    buttons: [
      { label: "📅 Book Appointment", action: "scroll_booking" },
      { label: "🏠 Back to Menu", action: "menu" },
    ],
  },
  clinic: {
    text: "📍 V-466, Central School Rd, Jogipur, Kankarbagh, Patna, Bihar 800020\n\n📞 +91 9142345153\n\n🕐 Mon–Sat: 9:00 AM – 7:00 PM\n\nFeel free to call or WhatsApp us!",
    buttons: [
      { label: "💬 Contact via WhatsApp", action: "contact" },
      { label: "🏠 Back to Menu", action: "menu" },
    ],
  },
  contact: {
    text: "Reach us at:\n\n📞 Call: +91 9142345153\n💬 WhatsApp: +91 9142345153\n\nAvailable 9 AM – 7 PM. WhatsApp is the fastest way to reach us!",
    buttons: [{ label: "🏠 Back to Menu", action: "menu" }],
  },
  menu: {
    text: "How can I assist you?",
    buttons: [
      { label: "📅 Book Appointment", action: "appointment" },
      { label: "🦷 Our Services", action: "services" },
      { label: "📍 Clinic Details", action: "clinic" },
    ],
  },
  fallback: {
    text: "I'm not sure I understood that. Please choose an option below or call us at +91 9142345153.",
    buttons: [
      { label: "📅 Book Appointment", action: "appointment" },
      { label: "🦷 Our Services", action: "services" },
      { label: "📍 Clinic Details", action: "clinic" },
    ],
  },
};

function getBotResponse(input: string) {
  const text = input.toLowerCase().trim();
  if (
    /\b(hi|hello|hey|good morning|good afternoon|good evening|start|help)\b/.test(
      text,
    )
  )
    return BOT_RESPONSES.greeting;
  if (
    /\b(appointment|book|booking|schedule|visit|timing|time|slot|available)\b/.test(
      text,
    )
  )
    return BOT_RESPONSES.appointment;
  if (
    /\b(service|services|treatment|cleaning|root canal|braces|implant|whitening|teeth|dental)\b/.test(
      text,
    )
  )
    return BOT_RESPONSES.services;
  if (
    /\b(address|location|where|map|clinic|hours|open|working|timing)\b/.test(
      text,
    )
  )
    return BOT_RESPONSES.clinic;
  if (/\b(contact|phone|call|number|whatsapp|reach)\b/.test(text))
    return BOT_RESPONSES.contact;
  return BOT_RESPONSES.fallback;
}

let msgId = 0;
const nextId = () => {
  msgId += 1;
  return msgId;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/typing change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcome = BOT_RESPONSES.greeting;
      setMessages([
        {
          id: nextId(),
          text: welcome.text,
          sender: "bot",
          buttons: welcome.buttons,
        },
      ]);
    }
  };

  const addBotMessage = (response: (typeof BOT_RESPONSES)[string]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          text: response.text,
          sender: "bot",
          buttons: response.buttons,
        },
      ]);
    }, 800);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: nextId(), text, sender: "user" }]);
    setInputValue("");
    addBotMessage(getBotResponse(text));
  };

  const handleButtonClick = (action: string) => {
    if (action === "scroll_booking") {
      setIsOpen(false);
      setTimeout(() => {
        document
          .getElementById("booking")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return;
    }
    if (action === "contact") {
      window.open("https://wa.me/919142345153", "_blank");
      return;
    }
    const labels: Record<string, string> = {
      appointment: "Book Appointment",
      services: "Our Services",
      clinic: "Clinic Details",
      menu: "Menu",
    };
    const userText = labels[action] ?? action;
    setMessages((prev) => [
      ...prev,
      { id: nextId(), text: userText, sender: "user" },
    ]);
    addBotMessage(BOT_RESPONSES[action] ?? BOT_RESPONSES.fallback);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend(inputValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#0EA5E9";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(14,165,233,0.2)";
  };

  const hoverIn = (e: React.MouseEvent<HTMLButtonElement>, bg: string) => {
    e.currentTarget.style.background = bg;
  };
  const hoverOut = (e: React.MouseEvent<HTMLButtonElement>, bg: string) => {
    e.currentTarget.style.background = bg;
  };

  return (
    <div
      className="fixed z-[9999] flex flex-col items-end"
      style={{
        bottom: 20,
        right: 24,
        fontFamily: "'Poppins', system-ui, sans-serif",
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-3 flex flex-col rounded-3xl shadow-2xl overflow-hidden"
          style={{
            width: "clamp(300px, 90vw, 360px)",
            height: "clamp(420px, 70vh, 520px)",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(14,165,233,0.2)",
            boxShadow: "0 20px 60px rgba(14,165,233,0.2)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 38,
                  height: 38,
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                <span style={{ fontSize: 20 }}>🦷</span>
              </div>
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  Mediverse Assistant
                </p>
                <p style={{ color: "#bae6fd", fontSize: 11, margin: 0 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#4ade80",
                      marginRight: 4,
                      verticalAlign: "middle",
                    }}
                  />
                  Online 24/7
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                width: 28,
                height: 28,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3"
            style={{
              background: "rgba(248,250,252,0.8)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "9px 13px",
                    borderRadius:
                      msg.sender === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.sender === "user"
                        ? "linear-gradient(135deg, #0EA5E9, #6366F1)"
                        : "rgba(255,255,255,0.9)",
                    color: msg.sender === "user" ? "#fff" : "#1e293b",
                    fontSize: 13,
                    lineHeight: 1.5,
                    boxShadow: "0 2px 8px rgba(14,165,233,0.1)",
                    whiteSpace: "pre-line",
                    border:
                      msg.sender === "bot"
                        ? "1px solid rgba(14,165,233,0.15)"
                        : "none",
                  }}
                >
                  {msg.text}
                </div>
                {msg.buttons && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 6,
                      maxWidth: "85%",
                    }}
                  >
                    {msg.buttons.map((btn) => (
                      <button
                        type="button"
                        key={btn.action}
                        onClick={() => handleButtonClick(btn.action)}
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          border: "1.5px solid #0EA5E9",
                          color: "#0EA5E9",
                          borderRadius: 20,
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => hoverIn(e, "#0EA5E9")}
                        onMouseLeave={(e) =>
                          hoverOut(e, "rgba(255,255,255,0.9)")
                        }
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(14,165,233,0.15)",
                    borderRadius: "18px 18px 18px 4px",
                    padding: "10px 14px",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                    boxShadow: "0 2px 8px rgba(14,165,233,0.1)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#0EA5E9",
                        display: "inline-block",
                        animation: "bounce 1.2s infinite",
                        animationDelay: `${i * 0.2}s`,
                        opacity: 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid rgba(14,165,233,0.1)",
              padding: "10px 12px",
              display: "flex",
              gap: 8,
              background: "rgba(255,255,255,0.95)",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{
                flex: 1,
                border: "1.5px solid rgba(14,165,233,0.2)",
                borderRadius: 20,
                padding: "8px 14px",
                fontSize: 13,
                outline: "none",
                color: "#1e293b",
                background: "rgba(248,250,252,0.8)",
                fontFamily: "inherit",
              }}
            />
            <button
              type="button"
              onClick={() => handleSend(inputValue)}
              aria-label="Send message"
              onMouseEnter={(e) => hoverIn(e, "#0284c7")}
              onMouseLeave={(e) => hoverOut(e, "#0EA5E9")}
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "opacity 0.15s",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
                aria-label="Send"
                role="img"
              >
                <title>Send</title>
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button — positioned above WhatsApp button */}
      <button
        type="button"
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        style={{
          background: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(14,165,233,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
          position: "relative",
          marginBottom: 72 /* keeps chatbot above whatsapp button (24px bottom + 56px button + gap) */,
        }}
        title="Chat with us"
      >
        {isOpen ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="white"
            aria-label="Close chat"
            role="img"
          >
            <title>Close chat</title>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
            aria-label="Open chat"
            role="img"
          >
            <title>Open chat</title>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
        {!isOpen && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 14,
              height: 14,
              background: "#4ade80",
              borderRadius: "50%",
              border: "2px solid #fff",
            }}
          />
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
