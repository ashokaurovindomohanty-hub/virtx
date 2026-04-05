import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Trophy,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EventCard } from "../components/EventCard";
import { useI18n } from "../contexts/I18nContext";
import { useGetAllEvents, useGetLeaderboard } from "../hooks/useQueries";

const ANALYTICS_DATA = [
  { name: "Mon", attendees: 320, sessions: 12 },
  { name: "Tue", attendees: 480, sessions: 18 },
  { name: "Wed", attendees: 390, sessions: 14 },
  { name: "Thu", attendees: 720, sessions: 22 },
  { name: "Fri", attendees: 850, sessions: 28 },
  { name: "Sat", attendees: 640, sessions: 20 },
  { name: "Sun", attendees: 420, sessions: 15 },
];

const NETWORKING_PROFILES = [
  {
    name: "Alex Chen",
    role: "CTO at TechCorp",
    initials: "AC",
    color: "from-chart-1 to-chart-2",
  },
  {
    name: "Sarah Kim",
    role: "ML Engineer",
    initials: "SK",
    color: "from-chart-2 to-chart-3",
  },
  {
    name: "Marcus J.",
    role: "Product Designer",
    initials: "MJ",
    color: "from-chart-3 to-chart-1",
  },
  {
    name: "Priya Patel",
    role: "DevRel Engineer",
    initials: "PP",
    color: "from-chart-4 to-chart-2",
  },
];

const VIRTUAL_ROOMS = [
  {
    id: "main-stage",
    label: "Main Stage",
    icon: "🎤",
    img: "/assets/generated/virtual-room-main.dim_600x400.jpg",
    live: true,
  },
  {
    id: "breakout",
    label: "Breakout Sessions",
    icon: "👥",
    img: "https://picsum.photos/seed/breakout/300/200",
    live: false,
  },
  {
    id: "networking",
    label: "Networking Lounge",
    icon: "🤝",
    img: "https://picsum.photos/seed/networking/300/200",
    live: true,
  },
  {
    id: "expo",
    label: "Expo Hall",
    icon: "🏢",
    img: "https://picsum.photos/seed/expo/300/200",
    live: false,
  },
];

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function HomePage() {
  const { t } = useI18n();
  const { data: events = [] } = useGetAllEvents();
  const { data: leaderboard = [] } = useGetLeaderboard();
  const [eventsPage, setEventsPage] = useState(0);

  const pageSize = 3;
  const totalPages = Math.ceil(events.length / pageSize);
  const pagedEvents = events.slice(
    eventsPage * pageSize,
    (eventsPage + 1) * pageSize,
  );

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-10">
            {/* Hero */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                  <span className="live-dot" />
                  <span className="text-xs font-medium text-primary">
                    Live Events Happening Now
                  </span>
                </div>
                <h1
                  className="font-display font-extrabold leading-tight"
                  style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                >
                  <span className="gradient-text">{t("hero_title")}</span>
                </h1>
                <p className="text-base text-muted-foreground max-w-lg">
                  {t("hero_subtitle")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/events">
                    <Button
                      className="btn-gradient rounded-full px-6 font-semibold"
                      data-ocid="hero.explore_events.button"
                    >
                      {t("btn_explore_events")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/admin">
                    <Button
                      variant="outline"
                      className="rounded-full px-6 border-border/50 bg-secondary/40 hover:bg-secondary"
                      data-ocid="hero.host_event.button"
                    >
                      {t("btn_host_event")}
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  {[
                    { value: "50K+", label: "Attendees" },
                    { value: "200+", label: "Events" },
                    { value: "98%", label: "Satisfaction" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="font-display font-bold text-lg gradient-text">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ boxShadow: "0 0 60px oklch(0.55 0.24 290 / 0.2)" }}
                >
                  <img
                    src="/assets/generated/virtx-hero.dim_1200x600.jpg"
                    alt="VirtX virtual event platform"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 glass-panel rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="live-dot" />
                    <span className="text-xs font-medium">3 live sessions</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Featured Events */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title">
                  {t("section_featured_events")}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-border/50"
                    onClick={() => setEventsPage((p) => Math.max(0, p - 1))}
                    disabled={eventsPage === 0}
                    data-ocid="events.pagination_prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-border/50"
                    onClick={() =>
                      setEventsPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={eventsPage >= totalPages - 1}
                    data-ocid="events.pagination_next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagedEvents.map((event, i) => (
                  <motion.div
                    key={event.id.toString()}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <EventCard event={event} index={i + 1} />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Virtual Rooms */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title">{t("section_virtual_rooms")}</h2>
                <Link to="/rooms/$id" params={{ id: "main-stage" }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-xs"
                    data-ocid="rooms.view_all.button"
                  >
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {VIRTUAL_ROOMS.map((room, i) => (
                  <Link key={room.id} to="/rooms/$id" params={{ id: room.id }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                      className="glass-panel rounded-xl overflow-hidden card-glow hover:-translate-y-1 transition-transform cursor-pointer"
                      data-ocid={`rooms.item.${i + 1}`}
                    >
                      <div className="relative h-28 bg-secondary">
                        <img
                          src={room.img}
                          alt={room.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                        <div className="absolute top-2 right-2 text-lg">
                          {room.icon}
                        </div>
                        {room.live && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/20 border border-red-400/30 rounded-full px-1.5 py-0.5">
                            <span
                              className="live-dot"
                              style={{ width: 6, height: 6 }}
                            />
                            <span className="text-[10px] font-bold text-red-400">
                              LIVE
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-foreground">
                          {room.label}
                        </p>
                        {room.live && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Active session
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* Networking Strip */}
            <section className="glass-panel rounded-2xl p-4 card-glow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">
                  {t("section_networking")}
                </h3>
                <Link to="/networking">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary h-7 px-2"
                  >
                    See All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {NETWORKING_PROFILES.map((profile, i) => (
                  <div
                    key={profile.name}
                    className="flex items-center gap-3"
                    data-ocid={`networking.item.${i + 1}`}
                  >
                    <div className="avatar-ring flex-shrink-0">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback
                          className={`bg-gradient-to-br ${profile.color} text-white text-xs font-bold`}
                        >
                          {profile.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {profile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {profile.role}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="btn-gradient rounded-full h-7 text-xs px-3"
                      data-ocid={`networking.connect_button.${i + 1}`}
                    >
                      {t("btn_connect")}
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Leaderboard */}
            <section className="glass-panel rounded-2xl p-4 card-glow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  {t("section_leaderboard")}
                </h3>
                <Link to="/leaderboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary h-7 px-2"
                  >
                    Full List
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map(([principal, name, points], i) => (
                  <div
                    key={principal.toString()}
                    className="flex items-center gap-3 py-1.5"
                    data-ocid={`leaderboard.item.${i + 1}`}
                  >
                    <div className="w-6 text-center">
                      {i < 3 ? (
                        <span className="text-base">{MEDALS[i + 1]}</span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-white text-[10px] font-bold">
                        {name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-xs font-medium truncate">
                      {name}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {points.toString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Analytics Mini */}
            <section className="glass-panel rounded-2xl p-4 card-glow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-chart-1" />
                  {t("section_analytics")}
                </h3>
                <Link to="/analytics">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary h-7 px-2"
                  >
                    Details
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  {
                    label: "Attendees",
                    value: "12,480",
                    icon: <Users className="w-3 h-3" />,
                    color: "text-chart-1",
                  },
                  {
                    label: "Sessions",
                    value: "89%",
                    icon: <Zap className="w-3 h-3" />,
                    color: "text-chart-2",
                  },
                  {
                    label: "Engagement",
                    value: "94/100",
                    icon: <TrendingUp className="w-3 h-3" />,
                    color: "text-chart-3",
                  },
                  {
                    label: "Networking",
                    value: "3,240",
                    icon: <Wifi className="w-3 h-3" />,
                    color: "text-chart-4",
                  },
                ].map((metric) => (
                  <div key={metric.label} className="metric-card p-2.5">
                    <div
                      className={`flex items-center gap-1 ${metric.color} mb-1`}
                    >
                      {metric.icon}
                      <span className="text-[10px]">{metric.label}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={ANALYTICS_DATA}>
                  <Line
                    type="monotone"
                    dataKey="attendees"
                    stroke="oklch(0.72 0.18 205)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.055 265)",
                      border: "1px solid oklch(1 0 0 / 0.1)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
