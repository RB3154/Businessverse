# Testing

## Automated checks (run 2026-11-22 against the production build)

All runs used `npm run build`, then `npm run present`, driven by headless Chrome. Internet was simulated as unavailable: every hostname except `localhost` failed to resolve.

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) and production build | Pass |
| Standby screen shown on load; Enter starts the show with sound | Pass |
| Full keyboard pass through all five acts with sound on | Pass. Acts 01 → 05 reached, no console errors or warnings. |
| Audio actually reaches the output (measured with an analyser tap) | Pass. Peaks around −15 dBFS, about half the energy above 200 Hz (audible on laptop speakers); M mutes to silence. |
| Act 02 worlds arrive one by one, then wait for → (no auto-advance after 15 s idle) | Pass |
| Act 04 advances every 10 s (question, five stages, IMS) and flows into Act 05 at ~70 s | Pass |
| Network requests to anything other than localhost | None |
| Failed requests or broken assets | None |
| Act 01 autoplay hands over to Act 02 unaided | Pass (reached Act 02 at ~75 s) |
| Act 05 final screen holds, and extra → presses do nothing | Pass |
| R restarts at Act 01 | Pass |
| ← from Act 04 lands on the Boardroom's last step | Pass |
| Progress-bar click starts an act from its beginning (also backwards) | Pass |
| Boardroom: countdown pauses with Space and resumes | Pass |
| Boardroom: countdown reaching zero waits for the vote (never auto-advances) | Pass |
| Boardroom: → during countdown ends it; 1/2/3 records the vote; choice highlighted in outcomes | Pass |
| Act 02 with WebGL disabled shows the CSS fallback | Pass |
| Missing logo file shows the marked placeholder (no broken image) | Pass (the 404 and a clear console error are expected in this test only) |
| `prefers-reduced-motion: reduce` | Pass. Fades only, no errors. |
| 1366×768, 1600×900, 1920×1080, 2560×1440 | Pass. Visually inspected, no overflow, no clipping. |

Screenshots of every beat were inspected at 1920×1080. Spot checks were made at the other three resolutions.

## Not testable headlessly — check on the real laptop and projector

Run this once on the actual presentation hardware, ideally in the venue.

- [ ] **Offline for real:** turn Wi-Fi off, double-click `Start Presentation.bat` and run the whole show.
- [ ] **Fullscreen:** F enters, F/Esc exits; the cursor disappears when the mouse is still.
- [ ] **Sound:** press M. The ambient drone starts and effects play (Act 01 impacts, portal whoosh, Boardroom ticks, final reveal chime). Check the volume against the presenter's voice; adjust `audioSettings` in `presentation.config.ts` if needed.
- [ ] **Clicker:** Next/Previous move through beats (most clickers send Page Down/Up).
- [ ] **Smoothness:** Act 02's 3D universe and the Act 01 portal run smoothly on this laptop. If not, the CSS fallback can be forced by disabling hardware acceleration in the browser.
- [ ] **Projector readability:** read the Boardroom cards and Act 04 stage text from the back row.
- [ ] **Colours on the projector:** the IMS logo plate and IMS blue look right.
- [ ] **Timing rehearsal:** a full run with the presenter talking lands near 10 minutes; the elapsed clock is on the bottom-right of the controls.

## Content review before the event

- [ ] IMS reviews the institutional description and the four features (`branding.config.ts`, `data/pathway.ts`).
- [ ] Someone checks the CAT wording in Act 04 (`data/pathway.ts`).
- [ ] Someone reviews the Boardroom consequences, lessons and role descriptions (`data/businessScenario.ts`) and the career explanations (`data/careerWorlds.ts`). These were written for this project; the brief supplied only titles and options.
- [ ] If the Vadodara address is to be shown, re-verify it on https://www.imsindia.com/center/vadodara/ and set `vadodaraCentre.show: true`.
