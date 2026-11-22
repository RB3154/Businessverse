# Testing

## Automated checks (run 2026-11-22 against the production build)

All runs used `npm run build`, then `npm run present`, driven by headless Chrome. Internet was simulated as unavailable: every hostname except `localhost` failed to resolve.

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) and production build | Pass |
| Standby screen on load; Enter starts the show with sound | Pass |
| Full keyboard pass through all six acts with sound on, internet blocked | Pass. Acts 01 to 06 reached, no console errors or warnings. |
| Network requests to anything other than localhost / failed requests | None / none |
| Act 01 plays by itself and hands over to Act 02, which then waits | Pass |
| Act 03: → starts the countdown, Space pauses it, → ends it | Pass |
| Act 03: → does not advance without a locked decision | Pass |
| Act 03: 1/2/3 lock a decision; ← after locking returns to the vote with the choice kept | Pass |
| Act 03: team chips record each team's vote; the result dashboard animates from the previous state | Pass |
| Act 05: 1 / 2 or a click records the room's side; the result shows both insights and the takeaway | Pass |
| Act 06 plays by itself and holds on the final screen; extra → does nothing; R restarts | Pass |
| Missing logo file shows the marked placeholder | Pass (the 404 and a clear console error are expected in this test only) |
| `prefers-reduced-motion: reduce` | Pass |
| 1600×900 and 2560×1440 (plus 1920×1080) | Pass. No overflow or clipping. |

Screenshots of every beat were inspected at 1920×1080. Spot checks were made at the other three resolutions.

## Not testable headlessly — check on the real laptop and projector

Run this once on the actual presentation hardware, ideally in the venue.

- [ ] **Offline for real:** turn Wi-Fi off, double-click `Start Presentation.bat` and run the whole show.
- [ ] **Fullscreen:** F enters, F/Esc exits; the cursor disappears when the mouse is still.
- [ ] **Sound:** start with sound. The ambient pad plays and effects land (Act 01 hits and record scratch, Act 02 dings, Act 03 countdown ticks, lock-in, drumroll and breaking-news alert, final reveal chime). Check the volume against the presenter's voice; adjust `audioSettings` in `presentation.config.ts` if needed.
- [ ] **Clicker:** Next/Previous move through beats (most clickers send Page Down/Up). In Act 03 the presenter still needs the keyboard (1/2/3) or mouse to lock decisions.
- [ ] **Rehearse Act 03 with a real room:** splitting into teams, the 15 s and 10 s countdowns, and how long the debate actually takes.
- [ ] **Projector readability:** read the Act 03 decision cards and dashboard, and the Act 02 clue cards, from the back row.
- [ ] **Colours on the projector:** the IMS logo plate and IMS blue look right.
- [ ] **Timing rehearsal:** a full run with the presenter talking lands near 10 minutes; the elapsed clock is on the bottom-right of the controls.

## Content review before the event

- [ ] IMS reviews the institutional description and the four features (`branding.config.ts`, `data/pathway.ts`).
- [ ] Someone checks the CAT wording in Act 04 (`data/pathway.ts`).
- [ ] Someone reviews the copy written for this project: the CEO outcomes and trade-offs (`data/businessScenario.ts`), the Amul clues and functions, the ₹199 order breakdown, career explanations and Would You Rather insights (`data/experience.ts`).
- [ ] If the Vadodara address is to be shown, re-verify it on https://www.imsindia.com/center/vadodara/ and set `vadodaraCentre.show: true`.
