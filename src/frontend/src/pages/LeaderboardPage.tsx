import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "../contexts/I18nContext";
import { useGetLeaderboard } from "../hooks/useQueries";

const MEDALS: Record<number, { emoji: string; bg: string }> = {
  1: { emoji: "🥇", bg: "from-yellow-400/20 to-yellow-600/10" },
  2: { emoji: "🥈", bg: "from-slate-300/20 to-slate-500/10" },
  3: { emoji: "🥉", bg: "from-orange-400/20 to-orange-600/10" },
};

const AVATAR_COLORS = [
  "from-chart-1 to-chart-2",
  "from-chart-2 to-chart-3",
  "from-chart-3 to-chart-1",
  "from-chart-4 to-chart-2",
  "from-chart-5 to-chart-1",
  "from-chart-1 to-chart-4",
  "from-chart-2 to-chart-5",
  "from-chart-3 to-chart-4",
];

export function LeaderboardPage() {
  const { t } = useI18n();
  const { data: leaderboard = [] } = useGetLeaderboard();

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.18 205 / 0.2), oklch(0.55 0.28 290 / 0.2))",
            }}
          >
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="section-title text-3xl">{t("section_leaderboard")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Top performers earning rewards through active participation.
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((rank) => {
            const entry = leaderboard[rank];
            if (!entry) return <div key={rank} />;
            const [principal, name, points] = entry;
            const pos = rank + 1;
            const medal = MEDALS[pos];
            return (
              <motion.div
                key={principal.toString()}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1 }}
                className={`glass-panel rounded-2xl p-4 text-center card-glow bg-gradient-to-b ${medal.bg} ${
                  rank === 0 ? "transform scale-105" : ""
                }`}
                data-ocid={`leaderboard.podium.${pos}`}
              >
                <div className="text-3xl mb-2">{medal.emoji}</div>
                <div className="avatar-ring inline-block mb-2">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback
                      className={`bg-gradient-to-br ${AVATAR_COLORS[rank]} text-white font-bold text-lg`}
                    >
                      {name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs font-bold gradient-text mt-1">
                  {points.toString()} pts
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Full List */}
        <div
          className="glass-panel rounded-2xl overflow-hidden card-glow"
          data-ocid="leaderboard.table"
        >
          {leaderboard.map(([principal, name, points], i) => (
            <motion.div
              key={principal.toString()}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-4 px-5 py-3.5 border-b border-border/30 last:border-0 ${
                i < 3 ? "bg-gradient-to-r from-primary/5 to-transparent" : ""
              }`}
              data-ocid={`leaderboard.item.${i + 1}`}
            >
              <div className="w-8 text-center flex-shrink-0">
                {i < 3 ? (
                  <span className="text-xl">{MEDALS[i + 1].emoji}</span>
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                )}
              </div>
              <div className="avatar-ring flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className={`bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white font-bold text-sm`}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">
                  #{principal.toString().slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-primary">
                  {points.toString()}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("label_points")}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
