import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Users } from "lucide-react";
import type { Event } from "../backend.d";
import { useI18n } from "../contexts/I18nContext";

const EVENT_TYPE_COLORS: Record<string, string> = {
  Conference: "text-chart-1 bg-chart-1/10 border-chart-1/20",
  Webinar: "text-chart-2 bg-chart-2/10 border-chart-2/20",
  Workshop: "text-chart-3 bg-chart-3/10 border-chart-3/20",
  Meetup: "text-chart-4 bg-chart-4/10 border-chart-4/20",
  "Trade Show": "text-chart-5 bg-chart-5/10 border-chart-5/20",
};

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 1 }: EventCardProps) {
  const { t } = useI18n();
  const typeColorClass =
    EVENT_TYPE_COLORS[event.eventType] ??
    "text-muted-foreground bg-muted/10 border-muted/20";
  const isLive = event.status === "live";

  return (
    <div
      className="glass-panel rounded-2xl overflow-hidden card-glow flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-glow"
      data-ocid={`events.item.${index}`}
    >
      {/* Banner */}
      <div className="relative h-40 overflow-hidden bg-secondary">
        <img
          src={
            event.bannerImage ||
            `https://picsum.photos/seed/${event.id}/400/200`
          }
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 rounded-full px-2 py-0.5">
              <span className="live-dot" />
              <span className="text-xs font-bold text-red-400">
                {t("label_live")}
              </span>
            </div>
          )}
          <Badge
            className={`text-xs border rounded-full px-2 py-0.5 ${typeColorClass}`}
            variant="outline"
          >
            {event.eventType}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-display font-semibold text-foreground line-clamp-2 leading-snug">
          {event.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(event.startDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {Math.floor(Math.random() * 800 + 200)} registered
          </span>
        </div>

        <Link to="/events/$id" params={{ id: event.id.toString() }}>
          <Button
            className="w-full btn-gradient rounded-full text-sm font-medium"
            data-ocid={`events.view_button.${index}`}
          >
            {t("btn_view_details")}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
