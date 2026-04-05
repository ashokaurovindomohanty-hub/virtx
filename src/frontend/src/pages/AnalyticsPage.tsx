import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, TrendingUp, Users, Wifi, Zap } from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "../contexts/I18nContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const DAILY_DATA = [
  { day: "Apr 1", attendees: 240, sessions: 8, engagement: 72 },
  { day: "Apr 2", attendees: 380, sessions: 12, engagement: 81 },
  { day: "Apr 3", attendees: 520, sessions: 16, engagement: 87 },
  { day: "Apr 4", attendees: 490, sessions: 14, engagement: 84 },
  { day: "Apr 5", attendees: 760, sessions: 22, engagement: 92 },
  { day: "Apr 6", attendees: 840, sessions: 26, engagement: 94 },
  { day: "Apr 7", attendees: 620, sessions: 18, engagement: 89 },
];

const SESSION_DATA = [
  { name: "Main Stage", viewers: 1240 },
  { name: "Breakout 1", viewers: 380 },
  { name: "Breakout 2", viewers: 420 },
  { name: "Workshop A", viewers: 290 },
  { name: "Networking", viewers: 560 },
];

const DEVICE_DATA = [
  { name: "Desktop", value: 62, color: "oklch(0.72 0.18 205)" },
  { name: "Mobile", value: 28, color: "oklch(0.6 0.28 290)" },
  { name: "Tablet", value: 10, color: "oklch(0.7 0.3 320)" },
];

const TOOLTIPSTYLE = {
  contentStyle: {
    background: "oklch(0.16 0.055 265)",
    border: "1px solid oklch(1 0 0 / 0.1)",
    borderRadius: 8,
    fontSize: 11,
    color: "oklch(0.94 0.015 265)",
  },
};

export function AnalyticsPage() {
  const { t } = useI18n();
  const { identity, login } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="page-bg min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center glass-panel rounded-2xl p-8 max-w-sm">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl mb-2">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to view your event analytics.
          </p>
          <Button
            className="btn-gradient rounded-full w-full"
            onClick={() => login()}
            data-ocid="analytics.login.button"
          >
            {t("btn_login")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title text-3xl mb-1">
            {t("section_analytics")}
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time insights for your events.
          </p>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Attendees",
              value: "12,480",
              change: "+18%",
              icon: <Users className="w-5 h-5" />,
              color: "text-chart-1",
            },
            {
              label: "Session Attendance",
              value: "89%",
              change: "+4%",
              icon: <Eye className="w-5 h-5" />,
              color: "text-chart-2",
            },
            {
              label: "Engagement Score",
              value: "94/100",
              change: "+2pts",
              icon: <Zap className="w-5 h-5" />,
              color: "text-chart-3",
            },
            {
              label: "Networking Activity",
              value: "3,240",
              change: "+31%",
              icon: <Wifi className="w-5 h-5" />,
              color: "text-chart-4",
            },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-panel rounded-xl p-4 card-glow"
              data-ocid={`analytics.metric.${i + 1}`}
            >
              <div className={`flex items-center gap-2 ${metric.color} mb-2`}>
                {metric.icon}
                <span className="text-xs">{metric.label}</span>
              </div>
              <p className="text-2xl font-display font-bold">{metric.value}</p>
              <p className="text-xs text-chart-4 mt-1">
                {metric.change} vs last week
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Chart */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 card-glow">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-chart-1" />
              Daily Attendance (This Week)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={DAILY_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(1 0 0 / 0.05)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "oklch(0.62 0.05 265)" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.62 0.05 265)" }} />
                <Tooltip {...TOOLTIPSTYLE} />
                <Line
                  type="monotone"
                  dataKey="attendees"
                  stroke="oklch(0.72 0.18 205)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="oklch(0.6 0.28 290)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Device Distribution */}
          <div className="glass-panel rounded-2xl p-5 card-glow">
            <h3 className="text-sm font-semibold mb-4">Device Distribution</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={DEVICE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {DEVICE_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIPSTYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {DEVICE_DATA.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Bar Chart */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 card-glow">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-chart-2" />
              Session Viewers
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={SESSION_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(1 0 0 / 0.05)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "oklch(0.62 0.05 265)" }}
                />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.62 0.05 265)" }} />
                <Tooltip {...TOOLTIPSTYLE} />
                <Bar
                  dataKey="viewers"
                  fill="oklch(0.6 0.28 290)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="glass-panel rounded-2xl p-5 card-glow">
            <h3 className="text-sm font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Avg Session Duration", value: "42 min" },
                { label: "Booth Visits", value: "1,840" },
                { label: "Chat Messages", value: "5,620" },
                { label: "Feedback Collected", value: "287" },
                { label: "New Connections", value: "1,124" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
