import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  AttendeeProfile,
  Event,
  EventFeedback,
  EventStats,
  Notification,
  SponsorBooth,
  TicketPurchase,
} from "../backend.d";
import { useActor } from "./useActor";

// Sample events fallback data
export const SAMPLE_EVENTS: Event[] = [
  {
    id: 1n,
    title: "Global Tech Summit 2026",
    description:
      "The premier gathering of technology leaders, innovators, and entrepreneurs from around the world. Featuring keynotes, workshops, and networking opportunities.",
    eventType: "Conference",
    status: "live",
    startDate: BigInt(new Date("2026-04-15").getTime()),
    bannerImage: "/assets/generated/event-tech-summit.dim_800x300.jpg",
    tags: ["technology", "innovation", "networking"],
    hostId: { toString: () => "host-1" } as any,
    streamUrl: "https://youtube.com/live/tech-summit",
  },
  {
    id: 2n,
    title: "AI & Machine Learning Expo",
    description:
      "Explore the latest breakthroughs in artificial intelligence and machine learning. Connect with researchers, practitioners, and industry leaders shaping the future.",
    eventType: "Trade Show",
    status: "upcoming",
    startDate: BigInt(new Date("2026-05-03").getTime()),
    bannerImage: "/assets/generated/event-ai-expo.dim_800x300.jpg",
    tags: ["AI", "ML", "data science"],
    hostId: { toString: () => "host-2" } as any,
    streamUrl: "https://linkedin.com/events/ai-expo",
  },
  {
    id: 3n,
    title: "Design Leaders Workshop",
    description:
      "An intensive hands-on workshop for senior designers and UX leaders. Learn cutting-edge design systems, accessibility practices, and team scaling strategies.",
    eventType: "Workshop",
    status: "upcoming",
    startDate: BigInt(new Date("2026-04-28").getTime()),
    bannerImage: "/assets/generated/event-design-workshop.dim_800x300.jpg",
    tags: ["design", "UX", "leadership"],
    hostId: { toString: () => "host-3" } as any,
    streamUrl: "",
  },
  {
    id: 4n,
    title: "Web3 Developer Meetup",
    description:
      "A community-driven meetup for Web3 developers, blockchain enthusiasts, and decentralized application builders. Share projects and collaborate.",
    eventType: "Meetup",
    status: "upcoming",
    startDate: BigInt(new Date("2026-04-20").getTime()),
    bannerImage: "/assets/generated/event-web3-meetup.dim_800x300.jpg",
    tags: ["web3", "blockchain", "defi"],
    hostId: { toString: () => "host-4" } as any,
    streamUrl: "https://youtube.com/live/web3-meetup",
  },
  {
    id: 5n,
    title: "Digital Marketing Webinar",
    description:
      "Master the latest digital marketing strategies, from SEO and content marketing to paid advertising and analytics. Perfect for marketing professionals.",
    eventType: "Webinar",
    status: "upcoming",
    startDate: BigInt(new Date("2026-04-12").getTime()),
    bannerImage: "/assets/generated/event-marketing-webinar.dim_800x300.jpg",
    tags: ["marketing", "SEO", "digital"],
    hostId: { toString: () => "host-5" } as any,
    streamUrl: "https://facebook.com/live/marketing-webinar",
  },
];

const SAMPLE_LEADERBOARD: Array<[any, string, bigint]> = [
  [{ toString: () => "u1" } as any, "Alex Chen", 4850n],
  [{ toString: () => "u2" } as any, "Sarah Kim", 4320n],
  [{ toString: () => "u3" } as any, "Marcus Johnson", 3975n],
  [{ toString: () => "u4" } as any, "Priya Patel", 3650n],
  [{ toString: () => "u5" } as any, "David Miller", 3200n],
  [{ toString: () => "u6" } as any, "Emma Wilson", 2980n],
  [{ toString: () => "u7" } as any, "Ryan Lee", 2750n],
  [{ toString: () => "u8" } as any, "Sofia Garcia", 2510n],
];

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      if (!actor) return SAMPLE_EVENTS;
      try {
        const events = await actor.getAllEvents();
        return events.length > 0 ? events : SAMPLE_EVENTS;
      } catch {
        return SAMPLE_EVENTS;
      }
    },
    enabled: !!actor && !isFetching,
    initialData: SAMPLE_EVENTS,
  });
}

export function useGetEventById(id: bigint | undefined) {
  const { data: events } = useGetAllEvents();
  return events?.find((e) => e.id === id) ?? null;
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[any, string, bigint]>>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return SAMPLE_LEADERBOARD;
      try {
        const data = await actor.getLeaderboard();
        return data.length > 0 ? data : SAMPLE_LEADERBOARD;
      } catch {
        return SAMPLE_LEADERBOARD;
      }
    },
    enabled: !!actor && !isFetching,
    initialData: SAMPLE_LEADERBOARD,
  });
}

export function useGetMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<AttendeeProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyTickets() {
  const { actor, isFetching } = useActor();
  return useQuery<TicketPurchase[]>({
    queryKey: ["myTickets"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyTickets();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useGetMyNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyNotifications();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
    refetchInterval: 30000,
  });
}

export function useGetBoothsForEvent(eventId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<SponsorBooth[]>({
    queryKey: ["booths", eventId?.toString()],
    queryFn: async () => {
      if (!actor || !eventId) return [];
      try {
        return await actor.getBoothsForEvent(eventId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!eventId,
    initialData: [],
  });
}

export function useGetEventFeedback(eventId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<EventFeedback[]>({
    queryKey: ["feedback", eventId?.toString()],
    queryFn: async () => {
      if (!actor || !eventId) return [];
      try {
        return await actor.getEventFeedback(eventId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!eventId,
    initialData: [],
  });
}

export function useGetTiersForEvent(eventId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tiers", eventId?.toString()],
    queryFn: async () => {
      if (!actor || !eventId) return [];
      try {
        return await actor.getTiersForEvent(eventId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!eventId,
    initialData: [],
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    initialData: false,
  });
}

export function useGetAllBooths() {
  const { actor, isFetching } = useActor();
  return useQuery<SponsorBooth[]>({
    queryKey: ["allBooths"],
    queryFn: async () => {
      if (!actor) return SAMPLE_BOOTHS;
      try {
        const booths = await actor.getAllBooths();
        return booths.length > 0 ? booths : SAMPLE_BOOTHS;
      } catch {
        return SAMPLE_BOOTHS;
      }
    },
    enabled: !!actor && !isFetching,
    initialData: SAMPLE_BOOTHS,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: { items: any[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (feedback: EventFeedback) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitFeedback(feedback);
    },
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markNotificationRead(id);
    },
  });
}

export function useUpdateEventStats() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (stats: EventStats) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEventStats(stats);
    },
  });
}

export function useCreateOrUpdateProfile() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (profile: AttendeeProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrUpdateProfile(profile);
    },
  });
}

export const SAMPLE_BOOTHS: SponsorBooth[] = [
  {
    id: 1n,
    eventId: 1n,
    sponsorName: "TechCorp Global",
    description:
      "Leading provider of enterprise AI and cloud solutions. Visit our booth for live demos and exclusive product reveals.",
    logoUrl: "https://picsum.photos/seed/techcorp/120/120",
    websiteUrl: "https://techcorp.example.com",
    contactEmail: "sponsors@techcorp.example.com",
    demoUrl: "https://demo.techcorp.example.com",
    tier: "platinum",
  },
  {
    id: 2n,
    eventId: 1n,
    sponsorName: "DataFlow Analytics",
    description:
      "Real-time analytics platform for modern enterprises. See how we process billions of data points daily.",
    logoUrl: "https://picsum.photos/seed/dataflow/120/120",
    websiteUrl: "https://dataflow.example.com",
    contactEmail: "hello@dataflow.example.com",
    demoUrl: "https://app.dataflow.example.com",
    tier: "gold",
  },
  {
    id: 3n,
    eventId: 2n,
    sponsorName: "CloudNine Solutions",
    description:
      "Next-generation cloud infrastructure for scalable applications. Trusted by 10,000+ companies worldwide.",
    logoUrl: "https://picsum.photos/seed/cloudnine/120/120",
    websiteUrl: "https://cloudnine.example.com",
    contactEmail: "info@cloudnine.example.com",
    demoUrl: "https://cloudnine.example.com/demo",
    tier: "gold",
  },
  {
    id: 4n,
    eventId: 1n,
    sponsorName: "InnovateLab",
    description:
      "Cutting-edge R&D firm specializing in emerging technologies. Browse our latest research and startup investments.",
    logoUrl: "https://picsum.photos/seed/innovatelab/120/120",
    websiteUrl: "https://innovatelab.example.com",
    contactEmail: "contact@innovatelab.example.com",
    demoUrl: "",
    tier: "silver",
  },
];
