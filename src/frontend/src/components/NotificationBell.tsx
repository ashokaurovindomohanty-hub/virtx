import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useState } from "react";
import {
  useGetMyNotifications,
  useMarkNotificationRead,
} from "../hooks/useQueries";

export function NotificationBell() {
  const { data: notifications = [] } = useGetMyNotifications();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());

  const handleMarkRead = (id: bigint) => {
    setLocalRead((prev) => new Set([...prev, id.toString()]));
    markRead.mutate(id, {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
  };

  const sampleNotifs = [
    {
      id: 1n,
      title: "Event Starting Soon",
      message: "Global Tech Summit starts in 30 minutes!",
      isRead: false,
    },
    {
      id: 2n,
      title: "New Connection",
      message: "Sarah Kim accepted your connection request.",
      isRead: false,
    },
    {
      id: 3n,
      title: "Session Reminder",
      message: "AI Workshop begins in 1 hour.",
      isRead: true,
    },
  ];

  const displayNotifs = notifications.length > 0 ? notifications : sampleNotifs;
  const unreadCount = displayNotifs.filter(
    (n) => !n.isRead && !localRead.has(n.id.toString()),
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          data-ocid="notifications.open_modal_button"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] btn-gradient border-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 glass-panel border-border/50"
        data-ocid="notifications.dropdown_menu"
      >
        <div className="px-3 py-2 border-b border-border/50">
          <p className="font-semibold text-sm">Notifications</p>
        </div>
        {displayNotifs.slice(0, 5).map((notif, i) => (
          <DropdownMenuItem
            key={notif.id.toString()}
            className={`px-3 py-3 cursor-pointer flex flex-col items-start gap-0.5 ${!notif.isRead && !localRead.has(notif.id.toString()) ? "bg-accent/10" : ""}`}
            onClick={() => handleMarkRead(notif.id)}
            data-ocid={`notifications.item.${i + 1}`}
          >
            <div className="flex items-center gap-2 w-full">
              {!notif.isRead && !localRead.has(notif.id.toString()) && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{notif.title}</p>
            </div>
            <p className="text-xs text-muted-foreground">{notif.message}</p>
          </DropdownMenuItem>
        ))}
        {displayNotifs.length === 0 && (
          <div
            className="px-3 py-4 text-center text-sm text-muted-foreground"
            data-ocid="notifications.empty_state"
          >
            No notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
