import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Loader2, Save, Ticket, Trophy, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../contexts/I18nContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateOrUpdateProfile,
  useGetAllEvents,
  useGetMyProfile,
  useGetMyTickets,
} from "../hooks/useQueries";

const SAMPLE_BADGES = [
  { name: "Early Adopter", icon: "🌟", desc: "Joined in the first wave" },
  { name: "Networker", icon: "🤝", desc: "Connected with 10+ attendees" },
  { name: "Speaker", icon: "🎤", desc: "Hosted a session" },
  { name: "Explorer", icon: "🧭", desc: "Visited all virtual rooms" },
];

export function ProfilePage() {
  const { t } = useI18n();
  const { identity, login } = useInternetIdentity();
  const { data: profile } = useGetMyProfile();
  const { data: tickets = [] } = useGetMyTickets();
  const { data: events = [] } = useGetAllEvents();
  const updateProfile = useCreateOrUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    profile?.displayName ?? "Anonymous Attendee",
  );
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [company, setCompany] = useState(profile?.company ?? "");
  const [jobTitle, setJobTitle] = useState(profile?.jobTitle ?? "");

  if (!identity) {
    return (
      <div className="page-bg min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center glass-panel rounded-2xl p-8 max-w-sm">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl mb-2">
            Sign In Required
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please login to view your profile.
          </p>
          <Button
            className="btn-gradient rounded-full w-full"
            onClick={() => login()}
            data-ocid="profile.login.button"
          >
            {t("btn_login")}
          </Button>
        </div>
      </div>
    );
  }

  const points = Number(profile?.points ?? 0);
  const principalStr = identity.getPrincipal().toString();

  const handleSave = () => {
    updateProfile.mutate(
      {
        userId: identity.getPrincipal(),
        displayName,
        bio,
        company,
        jobTitle,
        avatarUrl: profile?.avatarUrl ?? "",
        interests: profile?.interests ?? [],
        badges: profile?.badges ?? [],
        points: profile?.points ?? 0n,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated!");
          setEditing(false);
        },
      },
    );
  };

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header */}
          <div className="glass-panel rounded-2xl p-6 mb-6 card-glow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="avatar-ring">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-white text-2xl font-bold">
                    {(profile?.displayName ?? "A")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <Input
                    id="profile-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="font-display font-bold text-xl bg-secondary border-border/50 mb-2"
                    data-ocid="profile.name.input"
                  />
                ) : (
                  <h1 className="font-display font-bold text-2xl">
                    {profile?.displayName ?? "Anonymous Attendee"}
                  </h1>
                )}
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {principalStr}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold">
                      {points} {t("label_points")}
                    </span>
                  </div>
                  <Badge className="btn-gradient text-white text-xs rounded-full border-0">
                    Attendee
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-border/50"
                onClick={() => (editing ? handleSave() : setEditing(true))}
                data-ocid={
                  editing ? "profile.save.button" : "profile.edit.button"
                }
              >
                {updateProfile.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editing ? (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="info">
            <TabsList className="bg-secondary border border-border/50 mb-6">
              <TabsTrigger value="info" data-ocid="profile.info.tab">
                {t("label_profile")}
              </TabsTrigger>
              <TabsTrigger value="tickets" data-ocid="profile.tickets.tab">
                {t("label_tickets")}
              </TabsTrigger>
              <TabsTrigger value="badges" data-ocid="profile.badges.tab">
                {t("label_badges")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="profile-company"
                      className="text-xs text-muted-foreground mb-1 block"
                    >
                      Company
                    </label>
                    {editing ? (
                      <Input
                        id="profile-company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="bg-secondary border-border/50"
                        data-ocid="profile.company.input"
                      />
                    ) : (
                      <p className="text-sm">{profile?.company || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="profile-jobtitle"
                      className="text-xs text-muted-foreground mb-1 block"
                    >
                      Job Title
                    </label>
                    {editing ? (
                      <Input
                        id="profile-jobtitle"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="bg-secondary border-border/50"
                        data-ocid="profile.jobtitle.input"
                      />
                    ) : (
                      <p className="text-sm">
                        {profile?.jobTitle || "Not set"}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="profile-bio"
                    className="text-xs text-muted-foreground mb-1 block"
                  >
                    Bio
                  </label>
                  {editing ? (
                    <textarea
                      id="profile-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-secondary border border-border/50 rounded-xl p-3 text-sm text-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      data-ocid="profile.bio.textarea"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.bio || "No bio set yet."}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tickets">
              {tickets.length === 0 ? (
                <div
                  className="text-center py-12 glass-panel rounded-2xl"
                  data-ocid="tickets.empty_state"
                >
                  <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No tickets purchased yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket, i) => {
                    const ev = events.find((e) => e.id === ticket.eventId);
                    return (
                      <div
                        key={ticket.id.toString()}
                        className="glass-panel rounded-xl p-4 flex items-center justify-between"
                        data-ocid={`tickets.item.${i + 1}`}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {ev?.title ?? `Event #${ticket.eventId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ticket #{ticket.id.toString()}
                          </p>
                        </div>
                        <Badge className="btn-gradient text-white rounded-full text-xs border-0">
                          Purchased
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="badges">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {SAMPLE_BADGES.map((badge, i) => (
                  <div
                    key={badge.name}
                    className="glass-panel rounded-xl p-4 text-center card-glow"
                    data-ocid={`badges.item.${i + 1}`}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="text-xs font-semibold">{badge.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {badge.desc}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
