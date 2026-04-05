import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, UserPlus, Video } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../contexts/I18nContext";

const ATTENDEES = [
  {
    id: 1,
    name: "Alex Chen",
    role: "CTO",
    company: "TechCorp",
    initials: "AC",
    interests: ["AI", "Cloud", "Leadership"],
    connected: false,
    color: "from-chart-1 to-chart-2",
  },
  {
    id: 2,
    name: "Sarah Kim",
    role: "ML Engineer",
    company: "DataFlow",
    initials: "SK",
    interests: ["ML", "Python", "NLP"],
    connected: true,
    color: "from-chart-2 to-chart-3",
  },
  {
    id: 3,
    name: "Marcus Johnson",
    role: "Product Designer",
    company: "DesignLab",
    initials: "MJ",
    interests: ["UX", "Design Systems", "Typography"],
    connected: false,
    color: "from-chart-3 to-chart-1",
  },
  {
    id: 4,
    name: "Priya Patel",
    role: "DevRel Engineer",
    company: "CloudNine",
    initials: "PP",
    interests: ["Web3", "DevRel", "Docs"],
    connected: false,
    color: "from-chart-4 to-chart-2",
  },
  {
    id: 5,
    name: "David Miller",
    role: "Frontend Dev",
    company: "StartupX",
    initials: "DM",
    interests: ["React", "TypeScript", "Animation"],
    connected: true,
    color: "from-chart-5 to-chart-1",
  },
  {
    id: 6,
    name: "Emma Wilson",
    role: "Marketing Manager",
    company: "GrowthHQ",
    initials: "EW",
    interests: ["SEO", "Content", "Analytics"],
    connected: false,
    color: "from-chart-1 to-chart-4",
  },
  {
    id: 7,
    name: "Ryan Lee",
    role: "Blockchain Dev",
    company: "Web3Labs",
    initials: "RL",
    interests: ["Solidity", "DeFi", "NFTs"],
    connected: false,
    color: "from-chart-2 to-chart-5",
  },
  {
    id: 8,
    name: "Sofia Garcia",
    role: "Data Scientist",
    company: "InnovateCo",
    initials: "SG",
    interests: ["Python", "ML", "Visualization"],
    connected: false,
    color: "from-chart-3 to-chart-4",
  },
];

export function NetworkingPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [connections, setConnections] = useState<Set<number>>(new Set([2, 5]));
  const [filter, setFilter] = useState("all");

  const filtered = ATTENDEES.filter((a) => {
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "connected" && connections.has(a.id));
    return matchesSearch && matchesFilter;
  });

  const handleConnect = (id: number, name: string) => {
    if (connections.has(id)) return;
    setConnections((prev) => new Set([...prev, id]));
    toast.success(`Connected with ${name}!`);
  };

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title text-3xl mb-2">
            {t("section_networking")}
          </h1>
          <p className="text-muted-foreground text-sm">
            Connect with fellow attendees, industry leaders, and innovators.
          </p>
        </motion.div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Attendees", value: ATTENDEES.length.toString() },
            { label: "Your Connections", value: connections.size.toString() },
            { label: "AI Matches", value: "12" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-panel rounded-xl p-4 text-center card-glow"
            >
              <p className="text-2xl font-display font-bold gradient-text">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendees..."
              className="pl-9 bg-secondary border-border/50"
              data-ocid="networking.search_input"
            />
          </div>
          <div className="flex gap-2">
            {["all", "connected"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                className={`rounded-full text-xs capitalize ${filter === f ? "btn-gradient border-0" : "border-border/50"}`}
                onClick={() => setFilter(f)}
                data-ocid={`networking.filter.${f}.tab`}
              >
                {f === "all" ? "All Attendees" : "Connected"}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16" data-ocid="networking.empty_state">
            <p className="text-muted-foreground">No attendees found.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
              hidden: {},
            }}
          >
            {filtered.map((attendee, i) => (
              <motion.div
                key={attendee.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="glass-panel rounded-2xl p-4 card-glow flex flex-col gap-3"
                data-ocid={`networking.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="avatar-ring flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback
                        className={`bg-gradient-to-br ${attendee.color} text-white font-bold`}
                      >
                        {attendee.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {attendee.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {attendee.role}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {attendee.company}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {attendee.interests.slice(0, 3).map((interest) => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="text-[10px] rounded-full border-border/50 px-2"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    className={`flex-1 rounded-full text-xs ${connections.has(attendee.id) ? "bg-secondary border border-border/50 text-muted-foreground" : "btn-gradient"}`}
                    onClick={() => handleConnect(attendee.id, attendee.name)}
                    disabled={connections.has(attendee.id)}
                    data-ocid={`networking.connect_button.${i + 1}`}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    {connections.has(attendee.id)
                      ? "Connected"
                      : t("btn_connect")}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-8 w-8 border-border/50"
                    data-ocid={`networking.message_button.${i + 1}`}
                  >
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-8 w-8 border-border/50"
                    data-ocid={`networking.video_button.${i + 1}`}
                  >
                    <Video className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
