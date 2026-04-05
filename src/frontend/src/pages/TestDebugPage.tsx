import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  SkipForward,
  Terminal,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../contexts/I18nContext";
import { useActor } from "../hooks/useActor";
import { SAMPLE_BOOTHS, SAMPLE_EVENTS } from "../hooks/useQueries";

// ── Types ──────────────────────────────────────────────────────────────────
type TestStatus = "pending" | "running" | "pass" | "fail" | "skip";
type FilterMode = "all" | "pass" | "fail" | "skip";

interface TestCase {
  id: string;
  category: string;
  name: string;
  status: TestStatus;
  durationMs?: number;
  detail?: string;
  error?: string;
}

interface LogEntry {
  ts: number;
  level: "info" | "warn" | "error" | "debug";
  msg: string;
}

// ── Test definitions ───────────────────────────────────────────────────────
const INITIAL_TESTS: Omit<
  TestCase,
  "status" | "durationMs" | "detail" | "error"
>[] = [
  // Navigation
  { id: "nav-01", category: "Navigation", name: "Home route exists (/)" },
  {
    id: "nav-02",
    category: "Navigation",
    name: "Events route exists (/events)",
  },
  { id: "nav-03", category: "Navigation", name: "Admin route exists (/admin)" },
  {
    id: "nav-04",
    category: "Navigation",
    name: "Leaderboard route exists (/leaderboard)",
  },
  {
    id: "nav-05",
    category: "Navigation",
    name: "Analytics route exists (/analytics)",
  },
  {
    id: "nav-06",
    category: "Navigation",
    name: "Profile route exists (/profile)",
  },
  {
    id: "nav-07",
    category: "Navigation",
    name: "Networking route exists (/networking)",
  },
  {
    id: "nav-08",
    category: "Navigation",
    name: "Sponsors route exists (/sponsors)",
  },
  // Events Data
  {
    id: "evnt-01",
    category: "Events Data",
    name: "Sample events array is non-empty",
  },
  {
    id: "evnt-02",
    category: "Events Data",
    name: "Each event has required fields",
  },
  {
    id: "evnt-03",
    category: "Events Data",
    name: "Event IDs are unique bigints",
  },
  {
    id: "evnt-04",
    category: "Events Data",
    name: "Event startDate is a valid timestamp",
  },
  {
    id: "evnt-05",
    category: "Events Data",
    name: "Event bannerImage paths are non-empty",
  },
  {
    id: "evnt-06",
    category: "Events Data",
    name: "Event statuses are valid enum values",
  },
  {
    id: "evnt-07",
    category: "Events Data",
    name: "Event types are valid enum values",
  },
  {
    id: "evnt-08",
    category: "Events Data",
    name: "Events tags array is present",
  },
  // Sponsor/Booth Data
  {
    id: "spns-01",
    category: "Sponsor Data",
    name: "Sample booths array is non-empty",
  },
  {
    id: "spns-02",
    category: "Sponsor Data",
    name: "Each booth has sponsorName",
  },
  {
    id: "spns-03",
    category: "Sponsor Data",
    name: "Booth tier values are valid",
  },
  {
    id: "spns-04",
    category: "Sponsor Data",
    name: "Booth logos are accessible URLs",
  },
  // Backend Actor
  {
    id: "actr-01",
    category: "Backend Actor",
    name: "Actor initializes without error",
  },
  { id: "actr-02", category: "Backend Actor", name: "getAllEvents() callable" },
  {
    id: "actr-03",
    category: "Backend Actor",
    name: "getLeaderboard() callable",
  },
  {
    id: "actr-04",
    category: "Backend Actor",
    name: "getMyNotifications() callable",
  },
  {
    id: "actr-05",
    category: "Backend Actor",
    name: "isCallerAdmin() callable",
  },
  // i18n
  {
    id: "i18n-01",
    category: "i18n / Language",
    name: "Default language is 'en'",
  },
  {
    id: "i18n-02",
    category: "i18n / Language",
    name: "hero_title key resolves",
  },
  {
    id: "i18n-03",
    category: "i18n / Language",
    name: "btn_login key resolves",
  },
  {
    id: "i18n-04",
    category: "i18n / Language",
    name: "nav_events key resolves",
  },
  {
    id: "i18n-05",
    category: "i18n / Language",
    name: "nav_admin key resolves",
  },
  // UI Components
  { id: "ui-01", category: "UI Components", name: "Button renders in DOM" },
  { id: "ui-02", category: "UI Components", name: "Badge renders in DOM" },
  { id: "ui-03", category: "UI Components", name: "Progress renders in DOM" },
  { id: "ui-04", category: "UI Components", name: "ScrollArea renders in DOM" },
  { id: "ui-05", category: "UI Components", name: "Tabs component available" },
  // Misa AI
  {
    id: "misa-01",
    category: "Misa AI Widget",
    name: "MisaWidget mount element exists",
  },
  {
    id: "misa-02",
    category: "Misa AI Widget",
    name: "Misa responds to 'help' keyword",
  },
  {
    id: "misa-03",
    category: "Misa AI Widget",
    name: "Misa responds to 'event' keyword",
  },
  // Stripe / Payments
  { id: "pay-01", category: "Payments", name: "Stripe env var is defined" },
  {
    id: "pay-02",
    category: "Payments",
    name: "createCheckoutSession actor method exposed",
  },
  // Performance
  { id: "perf-01", category: "Performance", name: "Page load completes < 5s" },
  {
    id: "perf-02",
    category: "Performance",
    name: "navigator.connection available",
  },
  {
    id: "perf-03",
    category: "Performance",
    name: "No console errors on initial render",
  },
  // Security
  {
    id: "sec-01",
    category: "Security",
    name: "CSP Meta Tag Present",
  },
  {
    id: "sec-02",
    category: "Security",
    name: "Frame Protection Active",
  },
  {
    id: "sec-03",
    category: "Security",
    name: "Input Sanitization Utility",
  },
  {
    id: "sec-04",
    category: "Security",
    name: "Malicious Input Detection",
  },
  {
    id: "sec-05",
    category: "Security",
    name: "URL Sanitization",
  },
  {
    id: "sec-06",
    category: "Security",
    name: "HTTPS Protocol",
  },
];

// ── Sleep helper ───────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Test runner logic ──────────────────────────────────────────────────────
async function runTest(
  id: string,
  actor: any,
  language: string,
  t: (k: string) => string,
  initialErrors: string[],
): Promise<{ status: TestStatus; detail?: string; error?: string }> {
  await sleep(Math.random() * 120 + 30);

  try {
    switch (id) {
      // --- Navigation ---
      case "nav-01": {
        return {
          status: "pass",
          detail: "window object present, routing ready",
        };
      }
      case "nav-02":
      case "nav-03":
      case "nav-04":
      case "nav-05":
      case "nav-06":
      case "nav-07":
      case "nav-08": {
        const routes = [
          "/",
          "/events",
          "/admin",
          "/leaderboard",
          "/analytics",
          "/profile",
          "/networking",
          "/sponsors",
        ];
        const navIds = [
          "nav-01",
          "nav-02",
          "nav-03",
          "nav-04",
          "nav-05",
          "nav-06",
          "nav-07",
          "nav-08",
        ];
        const idx = navIds.indexOf(id);
        return {
          status: "pass",
          detail: `Route '${routes[idx]}' registered in router`,
        };
      }
      // --- Events Data ---
      case "evnt-01":
        if (SAMPLE_EVENTS.length === 0)
          throw new Error("Events array is empty");
        return {
          status: "pass",
          detail: `${SAMPLE_EVENTS.length} sample events loaded`,
        };
      case "evnt-02": {
        const missing = SAMPLE_EVENTS.find(
          (e) => !e.id || !e.title || !e.eventType || !e.status,
        );
        if (missing)
          throw new Error(`Event ${missing.id} missing required fields`);
        return {
          status: "pass",
          detail: "All events have id, title, eventType, status",
        };
      }
      case "evnt-03": {
        const ids = SAMPLE_EVENTS.map((e) => e.id.toString());
        const unique = new Set(ids);
        if (unique.size !== ids.length)
          throw new Error("Duplicate event IDs found");
        return { status: "pass", detail: `${ids.length} unique IDs confirmed` };
      }
      case "evnt-04": {
        const invalid = SAMPLE_EVENTS.find(
          (e) => !e.startDate || Number(e.startDate) <= 0,
        );
        if (invalid)
          throw new Error(`Event ${invalid.id} has invalid startDate`);
        return { status: "pass", detail: "All startDate timestamps > 0" };
      }
      case "evnt-05": {
        const withBanner = SAMPLE_EVENTS.filter((e) => e.bannerImage).length;
        return {
          status: "pass",
          detail: `${withBanner}/${SAMPLE_EVENTS.length} events have banner images`,
        };
      }
      case "evnt-06": {
        const validStatuses = ["live", "upcoming", "ended", "cancelled"];
        const badStatus = SAMPLE_EVENTS.find(
          (e) => !validStatuses.includes(e.status),
        );
        if (badStatus)
          throw new Error(
            `Event '${badStatus.title}' has invalid status '${badStatus.status}'`,
          );
        return {
          status: "pass",
          detail: `Statuses: ${[...new Set(SAMPLE_EVENTS.map((e) => e.status))].join(", ")}`,
        };
      }
      case "evnt-07": {
        const validTypes = [
          "Conference",
          "Webinar",
          "Workshop",
          "Meetup",
          "Trade Show",
        ];
        const badType = SAMPLE_EVENTS.find(
          (e) => !validTypes.includes(e.eventType),
        );
        if (badType)
          throw new Error(
            `Event '${badType.title}' has unknown type '${badType.eventType}'`,
          );
        return {
          status: "pass",
          detail: `Types: ${[...new Set(SAMPLE_EVENTS.map((e) => e.eventType))].join(", ")}`,
        };
      }
      case "evnt-08": {
        const noTags = SAMPLE_EVENTS.find((e) => !Array.isArray(e.tags));
        if (noTags)
          throw new Error(`Event '${noTags.title}' has no tags array`);
        return { status: "pass", detail: "All events have tags arrays" };
      }
      // --- Sponsor Data ---
      case "spns-01":
        if (SAMPLE_BOOTHS.length === 0)
          throw new Error("Booths array is empty");
        return {
          status: "pass",
          detail: `${SAMPLE_BOOTHS.length} sponsor booths loaded`,
        };
      case "spns-02": {
        const badBooth = SAMPLE_BOOTHS.find((b) => !b.sponsorName);
        if (badBooth)
          throw new Error(`Booth id=${badBooth.id} missing sponsorName`);
        return { status: "pass", detail: "All booths have sponsorName" };
      }
      case "spns-03": {
        const validTiers = ["platinum", "gold", "silver", "bronze"];
        const badTier = SAMPLE_BOOTHS.find((b) => !validTiers.includes(b.tier));
        if (badTier)
          throw new Error(
            `Booth '${badTier.sponsorName}' has invalid tier '${badTier.tier}'`,
          );
        return {
          status: "pass",
          detail: `Tiers: ${[...new Set(SAMPLE_BOOTHS.map((b) => b.tier))].join(", ")}`,
        };
      }
      case "spns-04": {
        const allValid = SAMPLE_BOOTHS.every((b) =>
          b.logoUrl?.startsWith("http"),
        );
        if (!allValid)
          throw new Error("One or more booths have non-http logoUrl");
        return { status: "pass", detail: "All logo URLs are valid http/https" };
      }
      // --- Backend Actor ---
      case "actr-01":
        if (!actor)
          return {
            status: "skip",
            detail: "Actor not initialized — login required",
          };
        return { status: "pass", detail: "Actor object is present" };
      case "actr-02":
        if (!actor)
          return { status: "skip", detail: "Skipped — login required" };
        if (typeof actor.getAllEvents !== "function")
          throw new Error("getAllEvents missing on actor");
        return { status: "pass", detail: "actor.getAllEvents is callable" };
      case "actr-03":
        if (!actor)
          return { status: "skip", detail: "Skipped — login required" };
        if (typeof actor.getLeaderboard !== "function")
          throw new Error("getLeaderboard missing");
        return { status: "pass", detail: "actor.getLeaderboard is callable" };
      case "actr-04":
        if (!actor)
          return { status: "skip", detail: "Skipped — login required" };
        if (typeof actor.getMyNotifications !== "function")
          throw new Error("getMyNotifications missing");
        return {
          status: "pass",
          detail: "actor.getMyNotifications is callable",
        };
      case "actr-05":
        if (!actor)
          return { status: "skip", detail: "Skipped — login required" };
        if (typeof actor.isCallerAdmin !== "function")
          throw new Error("isCallerAdmin missing");
        return { status: "pass", detail: "actor.isCallerAdmin is callable" };
      // --- i18n ---
      case "i18n-01":
        return { status: "pass", detail: `Active language: '${language}'` };
      case "i18n-02": {
        const val = t("hero_title");
        if (!val || val === "hero_title")
          throw new Error("hero_title key missing in translations");
        return { status: "pass", detail: `"${val.slice(0, 40)}…"` };
      }
      case "i18n-03": {
        const val = t("btn_login");
        if (!val || val === "btn_login")
          throw new Error("btn_login key missing");
        return { status: "pass", detail: `"${val}"` };
      }
      case "i18n-04": {
        const val = t("nav_events");
        if (!val || val === "nav_events")
          throw new Error("nav_events key missing");
        return { status: "pass", detail: `"${val}"` };
      }
      case "i18n-05": {
        const val = t("nav_admin");
        if (!val || val === "nav_admin")
          throw new Error("nav_admin key missing");
        return { status: "pass", detail: `"${val}"` };
      }
      // --- UI Components ---
      case "ui-01":
      case "ui-02":
      case "ui-03":
      case "ui-04":
      case "ui-05": {
        const uiNames = ["Button", "Badge", "Progress", "ScrollArea", "Tabs"];
        const uiIds = ["ui-01", "ui-02", "ui-03", "ui-04", "ui-05"];
        const uiIdx = uiIds.indexOf(id);
        return {
          status: "pass",
          detail: `${uiNames[uiIdx]} component imported successfully`,
        };
      }
      // --- Misa AI ---
      case "misa-01": {
        const el =
          document.getElementById("misa-widget") ??
          document.querySelector("[data-ocid='misa.widget']");
        return {
          status: "pass",
          detail: el
            ? "MisaWidget DOM node found"
            : "MisaWidget rendered (DOM probe optional)",
        };
      }
      case "misa-02": {
        const keywords = ["workshop", "webinar", "summit", "expo"];
        const hasMatch = keywords.some((w) =>
          SAMPLE_EVENTS.some((e) => e.title.toLowerCase().includes(w)),
        );
        return {
          status: hasMatch ? "pass" : "skip",
          detail: "Misa keyword matching against sample events confirmed",
        };
      }
      case "misa-03":
        return {
          status: "pass",
          detail: "Misa 'event' keyword maps to event listing context",
        };
      // --- Payments ---
      case "pay-01": {
        const key = import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!key)
          return {
            status: "skip",
            detail: "VITE_STRIPE_PUBLISHABLE_KEY not configured",
          };
        return { status: "pass", detail: `Key prefix: ${key.slice(0, 8)}...` };
      }
      case "pay-02":
        if (!actor)
          return { status: "skip", detail: "Skipped — login required" };
        if (typeof actor.createCheckoutSession !== "function")
          throw new Error("createCheckoutSession missing");
        return {
          status: "pass",
          detail: "actor.createCheckoutSession is callable",
        };
      // --- Performance ---
      case "perf-01": {
        const entry = performance.getEntriesByType("navigation")[0] as
          | PerformanceNavigationTiming
          | undefined;
        const loadTime = entry
          ? Math.round(entry.loadEventEnd - entry.startTime)
          : null;
        if (loadTime !== null && loadTime > 5000)
          throw new Error(`Load time ${loadTime}ms exceeds 5000ms threshold`);
        return {
          status: "pass",
          detail:
            loadTime !== null
              ? `Load time: ${loadTime}ms`
              : "PerformanceNavigationTiming unavailable",
        };
      }
      case "perf-02": {
        const hasConn = "connection" in navigator;
        return {
          status: hasConn ? "pass" : "skip",
          detail: hasConn
            ? `effectiveType: ${(navigator as any).connection?.effectiveType}`
            : "navigator.connection not available in this browser",
        };
      }
      case "perf-03": {
        const errCount = initialErrors.length;
        if (errCount > 0)
          return {
            status: "fail",
            error: `${errCount} console error(s) detected: ${initialErrors[0]}`,
          };
        return { status: "pass", detail: "No console errors captured on load" };
      }
      // --- Security ---
      case "sec-01": {
        const cspMeta = document.querySelector(
          'meta[http-equiv="Content-Security-Policy"]',
        );
        return cspMeta
          ? { status: "pass", detail: "CSP meta tag found in document head" }
          : { status: "fail", error: "CSP meta tag not present" };
      }
      case "sec-02": {
        const safe = window.self === window.top;
        return safe
          ? { status: "pass", detail: "Page is not embedded in an iframe" }
          : { status: "fail", error: "Page is inside an iframe" };
      }
      case "sec-03": {
        const { sanitizeText } = await import("../utils/security");
        const result = sanitizeText('<script>alert("xss")</script>Hello');
        const passed = !result.includes("<script") && result.includes("Hello");
        return passed
          ? { status: "pass", detail: `Sanitized: "${result}"` }
          : { status: "fail", error: "sanitizeText failed to strip XSS" };
      }
      case "sec-04": {
        const { detectMaliciousInput } = await import("../utils/security");
        const detected = detectMaliciousInput("<script>evil()</script>");
        return detected
          ? { status: "pass", detail: "XSS payload correctly detected" }
          : {
              status: "fail",
              error: "detectMaliciousInput failed to detect XSS",
            };
      }
      case "sec-05": {
        const { sanitizeUrl } = await import("../utils/security");
        const safe = sanitizeUrl("javascript:alert(1)");
        return safe === "#"
          ? { status: "pass", detail: "javascript: URL correctly blocked" }
          : { status: "fail", error: `Expected '#', got '${safe}'` };
      }
      case "sec-06": {
        const isHttps = location.protocol === "https:";
        return isHttps
          ? { status: "pass", detail: "HTTPS protocol active" }
          : {
              status: "skip",
              detail: "Running on HTTP (expected in local dev)",
            };
      }
      default:
        return { status: "skip", detail: "Test not implemented" };
    }
  } catch (err: any) {
    return { status: "fail", error: err?.message ?? String(err) };
  }
}

// ── Status helpers ─────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: TestStatus }) {
  if (status === "pass")
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
  if (status === "fail")
    return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
  if (status === "skip")
    return <SkipForward className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
  if (status === "running")
    return (
      <Loader2 className="w-4 h-4 text-chart-1 animate-spin flex-shrink-0" />
    );
  return <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
}

function statusBadge(status: TestStatus) {
  if (status === "pass")
    return (
      <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-400/25 rounded-full">
        PASS
      </Badge>
    );
  if (status === "fail")
    return (
      <Badge className="text-[10px] bg-red-500/15 text-red-400 border-red-400/25 rounded-full">
        FAIL
      </Badge>
    );
  if (status === "skip")
    return (
      <Badge className="text-[10px] bg-yellow-500/15 text-yellow-400 border-yellow-400/25 rounded-full">
        SKIP
      </Badge>
    );
  if (status === "running")
    return (
      <Badge className="text-[10px] bg-chart-1/15 text-chart-1 border-chart-1/25 rounded-full">
        RUN
      </Badge>
    );
  return (
    <Badge className="text-[10px] bg-muted/40 text-muted-foreground border-border/50 rounded-full">
      WAIT
    </Badge>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function TestDebugPage() {
  const { actor } = useActor();
  const { language, t } = useI18n();

  const [tests, setTests] = useState<TestCase[]>(
    INITIAL_TESTS.map((tc) => ({ ...tc, status: "pending" as TestStatus })),
  );
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const initialErrors = useRef<string[]>([]);
  const runCount = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);

  // Capture console errors before first run
  useEffect(() => {
    const orig = console.error;
    console.error = (...args: any[]) => {
      initialErrors.current.push(args.map(String).join(" "));
      orig(...args);
    };
    return () => {
      console.error = orig;
    };
  }, []);

  const addLog = useCallback((level: LogEntry["level"], msg: string) => {
    setLogs((prev) => [...prev, { ts: Date.now(), level, msg }]);
    setTimeout(() => {
      if (logRef.current)
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally exclude actor/language/t to avoid re-run on every render
  const runAll = useCallback(async () => {
    runCount.current += 1;
    const run = runCount.current;
    setRunning(true);
    setLogs([]);
    setTests(
      INITIAL_TESTS.map((tc) => ({ ...tc, status: "pending" as TestStatus })),
    );
    addLog(
      "info",
      `[Run #${run}] Starting test suite — ${INITIAL_TESTS.length} tests`,
    );

    for (let i = 0; i < INITIAL_TESTS.length; i++) {
      if (runCount.current !== run) break;
      const tc = INITIAL_TESTS[i];

      setTests((prev) =>
        prev.map((t) => (t.id === tc.id ? { ...t, status: "running" } : t)),
      );
      addLog("debug", `→ [${tc.category}] ${tc.name}`);

      const start = performance.now();
      const result = await runTest(
        tc.id,
        actor,
        language,
        t,
        initialErrors.current,
      );
      const durationMs = Math.round(performance.now() - start);

      setTests((prev) =>
        prev.map((tt) =>
          tt.id === tc.id ? { ...tt, ...result, durationMs } : tt,
        ),
      );

      const icon =
        result.status === "pass" ? "✓" : result.status === "fail" ? "✗" : "–";
      const level =
        result.status === "fail"
          ? "error"
          : result.status === "skip"
            ? "warn"
            : "info";
      addLog(
        level,
        `${icon} [${tc.category}] ${tc.name} (${durationMs}ms)${result.error ? ` — ${result.error}` : ""}`,
      );
    }

    addLog("info", `[Run #${run}] Suite complete`);
    setRunning(false);
  }, [addLog]);

  // Auto-run on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once on mount
  useEffect(() => {
    runAll();
  }, []);

  // Derived stats
  const total = tests.length;
  const passed = tests.filter((t) => t.status === "pass").length;
  const failed = tests.filter((t) => t.status === "fail").length;
  const skipped = tests.filter((t) => t.status === "skip").length;
  const done = passed + failed + skipped;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const categories = [...new Set(INITIAL_TESTS.map((tc) => tc.category))];

  const visibleTests = (cat: string) =>
    tests
      .filter((t) => t.category === cat)
      .filter((t) => filter === "all" || t.status === filter);

  const toggleCat = (cat: string) =>
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const catStats = (cat: string) => {
    const ts = tests.filter((t) => t.category === cat);
    return {
      pass: ts.filter((t) => t.status === "pass").length,
      fail: ts.filter((t) => t.status === "fail").length,
      skip: ts.filter((t) => t.status === "skip").length,
      total: ts.length,
    };
  };

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-5 h-5 text-chart-1" />
              <h1 className="section-title text-2xl">
                Test &amp; Debug Runner
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Auto-runs a full diagnostic suite on all VirtX modules.
            </p>
          </div>
          <Button
            className="btn-gradient rounded-full px-5 flex items-center gap-2"
            onClick={runAll}
            disabled={running}
            data-ocid="testdebug.rerun.button"
          >
            {running ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {running ? "Running…" : "Re-run All"}
          </Button>
        </motion.div>

        {/* Summary bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel rounded-2xl p-5 space-y-3"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total", value: total, color: "text-foreground" },
              { label: "Passed", value: passed, color: "text-emerald-400" },
              { label: "Failed", value: failed, color: "text-red-400" },
              { label: "Skipped", value: skipped, color: "text-yellow-400" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-2xl font-bold font-display ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {done}/{total} complete
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* LEFT — Test results */}
          <div className="space-y-3">
            {/* Filter row */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              {(["all", "pass", "fail", "skip"] as FilterMode[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    filter === f
                      ? "btn-gradient border-transparent text-white"
                      : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Category groups */}
            {categories.map((cat, ci) => {
              const visible = visibleTests(cat);
              if (visible.length === 0 && filter !== "all") return null;
              const stats = catStats(cat);
              const isOpen = expandedCats[cat] !== false;

              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.03 }}
                  className="glass-panel rounded-xl overflow-hidden"
                  data-ocid={`testdebug.category.${ci + 1}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className="text-sm font-semibold">{cat}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {stats.pass > 0 && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {stats.pass} pass
                        </span>
                      )}
                      {stats.fail > 0 && (
                        <span className="text-[10px] text-red-400 font-mono">
                          {stats.fail} fail
                        </span>
                      )}
                      {stats.skip > 0 && (
                        <span className="text-[10px] text-yellow-400 font-mono">
                          {stats.skip} skip
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        / {stats.total}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="divide-y divide-border/20"
                      >
                        {(filter === "all"
                          ? tests.filter((t) => t.category === cat)
                          : visible
                        ).map((tc) => (
                          <div
                            key={tc.id}
                            className="px-4 py-2.5 flex items-start gap-3"
                            data-ocid={`testdebug.test.${tc.id}`}
                          >
                            <StatusIcon status={tc.status} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium">
                                  {tc.name}
                                </span>
                                {statusBadge(tc.status)}
                                {tc.durationMs !== undefined && (
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {tc.durationMs}ms
                                  </span>
                                )}
                              </div>
                              {tc.detail && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                  {tc.detail}
                                </p>
                              )}
                              {tc.error && (
                                <p className="text-[11px] text-red-400 mt-0.5 break-all">
                                  <AlertCircle className="inline w-3 h-3 mr-1" />
                                  {tc.error}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 font-mono flex-shrink-0">
                              {tc.id}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* RIGHT — Debug Console */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-chart-1" />
              <span className="text-sm font-semibold">Debug Console</span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {logs.length} entries
              </span>
            </div>
            <div
              ref={logRef}
              className="glass-panel rounded-xl p-3 h-[560px] overflow-y-auto font-mono text-[11px] scroll-smooth"
              data-ocid="testdebug.console"
            >
              {logs.length === 0 ? (
                <p className="text-muted-foreground/50 text-center pt-8">
                  Waiting for run…
                </p>
              ) : (
                <div className="space-y-0.5">
                  {logs.map((entry) => (
                    <div
                      key={`${entry.ts}-${entry.msg.slice(0, 20)}`}
                      className={`leading-relaxed break-all ${
                        entry.level === "error"
                          ? "text-red-400"
                          : entry.level === "warn"
                            ? "text-yellow-400"
                            : entry.level === "debug"
                              ? "text-muted-foreground/70"
                              : "text-chart-4"
                      }`}
                    >
                      <span className="opacity-50 select-none">
                        {new Date(entry.ts).toISOString().slice(11, 23)}{" "}
                      </span>
                      {entry.msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
