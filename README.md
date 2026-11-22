# The Businessverse

An immersive, presenter-controlled career discovery experience for **IMS Vadodara**. Built to run on a laptop connected to a projector, as a ~10-minute opening activity before a careers seminar for Class 11 Commerce students.

**Your stream is not your ceiling.** Explore. Think. Decide. Discover.

**Live (unlisted):** https://businessverse-rho.vercel.app — hosted on Vercel; every push to `main` redeploys automatically. For the event itself, run it offline from the laptop (see below).

| Act | Title | What happens |
| --- | --- | --- |
| 01 | The Reality Check | "BE HONEST. When someone says COMMERCE... what comes to mind?" then CA, B.COM, ACCOUNTING, MBA, a red **WAIT.**, and the business machine behind a food order. Plays by itself (~30 s). |
| 02 | Guess the Business | Game-show rounds: a mystery brand from three clues (Amul) and what makes it work; then the ₹199 food order and everything an app must worry about, each tied to a job. |
| 03 | You Are the CEO | The centrepiece. SNACKRUSH (fictional) has ₹10 lakh and 30 days. The room splits into **Team A: Growth** and **Team B: Survival**, debates, votes, locks a decision and watches the dashboard react; then breaking news (a competitor cuts prices by 30%) forces a second decision. Ends with who really makes these calls. |
| 04 | The Career Reveal | Five scenarios ("Who do you call?") then the reveal: consultant, brand manager, financial analyst, product manager, entrepreneur, each with its own look. |
| 05 | Would You Rather? | Four split-screen hand votes (₹1 crore salary or build a ₹100 crore company?...) and the business thinking behind each side. |
| 06 | The Next Move | A quick pathway (Class 11-12, degree, skills, management prep, MBA, careers; CAT as one route), where IMS comes in, then: "Your stream is not your ceiling. Your future is not pre-decided. Your next move starts with curiosity." and the IMS logo. Plays by itself and holds. |

---

## On the day (presenter quick start)

1. **Double-click `Start Presentation.bat`.** It builds the show if needed and opens it in the browser at `http://localhost:4173`. No internet is needed once dependencies are installed.
2. Press **F** for fullscreen. A quiet **standby screen** waits while the room fills up.
3. When ready, press **→ / Enter** (or a clicker's *Next*, or click **Start with sound**) to begin. Choose **Start muted** for no sound; **M** toggles sound at any time.
4. Press **→** to move on whenever you are ready.

| Key | Action |
| --- | --- |
| → / Page Down | Next beat or scene |
| ← / Page Up | Previous beat or scene (lands on the previous scene's last beat) |
| Space | Pause / resume (also pauses the Act 03 countdown) |
| F | Fullscreen |
| M | Sound on / off |
| R | Restart from the beginning |
| ? or H | Show the shortcut panel |
| Esc | Close the panel / exit fullscreen |
| 1 / 2 / 3 | Act 03: lock the class decision · Act 05: 1 / 2 picks the room's side |

On-screen controls and the cursor hide after ~2.6 s without mouse movement; move the mouse to bring them back. Clicking an act on the bottom timeline jumps to the start of that act.

### What runs by itself and what waits for you

- **Act 01** plays by itself (~30 s) and hands over to Act 02. It pauses ~3 s after "What comes to mind?" so the room can shout answers.
- **Acts 02, 04 and 05** wait for →: each press reveals the next clue, answer or question. In Act 05, click a side or press **1 / 2** to record which side the room picked.
- **Act 03 never moves on by itself.** For each decision: → starts the countdown, → again ends it early (Space pauses it), then tap **TEAM A / TEAM B** on each team's pick and press **1 / 2 / 3** to lock the class decision. → will not continue until a decision is locked. ← always steps back (a locked choice is kept), so an accidental press is easy to undo.
- **Act 06** plays by itself (6 s per pathway stage; change with `pathwayTiming`) and **holds on the final screen** until you press R or close the window.

---

## Editing content (no code changes needed)

| File | What it controls |
| --- | --- |
| `src/config/presentation.config.ts` | Scene order and durations, autoplay, Act 01 text, Act 06 pacing (`pathwayTiming`) and closing lines, audio levels. |
| `src/data/experience.ts` | Act 02 (brand clues, answer, functions, the ₹199 order), Act 04 (career scenarios and explanations), Act 05 (Would You Rather questions and insights). |
| `src/data/businessScenario.ts` | Act 03: the company, teams, both decisions, dashboard effects, headlines, trade-offs, the twist and the roles. All figures are fictional. |
| `src/data/pathway.ts` | Act 06 pathway stages (CAT/MBA wording) and the IMS connection copy. |
| `src/config/branding.config.ts` | IMS logo path, brand colours, institutional description, optional Vadodara centre details. |
| `public/assets/branding/ims-logo.svg` | The official IMS logo. Replace this file to change it. |

Brands (Amul, Zomato, Swiggy) appear only as names in examples: no logos, no statistics, only broad well-known facts.

### Branding notes

- The logo is the SVG served by the official IMS India website header (verified 2026-11-22). It is dark ink on white, so on the dark scenes it always sits on a white plate; its colours and proportions are never altered. If the file goes missing, a clearly marked orange placeholder appears instead of a broken image.
- IMS Blue `#0481FE` is the recognisable accent throughout; the brief's provisional palette is used for the rest.
- The IMS description and its four features (classroom learning, personal mentoring, SimCAT mock tests, learning resources) were checked against imsindia.com and the IMS Vadodara pages. No statistics, success rates, salaries or guarantees are shown anywhere.
- The Vadodara centre address (from the official centre page, 2026-11-22) is stored but hidden. Set `vadodaraCentre.show: true` to show it on the final screen — re-verify it first.

---

## Development

Requires Node.js 18+ (built and tested on Node 24).

```bash
npm install          # once, needs internet
npm run dev          # dev server with hot reload — http://localhost:5173
npm run typecheck    # TypeScript only
npm run build        # production build into dist/
npm run present      # serve the production build and open it — http://localhost:4173
npm start            # build + present
```

The production build must be served over HTTP (`npm run present` or the `.bat` launcher). Opening `dist/index.html` directly from disk will not work, because browsers block JavaScript modules loaded from `file://`.

### Moving it to the presentation laptop

Copy the whole folder (including `node_modules`, or run `npm install` once while online), then use `Start Presentation.bat`. After that, no internet is used at all: fonts, logo, 3D and sound are all local.

### How it's built

- **React 18 + Vite + TypeScript**, Tailwind CSS v4 plus hand-written CSS, **GSAP** timelines, Lucide icons.
- **Fixed 1920×1080 stage**, scaled to fit the display: layout and type are identical at 1366×768, 1600×900, 1920×1080 and 2560×1440. Nothing reflows and nothing clips.
- `PresentationController` holds the show state (scene, pause, sound, fullscreen, help). `SceneManager` overlaps the outgoing and incoming scenes so transitions are continuous.
- Cinematic acts (01, 06) use `useSceneTimeline`: a GSAP master timeline with beats, holds, pause/resume and auto-advance. Interactive acts (02-05) use `useStepScene`: discrete presenter-led steps with reliable ← / → and recovery. Act 03's countdown runs on wall-clock time and pauses with the show.
- Each act has its own art direction (black editorial, cream game show, control room, per-career looks, split screens) instead of one repeated look.
- One persistent particle canvas (`BackgroundEffects`) carries the atmosphere across all acts.
- **Sound** is original and synthesised live with the Web Audio API (`src/utils/audioEngine.ts`): an ambient pad plus impact, tick, pop, glitch, whoosh, rise, reveal, breaking-news alert, decision confirm, record scratch, ding and drumroll cues, voiced in the mid range so laptop speakers and projectors can actually play them, with a compressor on the master. No audio files and no streaming. Nothing plays until the presenter starts with sound (browsers only allow audio after a click or key press), and nothing depends on it.
- **Fonts**: Space Grotesk and Inter variable fonts (SIL Open Font License), Latin + Latin-Extended subsets only (Latin-Extended carries ₹), in `public/assets/fonts/` and preloaded.
- **Reduced motion**: with the OS "reduce motion" setting on, kinetic movement becomes simple fades and looping motion stops.

```
src/
  App.tsx, main.tsx
  config/        presentation.config.ts, branding.config.ts
  data/          experience.ts, businessScenario.ts, pathway.ts
  scenes/        IntroScene, GuessScene, CeoScene, CareersScene, WouldYouRatherScene, CareerPathScene, IMSRevealScene
  components/
    presentation/  PresentationController, SceneManager, Stage, PresentationControls, ProgressIndicator, ShortcutsOverlay
    shared/        AnimatedText, BackgroundEffects, HudFrame, IMSLogo
    intro/  ceo/  pathway/
  hooks/         usePresentation, useSceneTimeline, useStepScene, useEntrance, useKeyboardControls, useReducedMotion
  utils/         audioEngine, motion, stores, fullscreen, timing
  styles/        globals, fonts, typography, animations, experience, pathway
public/assets/   branding/ims-logo.svg, fonts/
```

See **TESTING.md** for what has been tested and the checklist to run on the real projector.
