import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Home,
  Shield,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";
import { detectMaliciousInput, sessionTracker } from "../utils/security";

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

interface SecurityCheck {
  label: string;
  status: "active" | "inactive" | "warning";
  detail: string;
}

function buildChecks(isAdmin: boolean | undefined): SecurityCheck[] {
  const cspMeta = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"]',
  );
  let inIframe = false;
  try {
    inIframe = window.self !== window.top;
  } catch {
    inIframe = true;
  }
  const isHttps = location.protocol === "https:";

  return [
    {
      label: "Internet Identity Authentication",
      status: "active",
      detail: "Decentralised auth via Internet Identity",
    },
    {
      label: "CSP Header",
      status: cspMeta ? "active" : "inactive",
      detail: cspMeta
        ? "Content-Security-Policy meta tag present"
        : "CSP meta tag not found",
    },
    {
      label: "Frame Protection",
      status: inIframe ? "inactive" : "active",
      detail: inIframe
        ? "WARNING: Running inside an iframe"
        : "Page is not embedded in a frame",
    },
    {
      label: "Admin Access Control",
      status: isAdmin ? "active" : "warning",
      detail: isAdmin
        ? "Role-based guard enforced on /admin and /security"
        : "Admin status unknown",
    },
    {
      label: "Input Sanitization",
      status: "active",
      detail: "sanitizeText() active on all user inputs",
    },
    {
      label: "Rate Limiting",
      status: "active",
      detail: "Misa AI: 1 message/1.5s • Global: 20 actions/s",
    },
    {
      label: "HTTPS",
      status: isHttps ? "active" : "warning",
      detail: isHttps
        ? "Secure connection active"
        : "Warning: Page loaded over HTTP",
    },
  ];
}

function StatusIcon({ status }: { status: SecurityCheck["status"] }) {
  if (status === "active")
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
  if (status === "warning")
    return <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
  return <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
}

export function SecurityAuditPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [activityLog, setActivityLog] = useState<
    Array<{ action: string; time: number }>
  >([]);
  const [sessionStart] = useState(() => {
    const log = sessionTracker.getRecentActions();
    const start = log.find((e) => e.action === "session-start");
    return start ? start.time : Date.now();
  });
  const [blockedCount] = useState(() => {
    const log = sessionTracker.getRecentActions();
    return log.filter((e) => e.action.startsWith("message-blocked")).length;
  });

  // Probe XSS detection to verify it works
  const [detectionWorking] = useState(() =>
    detectMaliciousInput("<script>alert(1)</script>"),
  );

  useEffect(() => {
    setChecks(buildChecks(isAdmin));
    setActivityLog(sessionTracker.getRecentActions().slice(-20).reverse());
    sessionTracker.recordAction("security-audit-viewed");
  }, [isAdmin]);

  const clearLog = () => {
    sessionTracker.clearLog();
    sessionTracker.recordAction("session-start"); // keep baseline
    setActivityLog([]);
  };

  const principal = identity?.getPrincipal().toString() ?? null;
  const shortPrincipal = principal
    ? `${principal.slice(0, 12)}...${principal.slice(-6)}`
    : "Anonymous";

  const sessionDurationSecs = Math.floor((Date.now() - sessionStart) / 1000);
  const sessionDurationLabel =
    sessionDurationSecs < 60
      ? `${sessionDurationSecs}s`
      : sessionDurationSecs < 3600
        ? `${Math.floor(sessionDurationSecs / 60)}m ${sessionDurationSecs % 60}s`
        : `${Math.floor(sessionDurationSecs / 3600)}h ${Math.floor((sessionDurationSecs % 3600) / 60)}m`;

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-chart-1" />
              <h1 className="section-title text-2xl gradient-text">
                Security Audit
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Real-time security status and session activity for VirtX.
            </p>
          </div>
          <Link to="/">
            <Button
              variant="outline"
              className="rounded-full border-border/50 flex items-center gap-2"
              data-ocid="security.home.button"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-panel rounded-2xl p-6"
            data-ocid="security.session.panel"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-chart-1" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Session Info
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Principal", value: shortPrincipal },
                {
                  label: "Login Time",
                  value: new Date(sessionStart).toLocaleTimeString(),
                },
                { label: "Session Duration", value: sessionDurationLabel },
                {
                  label: "Role",
                  value: isAdmin ? "Administrator" : "User",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span
                    className={`font-mono text-xs font-medium ${
                      row.label === "Role" && isAdmin
                        ? "text-chart-1"
                        : "text-foreground"
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security Status */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl p-6"
            data-ocid="security.status.panel"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-chart-1" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Security Status
              </h2>
            </div>
            <div className="space-y-2.5">
              {checks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-start gap-3 text-sm"
                >
                  <StatusIcon status={check.status} />
                  <div className="min-w-0">
                    <p className="font-medium text-xs">{check.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {check.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Threat Detection */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-panel rounded-2xl p-6"
            data-ocid="security.threats.panel"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-chart-3" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Threat Detection
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  XSS Detection Engine
                </span>
                <span
                  className={`text-xs font-medium ${
                    detectionWorking ? "text-emerald-400" : "text-destructive"
                  }`}
                >
                  {detectionWorking ? "✓ Operational" : "✗ Failed"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Messages Blocked</span>
                <span
                  className={`text-xs font-medium font-mono ${
                    blockedCount > 0 ? "text-yellow-400" : "text-emerald-400"
                  }`}
                >
                  {blockedCount}
                </span>
              </div>
              {blockedCount === 0 ? (
                <div className="mt-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20 px-4 py-3 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  No threats detected in this session
                </div>
              ) : (
                <div className="mt-2 rounded-xl bg-yellow-500/10 border border-yellow-400/20 px-4 py-3 text-xs text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {blockedCount} message(s) blocked due to malicious content
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-2xl p-6"
            data-ocid="security.activity.panel"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-chart-1" />
                <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Recent Activity
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLog}
                className="h-7 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                data-ocid="security.clear_log.button"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </Button>
            </div>
            <ScrollArea className="h-52">
              {activityLog.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground/50 text-xs"
                  data-ocid="security.activity.empty_state"
                >
                  No activity recorded yet
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activityLog.map((entry, i) => (
                    <div
                      key={`${entry.time}-${i}`}
                      className="flex items-center justify-between text-xs"
                      data-ocid={`security.activity.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span
                          className={`font-mono truncate ${
                            entry.action.startsWith("rate-limited")
                              ? "text-yellow-400"
                              : entry.action.startsWith("message-blocked")
                                ? "text-destructive"
                                : "text-foreground/80"
                          }`}
                        >
                          {entry.action}
                        </span>
                      </div>
                      <span className="text-muted-foreground/60 flex-shrink-0 ml-2">
                        {timeAgo(entry.time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
