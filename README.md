# The Businessverse

An immersive, presenter-controlled career discovery experience for **IMS Vadodara**. Built to run on a laptop connected to a projector, as a ~10-minute opening activity before a careers seminar for Class 11 Commerce students.

**Your stream is not your ceiling.** Explore. Think. Decide. Discover.

| Act | Title | What happens |
| --- | --- | --- |
| 01 | The Reality Check | Kinetic typography from "CLASS 11." to "YOUR STREAM IS NOT YOUR CEILING.", then a portal into the Businessverse. Plays on its own. |
| 02 | Enter the Businessverse | A 3D universe of five career worlds — Finance, Strategy, Marketing, Innovation, Technology — revealed one by one. |
| 03 | The Boardroom Challenge | A hypothetical ₹10,00,000 startup: three options, a 15-second countdown, a hand vote, every consequence, then who makes these decisions. |
| 04 | The Unlocked Path | Class 11 & 12 → undergraduation → CAT → MBA → careers, unlocking stage by stage, then where IMS comes in. |
| 05 | The IMS Reveal | The pathway converges into light, the official IMS logo is revealed, and the final screen holds for the seminar hand-over. |

---

## On the day (presenter quick start)

1. **Double-click `Start Presentation.bat`.** It builds the show if needed and opens it in the browser at `http://localhost:4173`. No internet is needed once dependencies are installed.
2. Press **F** for fullscreen.
3. Press **M** if you want sound (it always starts muted).
4. Press **→** (or a clicker's *Next*) to move on whenever you are ready.

| Key | Action |
| --- | --- |
| → / Page Down | Next beat or scene |
| ← / Page Up | Previous beat or scene (lands on the previous scene's last beat) |
| Space | Pause / resume (also pauses the Boardroom countdown) |
| F | Fullscreen |
| M | Sound on / off |
| R | Restart from the beginning |
| ? or H | Show the shortcut panel |
| Esc | Close the panel / exit fullscreen |
| 1 / 2 / 3 (or A / B / C) | Boardroom only: record the class vote |

On-screen controls and the cursor hide after ~2.6 s without mouse movement; move the mouse to bring them back. Clicking an act on the bottom timeline jumps to the start of that act.

### What runs by itself and what waits for you

- **Act 01** plays through and hands over to Act 02 on its own (→ skips ahead beat by beat).
- **Act 02** waits on every world. Each → reveals the next one.
- **Act 03 never moves on by itself.** Steps: welcome → brief → options → **countdown** → hand vote → outcome A → B → C → "No single right answer" → who makes these decisions → Continue.
  - Click **Start 15-second countdown** (or →). When it hits zero it shows *Hands up!* and **waits**; pressing → during the countdown ends it early.
  - Record the winning option by clicking its card or pressing **1 / 2 / 3**. It stays highlighted through the outcomes. No option is ever presented as the correct one.
- **Act 04** waits on every stage.
- **Act 05** plays through and **holds on the final screen** until you press R or close the window.

---

## Editing content (no code changes needed)

| File | What it controls |
| --- | --- |
| `src/config/presentation.config.ts` | Scene order and durations, autoplay on/off, audio levels, all Act 01 text, Act 05 closing messages. |
| `src/data/careerWorlds.ts` | The five career worlds: titles, quotes, careers and their plain-language explanations, colours. |
| `src/data/businessScenario.ts` | The Boardroom: funds, the three options, countdown length, consequences, lessons, roles. |
| `src/data/pathway.ts` | The five pathway stages (CAT/MBA wording) and the IMS connection copy. |
| `src/config/branding.config.ts` | IMS logo path, brand colours, institutional description, optional Vadodara centre details. |
| `public/assets/branding/ims-logo.svg` | The official IMS logo. Replace this file to change it. |

Set `presentationSettings.autoplay = false` to make every beat — including Act 01 — wait for the presenter.

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

- **React 18 + Vite + TypeScript**, Tailwind CSS v4 plus hand-written CSS, **GSAP** timelines, **three.js** (Act 02), Lucide icons.
- **Fixed 1920×1080 stage**, scaled to fit the display: layout and type are identical at 1366×768, 1600×900, 1920×1080 and 2560×1440. Nothing reflows and nothing clips.
- `PresentationController` holds the show state (scene, pause, sound, fullscreen, help). `SceneManager` overlaps the outgoing and incoming scenes so transitions are continuous.
- `useSceneTimeline` gives Acts 01, 02, 04 and 05 a GSAP master timeline with beats (arrow keys jump between them), hold points that wait for the presenter, pause/resume and auto-advance. Anything that must survive jumping (background mood, 3D camera focus) is derived from the playhead.
- Act 03 is a small step state machine (`BoardroomScene`); its countdown runs on wall-clock time and pauses with the show.
- Act 02's universe is vanilla three.js in a separate, lazily-loaded chunk that is prefetched during Act 01. Without WebGL it automatically falls back to a CSS rendition of the same worlds.
- One persistent particle canvas (`BackgroundEffects`) carries the atmosphere across all acts.
- **Sound** is original and synthesised live with the Web Audio API (`src/utils/audioEngine.ts`): an ambient drone plus impact, tick, glitch, whoosh, rise and reveal effects. No audio files and no streaming. It is muted by default, and nothing depends on it.
- **Fonts**: Space Grotesk and Inter variable fonts (SIL Open Font License), Latin + Latin-Extended subsets only (Latin-Extended carries ₹), in `public/assets/fonts/` and preloaded.
- **Reduced motion**: with the OS "reduce motion" setting on, kinetic movement becomes simple fades and looping motion stops.

```
src/
  App.tsx, main.tsx
  config/        presentation.config.ts, branding.config.ts
  data/          careerWorlds.ts, businessScenario.ts, pathway.ts
  scenes/        IntroScene, PortalScene, BusinessverseScene, BoardroomScene, CareerPathScene, IMSRevealScene
  components/
    presentation/  PresentationController, SceneManager, Stage, PresentationControls, ProgressIndicator, ShortcutsOverlay
    shared/        AnimatedText, BackgroundEffects, HudFrame, IMSLogo
    intro/  businessverse/  boardroom/  pathway/
  hooks/         usePresentation, useSceneTimeline, useKeyboardControls, useReducedMotion
  utils/         audioEngine, motion, stores, fullscreen, timing, webgl
  styles/        globals, fonts, typography, animations, businessverse, boardroom, pathway
public/assets/   branding/ims-logo.svg, fonts/
```

See **TESTING.md** for what has been tested and the checklist to run on the real projector.
