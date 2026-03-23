// ═══════════════════════════════════════════════════════
// HEALTHBOT AI CHATBOT
// ═══════════════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";

const QUICK = [
  "How do I upload records?",
  "Share with a doctor?",
  "Is my data secure?",
  "Free plan details?"
];

export default function ChatBot() {

  const [open, setOpen] = useState(false);

  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "👋 Hi! I'm HealthBot. Ask me anything about Health Hub History!" }
  ]);

  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);

  const [showQuick, setShowQuick] = useState(true);

  const endRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [open, msgs]);

  const send = async (txt) => {

    const msg = (txt || inp).trim();

    if (!msg || loading) return;

    setInp("");

    const next = [...msgs, { role: "user", content: msg }];
    setMsgs(next);

    setLoading(true);

    try {

      const res = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: msg })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      setMsgs((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Sorry, I couldn't understand that."
        }
      ]);

    } catch {

      setMsgs((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Connection issue. Please retry."
        }
      ]);

    }

    setLoading(false);

    // show suggestions again after response
    setShowQuick(true);
  };

  return (
    <>

      {/* Floating Button */}
      <button
        className="hh-chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="HealthBot AI"
      >
        {open ? "✕" : "🤖"}
      </button>


      {/* Chat Panel */}
      {open && (
        <div className="hh-chat-panel">

          {/* Header */}
          <div
            style={{
              padding: "12px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center"
            }}
          >
            <div style={{ fontWeight: 700 }}>
              HealthBot AI
            </div>

            <div
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: "#22c55e"
              }}
            >
              ● Online
            </div>
          </div>


          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 260,
              maxHeight: 320
            }}
          >

            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: 14,
                  fontSize: 13,
                  background:
                    m.role === "user"
                      ? "linear-gradient(135deg,#00d4ff,#8b6fff)"
                      : "var(--card)",
                  color: m.role === "user" ? "#fff" : "var(--text)"
                }}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)"
                }}
              >
                HealthBot is typing...
              </div>
            )}

            <div ref={endRef} />

          </div>


          {/* Quick Questions */}
          {showQuick && (
            <div
              style={{
                padding: "10px",
                display: "flex",
                flexWrap: "wrap",
                gap: 8
              }}
            >

              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  style={{
                    fontSize: 12,
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "1px solid rgba(0,207,255,0.35)",
                    background: "rgba(0,207,255,0.08)",
                    color: "#dbeafe",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s"
                  }}

                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,207,255,0.18)";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "#00cfff";
                  }}

                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0,207,255,0.08)";
                    e.currentTarget.style.color = "#dbeafe";
                    e.currentTarget.style.borderColor = "rgba(0,207,255,0.35)";
                  }}
                >
                  {q}
                </button>
              ))}

            </div>
          )}


          {/* Input */}
          <div
            style={{
              padding: 10,
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 8
            }}
          >

            <input
              className="hh-input"
              value={inp}
              onChange={(e) => {
                const value = e.target.value;
                setInp(value);

                // hide suggestions when user starts typing
                if (value.length > 0) {
                  setShowQuick(false);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything..."
              disabled={loading}
              style={{ flex: 1 }}
            />

            <button
              onClick={() => send()}
              disabled={!inp.trim() || loading}
              className="hh-btn hh-btn-primary"
            >
              Send
            </button>

          </div>

        </div>
      )}

    </>
  );
}