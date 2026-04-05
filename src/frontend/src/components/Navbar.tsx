import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useI18n } from "../contexts/I18nContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const { t } = useI18n();
  const { login, clear, identity, isLoginSuccess } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navLinks = [
    { href: "/events", label: t("nav_events") },
    { href: "/networking", label: t("nav_networking") },
    { href: "/leaderboard", label: t("section_leaderboard") },
    { href: "/sponsors", label: t("section_sponsors") },
    { href: "/analytics", label: t("section_analytics") },
    ...(isAdmin
      ? [
          { href: "/admin", label: t("nav_admin") },
          { href: "/security", label: "Security" },
        ]
      : []),
    { href: "/test-debug", label: "Test" },
  ];

  const principalShort = `${identity?.getPrincipal().toString().slice(0, 8)}...`;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-16 no-print"
      style={{
        background: "oklch(0.11 0.04 265 / 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid oklch(1 0 0 / 0.07)",
      }}
    >
      <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 flex-shrink-0"
          data-ocid="nav.home.link"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.18 205), oklch(0.55 0.28 290))",
            }}
          >
            <span className="font-display font-black text-white text-sm">
              V
            </span>
          </div>
          <span className="font-display font-bold text-lg gradient-text">
            VirtX
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                currentPath === link.href
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              } ${
                link.href === "/test-debug"
                  ? "text-chart-1 hover:text-chart-1"
                  : ""
              } ${
                link.href === "/security"
                  ? "text-chart-3 hover:text-chart-3"
                  : ""
              }`}
              data-ocid={`nav.${link.label.toLowerCase().replace(/\s+/g, "_")}.link`}
            >
              {link.href === "/test-debug" ? (
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-chart-1"
                    style={{ boxShadow: "0 0 4px oklch(0.72 0.18 205)" }}
                  />
                  {link.label}
                </span>
              ) : link.href === "/security" ? (
                <span className="flex items-center gap-1">
                  <span className="text-[10px]">&#x1F512;</span>
                  {link.label}
                </span>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationBell />

          {isLoginSuccess ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-secondary/50 transition-colors touch-target"
                  data-ocid="nav.user.open_modal_button"
                >
                  <div className="avatar-ring">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-white text-xs font-bold">
                        {principalShort?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {principalShort}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="glass-panel border-border/50"
                data-ocid="nav.user.dropdown_menu"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                    data-ocid="nav.profile.link"
                  >
                    <User className="w-4 h-4" />
                    {t("label_profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                    data-ocid="nav.tickets.link"
                  >
                    <User className="w-4 h-4" />
                    {t("label_tickets")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => clear()}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                  data-ocid="nav.logout.button"
                >
                  <LogOut className="w-4 h-4" />
                  {t("btn_logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => login()}
              className="btn-gradient rounded-full text-sm font-medium px-4 hidden sm:flex"
              data-ocid="nav.login.button"
            >
              {t("btn_join_live")}
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground touch-target"
            onClick={() => setMobileOpen((prev) => !prev)}
            data-ocid="nav.mobile_menu.toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-border/50"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                  data-ocid={`nav.mobile.${link.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                >
                  {link.label}
                </Link>
              ))}
              {!isLoginSuccess && (
                <Button
                  onClick={() => {
                    login();
                    setMobileOpen(false);
                  }}
                  className="btn-gradient rounded-full w-full mt-2"
                >
                  {t("btn_login")}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
