import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../contexts/I18nContext";
import {
  createRateLimiter,
  detectMaliciousInput,
  sanitizeText,
} from "../utils/security";
import { sessionTracker } from "../utils/security";

interface ChatMessage {
  id: string;
  role: "user" | "misa";
  content: string;
  timestamp: Date;
}

const MISA_RESPONSES: Record<string, string> = {
  default:
    "I'd be happy to help! You can ask me about upcoming events, how to join sessions, networking tips, or anything about VirtX.",
  event:
    "We have exciting events coming up! The Global Tech Summit starts April 15, and the AI & ML Expo is on May 3. Would you like details on any of these?",
  recommend:
    "Based on popular interest, I recommend checking out the Global Tech Summit for networking, and the AI Expo for cutting-edge insights. Both have great speaker lineups!",
  ticket:
    "To purchase tickets, go to any event page and click 'Buy Ticket'. We support Stripe for secure payments. Free events are available too!",
  networking:
    "Our Networking Lounge lets you connect with attendees via AI-powered matching. Head to the Networking tab to find people with shared interests!",
  schedule:
    "You can view the full event schedule on each event's detail page. Use the calendar view to plan your sessions!",
  sponsor:
    "Our sponsors have virtual booths where you can explore products, download resources, and book live demos. Visit the Sponsors page!",
  help: "I can help you with: finding events, buying tickets, networking with attendees, navigating virtual rooms, understanding features, and more. What do you need?",
  vr: "VirtX supports VR integration! You can attend events in immersive virtual reality using compatible headsets. Check event details for VR session availability.",
  stream:
    "We support live streaming to YouTube, Facebook, and LinkedIn simultaneously. Hosts can set up streaming destinations in the event management panel.",
  language:
    "VirtX supports 10 languages: English, Spanish, French, German, Portuguese, Hindi, Japanese, Chinese, Arabic, and Italian. Switch languages in the navigation menu!",
  gamification:
    "Earn points by attending sessions, networking, visiting booths, and completing learning tracks. Check the Leaderboard to see your ranking!",
  analytics:
    "Event hosts get real-time analytics including attendance, engagement scores, session popularity, and feedback summaries. Access from your event dashboard.",
};

function getMisaResponse(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("event") ||
    lower.includes("conference") ||
    lower.includes("webinar")
  )
    return MISA_RESPONSES.event;
  if (
    lower.includes("recommend") ||
    lower.includes("suggest") ||
    lower.includes("best")
  )
    return MISA_RESPONSES.recommend;
  if (
    lower.includes("ticket") ||
    lower.includes("buy") ||
    lower.includes("purchase") ||
    lower.includes("price")
  )
    return MISA_RESPONSES.ticket;
  if (
    lower.includes("network") ||
    lower.includes("connect") ||
    lower.includes("meet")
  )
    return MISA_RESPONSES.networking;
  if (
    lower.includes("schedule") ||
    lower.includes("when") ||
    lower.includes("time") ||
    lower.includes("date")
  )
    return MISA_RESPONSES.schedule;
  if (
    lower.includes("sponsor") ||
    lower.includes("booth") ||
    lower.includes("exhib")
  )
    return MISA_RESPONSES.sponsor;
  if (
    lower.includes("help") ||
    lower.includes("how") ||
    lower.includes("what can")
  )
    return MISA_RESPONSES.help;
  if (
    lower.includes("vr") ||
    lower.includes("virtual reality") ||
    lower.includes("immersive")
  )
    return MISA_RESPONSES.vr;
  if (
    lower.includes("stream") ||
    lower.includes("youtube") ||
    lower.includes("facebook") ||
    lower.includes("linkedin")
  )
    return MISA_RESPONSES.stream;
  if (lower.includes("language") || lower.includes("translate"))
    return MISA_RESPONSES.language;
  if (
    lower.includes("point") ||
    lower.includes("badge") ||
    lower.includes("reward") ||
    lower.includes("leaderboard")
  )
    return MISA_RESPONSES.gamification;
  if (
    lower.includes("analytics") ||
    lower.includes("stats") ||
    lower.includes("insight")
  )
    return MISA_RESPONSES.analytics;
  return MISA_RESPONSES.default;
}

// Rate limiter: max 1 message per 1.5 seconds
const rateLimiter = createRateLimiter(1, 1500);

export function MisaWidget() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initGreeting = useCallback(() => {
    setMessages([
      {
        id: "0",
        role: "misa",
        content: t("misa_greeting"),
        timestamp: new Date(),
      },
    ]);
  }, [t]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initGreeting();
    }
  }, [isOpen, messages.length, initGreeting]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = () => {
    const rawInput = input.trim();
    if (!rawInput) return;

    // Rate limit check
    if (!rateLimiter()) {
      toast.warning("Please wait a moment before sending another message.");
      return;
    }

    // Malicious input detection
    if (detectMaliciousInput(rawInput)) {
      setInput("");
      sessionTracker.recordAction("message-blocked:xss-detected");
      toast.error("Message blocked for security reasons.");
      return;
    }

    // Sanitize before storing / processing
    const safeContent = sanitizeText(rawInput);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: safeContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const response = getMisaResponse(safeContent);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "misa",
          content: response,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-panel rounded-2xl w-80 sm:w-96 overflow-hidden card-glow"
            data-ocid="misa.panel"
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 p-4 border-b border-border/50"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.28 290 / 0.3), oklch(0.72 0.18 205 / 0.2))",
              }}
            >
              <div className="avatar-ring">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-chart-2 to-chart-1 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">Misa</p>
                <p className="text-xs text-muted-foreground">Virtual Guide</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="live-dot" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                data-ocid="misa.close_button"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {msg.role === "misa" && (
                    <div className="avatar-ring flex-shrink-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-chart-2 to-chart-1 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "btn-gradient text-white rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="avatar-ring flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-chart-2 to-chart-1 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={t("misa_placeholder")}
                className="flex-1 bg-secondary border-border/50 text-sm"
                data-ocid="misa.input"
                maxLength={500}
              />
              <Button
                size="icon"
                className="btn-gradient flex-shrink-0"
                onClick={sendMessage}
                disabled={!input.trim()}
                data-ocid="misa.submit_button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full flex items-center justify-center btn-gradient shadow-lg neon-glow-purple touch-target"
        aria-label="Open Misa AI Assistant"
        data-ocid="misa.open_modal_button"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
