import Map "mo:core/Map";
import Array "mo:core/Array";
import Set "mo:core/Set";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // File Storage
  include MixinStorage();

  // Types
  type EventId = Nat;
  type TierId = Nat;
  type TicketId = Nat;
  type MessageId = Text;
  type BoothId = Nat;
  type FeedbackId = Nat;
  type NotificationId = Nat;

  public type Event = {
    id : EventId;
    title : Text;
    eventType : Text;
    description : Text;
    startDate : Int;
    hostId : Principal;
    status : Text;
    streamUrl : Text;
    bannerImage : Text;
    tags : [Text];
  };

  public type TicketTier = {
    id : TierId;
    eventId : EventId;
    name : Text;
    price : Nat;
    available : Nat;
    sold : Nat;
  };

  public type TicketPurchase = {
    id : TicketId;
    tierId : TierId;
    eventId : EventId;
    buyerId : Principal;
    stripeSessionId : Text;
    purchasedAt : Int;
  };

  public type AttendeeProfile = {
    userId : Principal;
    displayName : Text;
    bio : Text;
    interests : [Text];
    avatarUrl : Text;
    company : Text;
    jobTitle : Text;
    points : Nat;
    badges : [Text];
  };

  public type Message = {
    id : MessageId;
    fromUser : Principal;
    toUser : Principal;
    content : Text;
    timestamp : Int;
  };

  public type SponsorBooth = {
    id : BoothId;
    eventId : EventId;
    sponsorName : Text;
    description : Text;
    logoUrl : Text;
    websiteUrl : Text;
    demoUrl : Text;
    contactEmail : Text;
    tier : Text;
  };

  public type EventStats = {
    eventId : EventId;
    totalRegistered : Nat;
    totalAttended : Nat;
    engagementScore : Nat;
  };

  public type EventFeedback = {
    id : FeedbackId;
    eventId : EventId;
    userId : Principal;
    rating : Nat;
    comment : Text;
  };

  public type Notification = {
    id : NotificationId;
    userId : Principal;
    title : Text;
    message : Text;
    isRead : Bool;
    createdAt : Int;
  };

  // Compare functions
  module Event {
    public func compare(a : Event, b : Event) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module TicketTier {
    public func compare(a : TicketTier, b : TicketTier) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module TicketPurchase {
    public func compare(a : TicketPurchase, b : TicketPurchase) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Message {
    public func compare(a : Message, b : Message) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  module SponsorBooth {
    public func compare(a : SponsorBooth, b : SponsorBooth) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module EventStats {
    public func compare(a : EventStats, b : EventStats) : Order.Order {
      Nat.compare(a.eventId, b.eventId);
    };
  };

  module EventFeedback {
    public func compare(a : EventFeedback, b : EventFeedback) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Notification {
    public func compare(a : Notification, b : Notification) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module AttendeeProfile {
    public func compare(a : AttendeeProfile, b : AttendeeProfile) : Order.Order {
      Principal.compare(a.userId, b.userId);
    };
    public func compareByPoints(a : AttendeeProfile, b : AttendeeProfile) : Order.Order {
      Nat.compare(b.points, a.points);
    };
  };

  // ID counters
  var nextEventId = 0;
  var nextTierId = 0;
  var nextTicketId = 0;
  var nextBoothId = 0;
  var nextFeedbackId = 0;
  var nextNotificationId = 0;

  // Storage
  let events = Map.empty<EventId, Event>();
  let ticketTiers = Map.empty<TierId, TicketTier>();
  let tickets = Map.empty<TicketId, TicketPurchase>();
  let profiles = Map.empty<Principal, AttendeeProfile>();
  let messages = Map.empty<MessageId, Message>();
  let sponsorBooths = Map.empty<BoothId, SponsorBooth>();
  let eventStats = Map.empty<EventId, EventStats>();
  let feedback = Map.empty<FeedbackId, EventFeedback>();
  let notifications = Map.empty<NotificationId, Notification>();
  let connections = Map.empty<Principal, Set.Set<Principal>>();

  // Stripe configuration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // EVENTS
  public shared ({ caller }) func createEvent(event : Event) : async EventId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };

    let newEvent : Event = {
      event with
      id = nextEventId;
      bannerImage = event.bannerImage;
      hostId = caller;
    };
    events.add(nextEventId, newEvent);
    nextEventId += 1;
    newEvent.id;
  };

  public shared ({ caller }) func updateEvent(event : Event) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update events");
    };

    if (not events.containsKey(event.id)) { Runtime.trap("Event not found") };
    
    let existingEvent = switch (events.get(event.id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?e) { e };
    };

    if (caller != existingEvent.hostId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only event host or admin can update event");
    };

    events.add(event.id, event);
  };

  public query func getAllEvents() : async [Event] {
    events.values().toArray().sort();
  };

  public query func getEventsByStatus(status : Text) : async [Event] {
    events.values().filter(func(e) { e.status == status }).toArray().sort();
  };

  // TICKETING
  public shared ({ caller }) func createTicketTier(tier : TicketTier) : async TierId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create ticket tiers");
    };

    // Verify caller is the event host or admin
    let event = switch (events.get(tier.eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?e) { e };
    };

    if (caller != event.hostId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only event host or admin can create ticket tiers");
    };

    let newTier : TicketTier = {
      tier with
      id = nextTierId;
    };
    ticketTiers.add(nextTierId, newTier);
    nextTierId += 1;
    newTier.id;
  };

  public query func getTiersForEvent(eventId : EventId) : async [TicketTier] {
    ticketTiers.values().filter(func(t) { t.eventId == eventId }).toArray().sort();
  };

  public query ({ caller }) func getMyTickets() : async [TicketPurchase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their tickets");
    };
    tickets.values().filter(func(t) { t.buyerId == caller }).toArray().sort();
  };

  public shared ({ caller }) func purchaseTicket(tierId : TierId, stripeSessionId : Text) : async TicketId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase tickets");
    };

    let tier = switch (ticketTiers.get(tierId)) {
      case (null) { Runtime.trap("Tier not found") };
      case (?t) { t };
    };

    if (tier.available <= tier.sold) { Runtime.trap("Tickets sold out") };

    let purchase : TicketPurchase = {
      id = nextTicketId;
      tierId;
      eventId = tier.eventId;
      buyerId = caller;
      stripeSessionId;
      purchasedAt = Time.now();
    };
    tickets.add(nextTicketId, purchase);
    ticketTiers.add(tierId, { tier with sold = tier.sold + 1 });
    nextTicketId += 1;

    // Update event stats
    let stats = switch (eventStats.get(tier.eventId)) {
      case (null) {
        {
          eventId = tier.eventId;
          totalRegistered = 1;
          totalAttended = 0;
          engagementScore = 0;
        };
      };
      case (?s) { { s with totalRegistered = s.totalRegistered + 1 } };
    };
    eventStats.add(tier.eventId, stats);

    purchase.id;
  };

  // PROFILES - Required interface functions
  public query ({ caller }) func getCallerUserProfile() : async ?AttendeeProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?AttendeeProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : AttendeeProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existing = switch (profiles.get(caller)) {
      case (null) { profile };
      case (?p) {
        // Keep points and badges from existing profile
        { profile with points = p.points; badges = p.badges };
      };
    };
    profiles.add(caller, { existing with userId = caller });
  };

  // PROFILES - Legacy functions
  public shared ({ caller }) func createOrUpdateProfile(profile : AttendeeProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    let existing = switch (profiles.get(caller)) {
      case (null) { profile };
      case (?p) {
        // Keep points and badges from existing profile
        { profile with points = p.points; badges = p.badges };
      };
    };
    profiles.add(caller, { existing with userId = caller });
  };

  public query ({ caller }) func getCallerProfile() : async AttendeeProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  public query func getProfile(userId : Principal) : async AttendeeProfile {
    switch (profiles.get(userId)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  // NETWORKING
  public shared ({ caller }) func sendMessage(toUser : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let message : Message = {
      id = caller.toText() # "_" # toUser.toText() # "_" # Time.now().toText();
      fromUser = caller;
      toUser;
      content;
      timestamp = Time.now();
    };
    messages.add(message.id, message);
  };

  public query ({ caller }) func getConversation(withUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    messages.values().filter(func(mm) { mm.fromUser == caller and mm.toUser == withUser or mm.fromUser == withUser and mm.toUser == caller }).toArray().sort();
  };

  public shared ({ caller }) func connectWithUser(otherUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can connect with others");
    };

    let existingSet = switch (connections.get(caller)) {
      case (null) {
        let newSet = Set.empty<Principal>();
        newSet.add(otherUser);
        newSet;
      };
      case (?set) {
        set.add(otherUser);
        set;
      };
    };
    connections.add(caller, existingSet);
  };

  public query ({ caller }) func getMyConnections() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their connections");
    };

    switch (connections.get(caller)) {
      case (null) { [] };
      case (?set) { set.values().toArray() };
    };
  };

  // SPONSOR BOOTHS
  public shared ({ caller }) func createBooth(booth : SponsorBooth) : async BoothId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create booths");
    };

    let newBooth : SponsorBooth = {
      booth with
      id = nextBoothId;
      logoUrl = booth.logoUrl;
    };
    sponsorBooths.add(nextBoothId, newBooth);
    nextBoothId += 1;
    newBooth.id;
  };

  public shared ({ caller }) func updateBooth(booth : SponsorBooth) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update booths");
    };

    if (not sponsorBooths.containsKey(booth.id)) { Runtime.trap("Booth not found") };
    sponsorBooths.add(booth.id, booth);
  };

  // GAMIFICATION
  public shared ({ caller }) func awardPoints(user : Principal, points : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can award points");
    };

    let profile = switch (profiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { p };
    };
    profiles.add(user, { profile with points = profile.points + points });
  };

  public shared ({ caller }) func addBadge(user : Principal, badge : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add badges");
    };

    let profile = switch (profiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { p };
    };
    let badgesList = List.fromArray(profile.badges);
    badgesList.add(badge);
    profiles.add(user, { profile with badges = badgesList.toArray() });
  };

  public query func getLeaderboard() : async [(Principal, Text, Nat)] {
    profiles.values().toArray().sort(AttendeeProfile.compareByPoints).map(func(p) { (p.userId, p.displayName, p.points) });
  };

  // ANALYTICS
  public shared ({ caller }) func updateEventStats(stats : EventStats) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update event stats");
    };

    eventStats.add(stats.eventId, stats);
  };

  public shared ({ caller }) func submitFeedback(feedbackEntry : EventFeedback) : async FeedbackId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit feedback");
    };

    let feedbackWithId : EventFeedback = {
      feedbackEntry with
      id = nextFeedbackId;
      userId = caller;
    };
    feedback.add(nextFeedbackId, feedbackWithId);
    nextFeedbackId += 1;
    feedbackWithId.id;
  };

  public query func getEventFeedback(eventId : EventId) : async [EventFeedback] {
    feedback.values().filter(func(f) { f.eventId == eventId }).toArray().sort();
  };

  // NOTIFICATIONS
  public shared ({ caller }) func createNotification(notification : Notification) : async NotificationId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create notifications");
    };

    let notificationWithId : Notification = {
      notification with
      id = nextNotificationId;
      isRead = false;
    };
    notifications.add(nextNotificationId, notificationWithId);
    nextNotificationId += 1;
    notificationWithId.id;
  };

  public shared ({ caller }) func markNotificationRead(notificationId : NotificationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) {
        if (caller != notification.userId) { Runtime.trap("Unauthorized: Can only mark your own notifications as read") };
        notifications.add(notificationId, { notification with isRead = true });
      };
    };
  };

  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their notifications");
    };

    notifications.values().filter(func(n) { n.userId == caller }).toArray().sort();
  };

  // SPONSOR BOOTHS (continued)
  public query func getBoothsForEvent(eventId : EventId) : async [SponsorBooth] {
    sponsorBooths.values().filter(func(b) { b.eventId == eventId }).toArray().sort();
  };

  public query func getAllBooths() : async [SponsorBooth] {
    sponsorBooths.values().toArray().sort();
  };

  // INTERNALS
  public query ({ caller }) func getProfileByPrincipal(principal : Principal) : async AttendeeProfile {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (profiles.get(principal)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?config) { config };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };
};
