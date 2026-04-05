import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Event } from "../backend.d";
import { EventCard } from "../components/EventCard";
import { useI18n } from "../contexts/I18nContext";
import { useGetAllEvents } from "../hooks/useQueries";

const EVENT_TYPES = [
  "All",
  "Conference",
  "Webinar",
  "Workshop",
  "Meetup",
  "Trade Show",
];

export function EventsPage() {
  const { t } = useI18n();
  const { data: events = [], isLoading } = useGetAllEvents();
  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");

  const filtered: Event[] = events.filter((event) => {
    const matchesType = activeType === "All" || event.eventType === activeType;
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title text-3xl mb-2">
            {t("section_featured_events")}
          </h1>
          <p className="text-muted-foreground text-sm">
            Discover and join virtual events from around the world.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="pl-9 bg-secondary border-border/50"
              data-ocid="events.search_input"
            />
          </div>
          <Tabs value={activeType} onValueChange={setActiveType}>
            <TabsList className="bg-secondary border border-border/50">
              {EVENT_TYPES.map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="text-xs data-[state=active]:btn-gradient data-[state=active]:text-white"
                  data-ocid={`events.filter.${type.toLowerCase().replace(/\s/g, "_")}.tab`}
                >
                  {type === "All" ? t("label_all") : type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="events.loading_state"
          >
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((sk) => (
              <div
                key={sk}
                className="glass-panel rounded-2xl h-72 skeleton-shimmer"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 glass-panel rounded-2xl"
            data-ocid="events.empty_state"
          >
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-muted-foreground">
              No events match your filters.
            </p>
            <Button
              className="mt-4 btn-gradient rounded-full"
              onClick={() => {
                setActiveType("All");
                setSearch("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
              hidden: {},
            }}
          >
            {filtered.map((event, i) => (
              <motion.div
                key={event.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <EventCard event={event} index={i + 1} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
