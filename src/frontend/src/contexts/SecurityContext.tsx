import { createContext, useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createRateLimiter, sessionTracker } from "../utils/security";

interface SecurityContextValue {
  checkAction: (action: string) => boolean;
}

const SecurityContext = createContext<SecurityContextValue>({
  checkAction: () => true,
});

const globalRateLimiter = createRateLimiter(20, 1000); // 20 actions/second guard

export function SecurityProvider({ children }: { children: ReactNode }) {
  const isInIframe = useRef<boolean>(false);

  useEffect(() => {
    // Detect iframe embedding
    try {
      isInIframe.current = window.self !== window.top;
    } catch {
      // Cross-origin frame access throws — treat as iframe
      isInIframe.current = true;
    }

    // Record session start
    sessionTracker.recordAction("session-start");
  }, []);

  const checkAction = (action: string): boolean => {
    if (!globalRateLimiter()) {
      sessionTracker.recordAction(`rate-limited:${action}`);
      return false;
    }
    sessionTracker.recordAction(action);
    return true;
  };

  // If running inside an iframe, block rendering
  if (isInIframe.current) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "oklch(0.11 0.04 265)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          zIndex: 9999,
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          color: "oklch(0.94 0.015 265)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "oklch(0.6 0.22 25 / 0.2)",
            border: "2px solid oklch(0.6 0.22 25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
        >
          🔒
        </div>
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Access Denied
          </h1>
          <p
            style={{
              color: "oklch(0.62 0.05 265)",
              marginBottom: "1rem",
              maxWidth: 400,
            }}
          >
            VirtX cannot be embedded inside another page for security reasons.
          </p>
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.6rem 1.5rem",
              borderRadius: "9999px",
              background:
                "linear-gradient(135deg, oklch(0.72 0.18 205), oklch(0.55 0.28 290))",
              color: "white",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Open VirtX directly →
          </a>
        </div>
      </div>
    );
  }

  return (
    <SecurityContext.Provider value={{ checkAction }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurityGuard() {
  return useContext(SecurityContext);
}
