import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  MessageCircle,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Settings,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const PARTICIPANTS = [
  {
    id: 1,
    name: "Alex Chen",
    initials: "AC",
    isSpeaking: true,
    isMuted: false,
  },
  {
    id: 2,
    name: "Sarah Kim",
    initials: "SK",
    isSpeaking: false,
    isMuted: true,
  },
  {
    id: 3,
    name: "Marcus Johnson",
    initials: "MJ",
    isSpeaking: false,
    isMuted: false,
  },
  {
    id: 4,
    name: "Priya Patel",
    initials: "PP",
    isSpeaking: false,
    isMuted: true,
  },
  {
    id: 5,
    name: "You",
    initials: "YO",
    isSpeaking: false,
    isMuted: false,
    isMe: true,
  },
  {
    id: 6,
    name: "David Miller",
    initials: "DM",
    isSpeaking: false,
    isMuted: true,
  },
];

const ROOM_NAMES: Record<string, string> = {
  "main-stage": "🎤 Main Stage",
  breakout: "👥 Breakout Sessions",
  networking: "🤝 Networking Lounge",
  expo: "🏢 Expo Hall",
};

export function VirtualRoomPage() {
  const params = useParams({ from: "/rooms/$id" });
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Alex Chen",
      content: "Welcome everyone to the main stage!",
      time: "2:00 PM",
    },
    {
      id: 2,
      sender: "Sarah Kim",
      content: "Excited to be here! 🚀",
      time: "2:01 PM",
    },
    {
      id: 3,
      sender: "Marcus J.",
      content: "Great turnout today.",
      time: "2:02 PM",
    },
  ]);

  const roomName = ROOM_NAMES[params.id] ?? `Room ${params.id}`;

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You",
        content: chatMsg.trim(),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    ]);
    setChatMsg("");
  };

  return (
    <div className="page-bg min-h-screen pt-16 flex flex-col">
      <div className="flex-1 flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-3">
            <Link to="/events" data-ocid="room.back.link">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <p className="font-display font-semibold text-sm">{roomName}</p>
              <div className="flex items-center gap-1.5">
                <span className="live-dot" />
                <span className="text-xs text-muted-foreground">
                  {PARTICIPANTS.length} participants
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            data-ocid="room.settings.button"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Video Grid */}
          <div
            className="flex-1 p-4 overflow-y-auto"
            data-ocid="room.canvas_target"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full">
              {PARTICIPANTS.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className={`glass-panel rounded-xl overflow-hidden relative aspect-video flex items-center justify-center ${
                    p.isSpeaking ? "ring-2 ring-primary" : ""
                  }`}
                  data-ocid={`room.participant.${i + 1}`}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.18 0.08 265), oklch(0.22 0.1 290))",
                    }}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-white font-bold text-xl">
                        {p.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-xs font-medium bg-card/70 rounded px-1.5 py-0.5 backdrop-blur-sm">
                      {p.name}
                    </span>
                    {p.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Sidebar */}
          {chatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border/30 flex flex-col glass-panel"
              data-ocid="room.chat.panel"
            >
              <div className="px-4 py-3 border-b border-border/30">
                <p className="text-sm font-semibold">Room Chat</p>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="text-xs">
                      <span className="font-semibold text-primary">
                        {msg.sender}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        {msg.time}
                      </span>
                      <p className="text-foreground/80 mt-0.5">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-border/30 flex gap-2">
                <Input
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Message..."
                  className="text-xs bg-secondary border-border/50"
                  data-ocid="room.chat.input"
                />
                <Button
                  size="sm"
                  className="btn-gradient"
                  onClick={sendChat}
                  data-ocid="room.chat.submit_button"
                >
                  Send
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Control Bar — safe-area-pb for notched devices, larger touch targets */}
        <div className="border-t border-border/30 px-4 py-3 flex items-center justify-center gap-3 safe-area-pb">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 sm:h-11 sm:w-11 border-border/50 ${
              isMuted ? "bg-destructive/20 border-destructive/50" : ""
            }`}
            onClick={() => setIsMuted((p) => !p)}
            data-ocid="room.mute.toggle"
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-destructive" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 sm:h-11 sm:w-11 border-border/50 ${
              !isCameraOn ? "bg-destructive/20 border-destructive/50" : ""
            }`}
            onClick={() => setIsCameraOn((p) => !p)}
            data-ocid="room.camera.toggle"
          >
            {isCameraOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5 text-destructive" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 sm:h-11 sm:w-11 border-border/50"
            data-ocid="room.screenshare.button"
          >
            <Monitor className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 sm:h-11 sm:w-11 border-border/50 ${
              chatOpen ? "bg-primary/20 border-primary/50" : ""
            }`}
            onClick={() => setChatOpen((p) => !p)}
            data-ocid="room.chat.toggle"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 sm:h-11 sm:w-11 border-border/50"
            data-ocid="room.participants.button"
          >
            <Users className="w-5 h-5" />
          </Button>
          <Link to="/events">
            <Button
              className="rounded-full h-12 sm:h-11 bg-destructive hover:bg-destructive/80 text-white px-6 sm:px-5"
              data-ocid="room.leave.button"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
