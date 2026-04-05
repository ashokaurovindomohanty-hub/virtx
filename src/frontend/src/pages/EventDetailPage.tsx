import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  ExternalLink,
  Loader2,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../contexts/I18nContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCheckoutSession,
  useGetAllEvents,
  useGetBoothsForEvent,
  useGetEventFeedback,
  useGetTiersForEvent,
  useSubmitFeedback,
} from "../hooks/useQueries";

function formatDate(ts: bigint): string {
  return new Date(Number(ts)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const SAMPLE_TIERS = [
  {
    id: 1n,
    eventId: 1n,
    name: "General Admission",
    price: 0n,
    sold: 312n,
    available: 1000n,
  },
  {
    id: 2n,
    eventId: 1n,
    name: "VIP Access",
    price: 4900n,
    sold: 45n,
    available: 100n,
  },
  {
    id: 3n,
    eventId: 1n,
    name: "Workshop Bundle",
    price: 9900n,
    sold: 18n,
    available: 50n,
  },
];

export function EventDetailPage() {
  const params = useParams({ from: "/events/$id" });
  const { t } = useI18n();
  const { identity } = useInternetIdentity();
  const { data: events = [] } = useGetAllEvents();
  const event = events.find((e) => e.id.toString() === params.id);
  const { data: booths = [] } = useGetBoothsForEvent(event?.id);
  const { data: feedback = [] } = useGetEventFeedback(event?.id);
  const { data: tiers = [] } = useGetTiersForEvent(event?.id);
  const checkout = useCreateCheckoutSession();
  const submitFeedback = useSubmitFeedback();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const displayTiers = tiers.length > 0 ? tiers : SAMPLE_TIERS;

  const handleBuyTicket = (tier: (typeof SAMPLE_TIERS)[0]) => {
    if (!identity) {
      toast.error("Please login to purchase tickets.");
      return;
    }
    checkout.mutate({
      items: [
        {
          productName: `${event?.title} - ${tier.name}`,
          productDescription: event?.description ?? "",
          quantity: 1n,
          priceInCents: tier.price,
          currency: "usd",
        },
      ],
      successUrl: `${window.location.origin}/events/${event?.id}?success=1`,
      cancelUrl: `${window.location.origin}/events/${event?.id}?cancel=1`,
    });
  };

  const handleSubmitFeedback = () => {
    if (!identity || !event) {
      toast.error("Please login to submit feedback.");
      return;
    }
    submitFeedback.mutate(
      {
        id: 0n,
        eventId: event.id,
        userId: identity.getPrincipal(),
        rating: BigInt(rating),
        comment,
      },
      {
        onSuccess: () => {
          toast.success("Feedback submitted!");
          setComment("");
          setRating(5);
        },
      },
    );
  };

  if (!event) {
    return (
      <div className="page-bg min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">🔍</p>
          <p className="text-muted-foreground">Event not found.</p>
          <Link to="/events">
            <Button className="mt-4 btn-gradient rounded-full">
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLive = event.status === "live";

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group"
          data-ocid="event_detail.back.link"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </Link>

        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-56 sm:h-72">
          <img
            src={
              event.bannerImage ||
              `https://picsum.photos/seed/${event.id}/800/300`
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {isLive && (
                <Badge className="bg-red-500/20 border border-red-400/30 text-red-400 rounded-full">
                  <span className="live-dot mr-1" />
                  {t("label_live")}
                </Badge>
              )}
              <Badge className="btn-gradient text-white rounded-full">
                {event.eventType}
              </Badge>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <Tabs defaultValue="overview">
              <TabsList className="bg-secondary border border-border/50 mb-6">
                <TabsTrigger
                  value="overview"
                  data-ocid="event_detail.overview.tab"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="sponsors"
                  data-ocid="event_detail.sponsors.tab"
                >
                  Sponsors
                </TabsTrigger>
                <TabsTrigger
                  value="feedback"
                  data-ocid="event_detail.feedback.tab"
                >
                  Feedback
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="glass-panel rounded-xl p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {event.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs rounded-full border-border/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {isLive && event.streamUrl && (
                  <div className="glass-panel rounded-xl p-4">
                    <p className="text-sm font-semibold mb-3">Live Stream</p>
                    <a
                      href={event.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        className="btn-gradient rounded-full"
                        data-ocid="event_detail.stream.button"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Watch Live Stream
                      </Button>
                    </a>
                  </div>
                )}

                {/* Virtual Rooms */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Virtual Rooms</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["main-stage", "🎤 Main Stage"],
                      ["breakout", "👥 Breakout"],
                      ["networking", "🤝 Networking"],
                      ["expo", "🏢 Expo"],
                    ].map(([id, label]) => (
                      <Link key={id} to="/rooms/$id" params={{ id }}>
                        <div
                          className="glass-panel rounded-xl p-3 hover:bg-secondary/50 transition-colors cursor-pointer flex items-center justify-between"
                          data-ocid={`event_detail.rooms.${id}.button`}
                        >
                          <span className="text-sm">{label}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sponsors">
                {booths.length === 0 ? (
                  <p
                    className="text-muted-foreground text-sm py-4"
                    data-ocid="sponsors.empty_state"
                  >
                    No sponsor booths yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {booths.map((booth, i) => (
                      <div
                        key={booth.id.toString()}
                        className="glass-panel rounded-xl p-4"
                        data-ocid={`sponsors.item.${i + 1}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={booth.logoUrl}
                            alt={booth.sponsorName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-sm">
                              {booth.sponsorName}
                            </p>
                            <Badge className="text-[10px] capitalize btn-gradient text-white rounded-full">
                              {booth.tier}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {booth.description}
                        </p>
                        <a
                          href={booth.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-border/50 text-xs"
                          >
                            Visit Booth{" "}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="feedback">
                <div className="space-y-4">
                  <div className="glass-panel rounded-xl p-5">
                    <p className="text-sm font-semibold mb-3">
                      Leave Your Feedback
                    </p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setRating(s)}
                          aria-label={`Rate ${s}`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              s <= rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <label htmlFor="feedback-comment" className="sr-only">
                      Your comment
                    </label>
                    <textarea
                      id="feedback-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full bg-secondary border border-border/50 rounded-xl p-3 text-sm text-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      data-ocid="feedback.textarea"
                    />
                    <Button
                      className="btn-gradient rounded-full mt-3 w-full"
                      onClick={handleSubmitFeedback}
                      disabled={submitFeedback.isPending}
                      data-ocid="feedback.submit_button"
                    >
                      {submitFeedback.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Feedback
                    </Button>
                  </div>
                  {feedback.map((fb, i) => (
                    <div
                      key={fb.id.toString()}
                      className="glass-panel rounded-xl p-4"
                      data-ocid={`feedback.item.${i + 1}`}
                    >
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: Number(fb.rating) }, (_, j) => (
                          <Star
                            key={`star-${fb.id.toString()}-${j}`}
                            className="w-4 h-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fb.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Ticket sidebar */}
          <div className="space-y-4">
            <div className="glass-panel rounded-xl p-5 card-glow">
              <p className="text-sm font-semibold mb-4">Get Tickets</p>
              <div className="space-y-3">
                {displayTiers.map((tier, i) => (
                  <div
                    key={tier.id.toString()}
                    className="border border-border/50 rounded-xl p-3"
                    data-ocid={`tickets.tier.${i + 1}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{tier.name}</p>
                      <p className="text-sm font-bold text-primary">
                        {tier.price === 0n
                          ? "Free"
                          : `$${(Number(tier.price) / 100).toFixed(2)}`}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {Number(tier.available) - Number(tier.sold)} spots left
                    </p>
                    <Button
                      className="w-full btn-gradient rounded-full text-sm"
                      onClick={() => handleBuyTicket(tier)}
                      disabled={checkout.isPending}
                      data-ocid={`tickets.buy_button.${i + 1}`}
                    >
                      {checkout.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : null}
                      {t("btn_buy_ticket")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
