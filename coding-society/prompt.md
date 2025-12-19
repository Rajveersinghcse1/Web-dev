# Finalized Solution: Coding Society - The AI-Native Developer Ecosystem

## Purpose of this Prompt
This prompt guides an AI Architect to review, improve, and implement the navigation experience and page structure for Coding Society. It includes a deep analysis of the existing navigation component, a page-to-nav mapping, accessibility and UX recommendations, and a concrete updated prompt for engineering the next phases.

---

## Summary (one-line)
Improve navigation reliability, accessibility, and developer mapping so the AI can reason about the UI, routes, and page responsibilities in context.

---

## Navbar Analysis (deep)
Source: `src/components/Navigation.jsx` (authenticated-only header).

- Primary responsibilities
    - Provide mode-specific navigation for Study vs Professional modes.
    - Show contextual items (Dashboard, Library, Innovation, Compiler, Gamified) in Study mode.
    - Show Feed, Internships, Hackathons, Resume Builder in Professional mode.
    - Provide profile dropdown with role-sensitive items and Sign Out.
    - Provide a mode toggle, notification button, and mobile menu (hamburger).

- Key behaviors and logic (observed)
    - Renders nothing when `user` is falsy or on `/auth` route.
    - Uses `currentMode` from `ModeContext` to decide items.
    - `handleCompilerNavigation()` triggers `setAuthenticatedNavigation()` (backend flow) when user opens the compiler.
    - Desktop: visible nav with icons + labels; Mobile: collapsible menu and profile actions.
    - Profile dropdown contains dynamic role badge (ADMIN vs other) and closes on outside clicks.

- Strengths
    - Clear separation of study vs professional modes.
    - Accessible pattern for outside-click closing and mobile fallback.
    - Iconography via `lucide-react` and descriptive titles on links.

- Issues & opportunities (actionable)
    1. Active-path detection uses strict equality; improve to allow prefix matches and query-preserving (e.g., /feed/123 should keep Feed active).
    2. Provide ARIA roles, keyboard focus management, and skip links for accessibility (menu, profile list, and mobile close button). Add `aria-expanded` and `aria-controls` attributes.
    3. Improve SSR/initial-hydration safety: guard any window/document usage and defer listeners where needed.
    4. Extract nav item configuration into a single source-of-truth (JSON/module) to keep pages and nav consistent; generate sitemap and tests from it.
    5. Add analytics hooks on nav clicks and mode toggles for telemetry and A/B testing of modes.
    6. Preserve scroll and feed position on navigation return (REQ-FEED-020 referenced in SRS).
    7. Test coverage: unit tests for `Navigation` logic (mode switch, compiler navigation) and snapshot tests for responsive markup.

---

## Page Mapping (pages to reconcile with navbar)
Files under `src/pages` (purpose summary):

- `HomePage.jsx` — Landing / marketing + entry point.
- `FeedPage.jsx` / `UltraAdvancedFeedPage.jsx` — Social feed, posts, and engagement.
- `DashboardPage.jsx` — Study analytics and progress charts (Study mode primary landing).
- `LibraryPage_Enhanced.jsx` — Reading materials and resources.
- `IdeasPage.jsx` / `Innovation` pages — Idea submission and collaboration.
- `CompilerPage.jsx` / `CompilerPageWrapper.jsx` — Online IDE integration and runner.
- `GamifiedPage.jsx` / `QuizPage.jsx` — Quizzes, puzzles, and gamified learning.
- `HackathonPage.jsx` — Hackathon listing and management.
- `InternshipPage.jsx` — Internship listings and applications.
- `ResumeBuilder` variants — ATS-optimized resume creation.
- `ProfilePage.jsx` — User profile, settings and account details.
- `CareerPage.jsx` / `PortfolioPage.jsx` — Career center and portfolios.
- `HelpSupportPage.jsx` — Support articles and contact.
- `RoadmapPage.jsx` / `ResearchPage.jsx` — Structured learning paths and research hub.
- `Admin/*` — Admin dashboard and protected routes.

Action: ensure each nav item maps to exactly one canonical page file, or add a redirect route/alias if multiple variants exist (e.g., `FeedPage_new.jsx` -> `/feed`).

---

## Suggested Implementation Tasks (concrete)
1. Extract navigation items into `src/config/navigation.js` as canonical array objects: { id, name, path, icon, mode, roles, description }. Import into `Navigation.jsx` and pages that need mapping.
2. Enhance `isActivePath()` to accept prefix matching and route param awareness (use `matchPath` from `react-router`).
3. Add ARIA attributes and keyboard handlers: `onKeyDown` for Enter/Escape, roving tabindex for dropdown items, and `aria-expanded` toggles.
4. Add unit tests for navigation state transitions and e2e tests verifying focus management on mobile/desktop breakpoints.
5. Create `docs/navigation.md` that documents nav items, route owners, and expected UX for cross-team clarity.

---

## Updated Prompt — for AI Architect / Code-Gen Agent
Use the following updated instruction when asking an AI to modify or generate code for navigation and pages. This is the canonical prompt to place into `prompt.md` for future runs.

You are an AI Architect and Senior Engineer. Focus on the navigation layer and page routing for the Coding Society project. Your goals:

- Produce a single source-of-truth `src/config/navigation.js` listing all navigation items, modes (STUDY / PROFESSIONAL), access roles, icons, and descriptions.
- Update `src/components/Navigation.jsx` to import that config and:
    - Use `matchPath` for active-route detection (support prefix matching and route params).
    - Add ARIA attributes, keyboard navigation, and `aria-live` region for notifications.
    - Ensure mobile menu and profile dropdown are fully keyboard accessible.
    - Add analytics events on nav clicks and mode toggle.
- Reconcile every item in `src/config/navigation.js` with a canonical page in `src/pages`. If multiple page variants exist (e.g., `FeedPage_new.jsx`), pick one canonical file and add a route alias mapping in the router config.
- Add tests: unit tests for `Navigation` behaviors and a Cypress/E2E spec that validates navigation across mobile and desktop breakpoints.

Constraints & Safety:
- Do not remove authentication guards — navigation must remain hidden for unauthenticated users (current behavior).
- Preserve existing icons and aesthetics; focus on accessibility and correctness first.
- Keep changes minimal and isolated: extract configs and augment logic without large rewrites.

Deliverables:
1. `src/config/navigation.js` (canonical list)
2. Modified `src/components/Navigation.jsx` importing the config and enhanced logic + ARIA
3. `docs/navigation.md` describing routes and mapping to pages
4. Unit test files for navigation

When you complete this, produce a short changelog and the list of updated files.

