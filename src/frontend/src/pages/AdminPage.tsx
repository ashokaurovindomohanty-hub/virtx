import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Edit3,
  Home,
  Loader2,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../contexts/I18nContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  SAMPLE_BOOTHS,
  useGetAllEvents,
  useIsCallerAdmin,
} from "../hooks/useQueries";

const SAMPLE_USERS = [
  { id: "u1", name: "Alex Chen", role: "user", joined: "2026-03-15" },
  { id: "u2", name: "Sarah Kim", role: "user", joined: "2026-03-20" },
  { id: "u3", name: "Marcus Johnson", role: "user", joined: "2026-04-01" },
  { id: "u4", name: "Priya Patel", role: "admin", joined: "2026-02-01" },
];

export function AdminPage() {
  const { t } = useI18n();
  const { identity, login } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: events = [] } = useGetAllEvents();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const [isCreating, setIsCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "Conference",
    startDate: "",
  });

  // Not logged in
  if (!identity) {
    return (
      <div className="page-bg min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center glass-panel rounded-2xl p-8 max-w-sm">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl mb-2">Admin Portal</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to access the admin dashboard.
          </p>
          <Button
            className="btn-gradient rounded-full w-full"
            onClick={() => login()}
            data-ocid="admin.login.button"
          >
            {t("btn_login")}
          </Button>
        </div>
      </div>
    );
  }

  // Secondary access-denied check (belt-and-suspenders after route guard)
  if (!isAdminLoading && isAdmin === false) {
    return (
      <div className="page-bg min-h-screen pt-16 flex items-center justify-center px-4">
        <div
          className="glass-panel rounded-2xl p-8 max-w-sm w-full text-center"
          data-ocid="admin.access_denied.panel"
        >
          <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="font-display font-bold text-xl mb-2 text-destructive">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            You don’t have permission to access the Admin Portal.
          </p>
          <Link to="/">
            <Button
              className="btn-gradient rounded-full w-full flex items-center gap-2"
              data-ocid="admin.access_denied.home.button"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateEvent = async () => {
    if (!actor || !newEvent.title) return;
    setIsCreating(true);
    try {
      await actor.createEvent({
        id: 0n,
        title: newEvent.title,
        description: newEvent.description,
        eventType: newEvent.eventType,
        status: "upcoming",
        startDate: BigInt(new Date(newEvent.startDate).getTime()),
        bannerImage: "",
        tags: [],
        hostId: identity.getPrincipal(),
        streamUrl: "",
      });
      toast.success("Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setCreateOpen(false);
      setNewEvent({
        title: "",
        description: "",
        eventType: "Conference",
        startDate: "",
      });
    } catch {
      toast.error("Failed to create event.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-title text-3xl mb-1">
                {t("nav_admin")} Portal
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage events, sponsors, and users.
              </p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  className="btn-gradient rounded-full"
                  data-ocid="admin.create_event.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent
                className="glass-panel border-border/50"
                data-ocid="admin.create_event.dialog"
              >
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Create New Event
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="admin-event-title"
                      className="text-xs text-muted-foreground mb-1 block"
                    >
                      Event Title
                    </label>
                    <Input
                      id="admin-event-title"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="e.g. Global Dev Summit 2026"
                      className="bg-secondary border-border/50"
                      data-ocid="admin.event_title.input"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="admin-event-description"
                      className="text-xs text-muted-foreground mb-1 block"
                    >
                      Description
                    </label>
                    <textarea
                      id="admin-event-description"
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe your event..."
                      className="w-full bg-secondary border border-border/50 rounded-xl p-3 text-sm text-foreground resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      data-ocid="admin.event_description.textarea"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="admin-event-type"
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Event Type
                      </label>
                      <Select
                        value={newEvent.eventType}
                        onValueChange={(v) =>
                          setNewEvent((p) => ({ ...p, eventType: v }))
                        }
                      >
                        <SelectTrigger
                          id="admin-event-type"
                          className="bg-secondary border-border/50"
                          data-ocid="admin.event_type.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-border/50">
                          {[
                            "Conference",
                            "Webinar",
                            "Workshop",
                            "Meetup",
                            "Trade Show",
                          ].map((eventType) => (
                            <SelectItem key={eventType} value={eventType}>
                              {eventType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        htmlFor="admin-event-date"
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Start Date
                      </label>
                      <Input
                        id="admin-event-date"
                        type="date"
                        value={newEvent.startDate}
                        onChange={(e) =>
                          setNewEvent((p) => ({
                            ...p,
                            startDate: e.target.value,
                          }))
                        }
                        className="bg-secondary border-border/50"
                        data-ocid="admin.event_date.input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full border-border/50"
                      onClick={() => setCreateOpen(false)}
                      data-ocid="admin.create_event.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 btn-gradient rounded-full"
                      onClick={handleCreateEvent}
                      disabled={isCreating || !newEvent.title}
                      data-ocid="admin.create_event.confirm_button"
                    >
                      {isCreating ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Create Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Tabs defaultValue="events">
          <TabsList className="bg-secondary border border-border/50 mb-6">
            <TabsTrigger value="events" data-ocid="admin.events.tab">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="sponsors" data-ocid="admin.sponsors.tab">
              <Settings className="w-4 h-4 mr-2" />
              Sponsors
            </TabsTrigger>
            <TabsTrigger value="users" data-ocid="admin.users.tab">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-3">
              {events.map((event, i) => (
                <div
                  key={event.id.toString()}
                  className="glass-panel rounded-xl p-4 flex items-center justify-between gap-4"
                  data-ocid={`admin.events.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        event.bannerImage ||
                        `https://picsum.photos/seed/${event.id}/60/60`
                      }
                      alt={event.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          className="text-[10px] rounded-full"
                          variant="outline"
                        >
                          {event.eventType}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(
                            Number(event.startDate),
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      className={`text-[10px] capitalize rounded-full ${
                        event.status === "live"
                          ? "bg-red-500/20 border-red-400/30 text-red-400"
                          : "bg-chart-2/10 border-chart-2/20 text-chart-2"
                      }`}
                      variant="outline"
                    >
                      {event.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      data-ocid={`admin.events.edit_button.${i + 1}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive/70 hover:text-destructive"
                      data-ocid={`admin.events.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sponsors">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_BOOTHS.map((booth, i) => (
                <div
                  key={booth.id.toString()}
                  className="glass-panel rounded-xl p-4 flex items-center justify-between gap-3"
                  data-ocid={`admin.sponsors.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={booth.logoUrl}
                      alt={booth.sponsorName}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {booth.sponsorName}
                      </p>
                      <Badge
                        className="text-[10px] capitalize"
                        variant="outline"
                      >
                        {booth.tier}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    data-ocid={`admin.sponsors.edit_button.${i + 1}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-3">
              {SAMPLE_USERS.map((user, i) => (
                <div
                  key={user.id}
                  className="glass-panel rounded-xl p-4 flex items-center justify-between"
                  data-ocid={`admin.users.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-white text-sm font-bold">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {user.joined}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-[10px] capitalize rounded-full ${
                      user.role === "admin"
                        ? "btn-gradient text-white border-0"
                        : "border-border/50"
                    }`}
                    variant={user.role === "admin" ? "default" : "outline"}
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
