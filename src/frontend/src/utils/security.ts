// ── Security utilities for VirtX ──────────────────────────────────────────

/**
 * Strip HTML tags and dangerous characters from user input.
 * Use for ALL user-supplied text before rendering or storing.
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";
  let out = input.slice(0, 2000);
  // Remove script tags and their content
  out = out.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  // Remove on* event attributes (e.g. onclick, onload)
  out = out.replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]*)/gi, "");
  // Remove javascript: protocol
  out = out.replace(/javascript\s*:/gi, "");
  // Remove data:text/html
  out = out.replace(/data\s*:\s*text\/html/gi, "");
  // Strip all remaining HTML tags
  out = out.replace(/<[^>]*>/g, "");
  return out.trim();
}

/**
 * Rate limiter factory.
 * Returns a function that returns true if the action is allowed,
 * false if the rate limit has been exceeded.
 */
export function createRateLimiter(
  maxCalls: number,
  windowMs: number,
): () => boolean {
  const timestamps: number[] = [];
  return () => {
    const now = Date.now();
    // Remove timestamps outside the window
    while (timestamps.length > 0 && now - timestamps[0] > windowMs) {
      timestamps.shift();
    }
    if (timestamps.length >= maxCalls) {
      return false;
    }
    timestamps.push(now);
    return true;
  };
}

/**
 * Detect common XSS / SQL-injection / malicious input patterns.
 * Returns true when the input looks dangerous.
 */
export function detectMaliciousInput(input: string): boolean {
  if (typeof input !== "string") return false;
  const lower = input.toLowerCase();
  const patterns = [
    /<script/i,
    /javascript\s*:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /vbscript\s*:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    // SQL injection patterns
    /['"\s]or\s+[\d'"]+\s*=\s*[\d'"]+/i,
    /drop\s+table/i,
    /union\s+select/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /--\s*$/,
    /;\s*(drop|alter|create|truncate)/i,
  ];
  return patterns.some((p) => p.test(lower));
}

/**
 * Validate and sanitize a URL.
 * Only allows https:// URLs and relative paths.
 * Returns '#' for anything dangerous.
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== "string") return "#";
  const trimmed = url.trim();
  // Allow relative URLs
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  // Allow https
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  // Block everything else (javascript:, data:, http:, ftp:, etc.)
  return "#";
}

// ── Session activity tracker ───────────────────────────────────────────────

const SESSION_KEY = "virtx_session_log";

export const sessionTracker = {
  recordAction(action: string): void {
    try {
      const existing = this.getRecentActions();
      existing.push({ action, time: Date.now() });
      // Keep last 100 entries
      const trimmed = existing.slice(-100);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(trimmed));
    } catch {
      // sessionStorage unavailable — fail silently
    }
  },

  getRecentActions(): Array<{ action: string; time: number }> {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Array<{ action: string; time: number }>;
    } catch {
      return [];
    }
  },

  clearLog(): void {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // fail silently
    }
  },
};
