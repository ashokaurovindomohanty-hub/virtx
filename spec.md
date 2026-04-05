# VirtX - Security Layer & Cross-Device Compatibility

## Current State
VirtX is a full-stack virtual event platform with 10 pages, dark neon design, multilingual support, Stripe payments, Misa AI assistant, and a test/debug runner. The app uses Internet Identity (ICP) for authentication, React/TypeScript frontend, and Motoko backend with authorization, blob-storage, http-outcalls, and Stripe components.

Existing security aspects:
- Internet Identity authentication via `@dfinity/auth-client`
- Role-based access control in backend (`authorization` component)
- Admin page requires identity login before displaying content
- Stripe payments via backend-mediated sessions

Missing security hardening:
- No Content Security Policy (CSP) headers
- No input sanitization / XSS defense in chat/forms
- No rate limiting on user actions (Misa chat, connect, etc.)
- Admin route accessible via direct URL without RBAC enforcement on the frontend
- No anti-clickjacking headers
- HTML `<title>` missing, `<meta>` SEO/security tags missing
- No viewport/mobile meta optimization
- No HTTPS redirect enforcement signals

Cross-device gaps:
- No PWA manifest or service worker
- No touch-optimized controls in Virtual Room (buttons too small)
- No safe-area insets for notch/home-indicator devices
- No print media stylesheet
- No `prefers-reduced-motion` support

## Requested Changes (Diff)

### Add
- `SecurityProvider` React context wrapping app: handles CSP meta tag injection, session timeout warnings, and security event logging
- `useSecurityGuard` hook: rate-limiting per action (debounce + max-calls), auto-detects and blocks suspicious repeated inputs
- `sanitize` utility: strips HTML tags and dangerous characters from all user text inputs before rendering or submission
- Admin route guard: redirect non-admin users away from `/admin` with a 403-style "Access Denied" page
- `index.html` hardening: CSP meta tag, X-Frame-Options equivalent, referrer policy, viewport meta, theme-color, title, Apple/PWA meta tags
- `SecurityAuditPage` at `/security` (admin-only): shows session info, role, activity log, and security status
- Responsive touch targets: min 44x44px touch areas across all interactive elements
- `prefers-reduced-motion` CSS: disable animations for users who opt out
- Safe-area insets via CSS env() for notch/home-indicator devices
- Comprehensive PWA meta tags for iOS and Android home screen installation

### Modify
- `MisaWidget`: sanitize user input before processing, add rate-limit (max 1 message/second)
- `VirtualRoomPage`: larger touch-friendly control buttons on mobile, safe-area bottom padding
- `AdminPage`: add secondary frontend RBAC check (hide page entirely if not admin principal)
- `App.tsx`: wrap with `SecurityProvider`, add admin route guard component
- `index.html`: add all security meta tags, PWA manifest link, proper title
- `index.css`: add `prefers-reduced-motion`, safe-area insets, better touch target sizing
- `Navbar.tsx`: add `aria-label` to all interactive controls for accessibility
- `TestDebugPage.tsx`: add security tests to the test suite (CSP present, admin guard working, sanitization)

### Remove
- Nothing removed — hardening only

## Implementation Plan
1. Harden `index.html` with CSP, meta tags, PWA tags, title
2. Create `src/utils/security.ts` with sanitize, rate-limit, and XSS-detection utilities
3. Create `src/contexts/SecurityContext.tsx` with SecurityProvider and useSecurityGuard
4. Add admin route guard in `App.tsx`
5. Add 403 Access Denied page component inline in App.tsx
6. Harden `MisaWidget.tsx` with sanitize + rate limiting
7. Harden `AdminPage.tsx` with RBAC check
8. Update `index.css` with prefers-reduced-motion, safe-area, touch targets
9. Update `VirtualRoomPage.tsx` with touch-friendly controls
10. Create `SecurityAuditPage.tsx` (admin-only security dashboard)
11. Add SecurityAuditPage route to App.tsx
12. Update `TestDebugPage.tsx` to include security test cases
