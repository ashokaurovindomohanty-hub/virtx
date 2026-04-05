import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type TierId = bigint;
export interface AttendeeProfile {
    bio: string;
    displayName: string;
    interests: Array<string>;
    userId: Principal;
    badges: Array<string>;
    company: string;
    jobTitle: string;
    avatarUrl: string;
    points: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type EventId = bigint;
export interface Event {
    id: EventId;
    status: string;
    title: string;
    tags: Array<string>;
    description: string;
    bannerImage: string;
    streamUrl: string;
    hostId: Principal;
    startDate: bigint;
    eventType: string;
}
export type BoothId = bigint;
export type TicketId = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface TicketPurchase {
    id: TicketId;
    eventId: EventId;
    tierId: TierId;
    purchasedAt: bigint;
    buyerId: Principal;
    stripeSessionId: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TicketTier {
    id: TierId;
    eventId: EventId;
    name: string;
    sold: bigint;
    available: bigint;
    price: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface EventStats {
    eventId: EventId;
    totalAttended: bigint;
    totalRegistered: bigint;
    engagementScore: bigint;
}
export type MessageId = string;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type NotificationId = bigint;
export interface Notification {
    id: NotificationId;
    title: string;
    userId: Principal;
    createdAt: bigint;
    isRead: boolean;
    message: string;
}
export interface Message {
    id: MessageId;
    content: string;
    toUser: Principal;
    timestamp: bigint;
    fromUser: Principal;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type FeedbackId = bigint;
export interface SponsorBooth {
    id: BoothId;
    eventId: EventId;
    websiteUrl: string;
    tier: string;
    description: string;
    logoUrl: string;
    contactEmail: string;
    demoUrl: string;
    sponsorName: string;
}
export interface EventFeedback {
    id: FeedbackId;
    eventId: EventId;
    userId: Principal;
    comment: string;
    rating: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBadge(user: Principal, badge: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardPoints(user: Principal, points: bigint): Promise<void>;
    connectWithUser(otherUser: Principal): Promise<void>;
    createBooth(booth: SponsorBooth): Promise<BoothId>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createEvent(event: Event): Promise<EventId>;
    createNotification(notification: Notification): Promise<NotificationId>;
    createOrUpdateProfile(profile: AttendeeProfile): Promise<void>;
    createTicketTier(tier: TicketTier): Promise<TierId>;
    getAllBooths(): Promise<Array<SponsorBooth>>;
    getAllEvents(): Promise<Array<Event>>;
    getBoothsForEvent(eventId: EventId): Promise<Array<SponsorBooth>>;
    getCallerProfile(): Promise<AttendeeProfile>;
    getCallerUserProfile(): Promise<AttendeeProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(withUser: Principal): Promise<Array<Message>>;
    getEventFeedback(eventId: EventId): Promise<Array<EventFeedback>>;
    getEventsByStatus(status: string): Promise<Array<Event>>;
    getLeaderboard(): Promise<Array<[Principal, string, bigint]>>;
    getMyConnections(): Promise<Array<Principal>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getMyTickets(): Promise<Array<TicketPurchase>>;
    getProfile(userId: Principal): Promise<AttendeeProfile>;
    getProfileByPrincipal(principal: Principal): Promise<AttendeeProfile>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTiersForEvent(eventId: EventId): Promise<Array<TicketTier>>;
    getUserProfile(user: Principal): Promise<AttendeeProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markNotificationRead(notificationId: NotificationId): Promise<void>;
    purchaseTicket(tierId: TierId, stripeSessionId: string): Promise<TicketId>;
    saveCallerUserProfile(profile: AttendeeProfile): Promise<void>;
    sendMessage(toUser: Principal, content: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitFeedback(feedbackEntry: EventFeedback): Promise<FeedbackId>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBooth(booth: SponsorBooth): Promise<void>;
    updateEvent(event: Event): Promise<void>;
    updateEventStats(stats: EventStats): Promise<void>;
}
