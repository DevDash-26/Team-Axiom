# Demo Script

> Time budget: 8 min total (yellow card at 6:00, red at 8:00), then about 5 min Q&A.
> Target: finish by 7:30. The live demo should take about 3-4 minutes.
> Rehearse this at least twice with a timer. Every step below must work with seeded data.

## 0. Pre-demo checklist (do this before the judges are ready)

- [ ] App running locally from the final commit (fresh clone, not a dirty working folder)
- [ ] Seed data loaded, demo accounts verified
- [ ] Browser zoom set for the projector, unrelated tabs and notifications closed
- [ ] Hotspot on as backup, app does not depend on live internet (or has a fallback)
- [ ] Second device/browser logged in as the other role, if the flow needs two roles
- [ ] Slides open, Google Drive upload done, backup PDF on the desktop
- [ ] Screenshots or a short screen recording of the demo path saved as a fallback
      (recorded before the event closes, not during the event photography ban - use your own
      screen capture only, never a camera)
- [ ] Timer/phone ready for the person tracking time

## 1. Demo accounts

| Role | Email / username | Password | Notes |
|------|------------------|----------|-------|
| | | | |

## 2. Roles for the pitch

| Segment | Presenter | Time |
|---------|-----------|------|
| Problem and our understanding | | 1:00 |
| What we built, priorities, what we cut and why | | 2:00 |
| Live demo | | 3:30 |
| Architecture and key technical decisions | | 1:00 |
| Wrap-up and future work | | 0:30 |

**Q&A lead (technical):** TODO
**Q&A backup (frontend / data / tests):** TODO
**Rule:** anyone may answer, but each person answers questions about the parts they built.

## 3. Demo flow (happy path)

| # | Action | What to say (one line) | Expected result | Requirement ID | Time |
|---|--------|------------------------|-----------------|----------------|------|
| 1 | | | | FR-01 | 0:30 |
| 2 | | | | FR-02 | 0:30 |
| 3 | | | | FR-03 | 0:45 |
| 4 | | | | | |
| 5 | Show the differentiator | | | INN-01 | 0:45 |

## 4. Show depth (pick 2-3 to highlight in the demo)

- [ ] Validation error shown gracefully (submit bad input)
- [ ] Role-based access (log in as a different role, show what is blocked)
- [ ] Conflict / edge case handled (e.g. duplicate, double booking, out of range)
- [ ] Search / filter / pagination on a list
- [ ] Tests passing (`<test command>` in a terminal, 10 seconds)

## 5. If something breaks

| Failure | Recovery |
|---------|----------|
| App will not start | Switch to the backup laptop with a pre-verified clone |
| Network drops | Switch to hotspot; the app should run locally |
| A feature errors mid-demo | Stay calm, say what it should do, move to the next step, show the screen recording |
| Demo data missing | Re-run the seed command: `<seed command>` |
| Rule reminder | Organisers allow using your own device to demo if submission issues are raised by judges |

## 6. Likely Q&A (prepare answers)

**About decisions**
- Why this stack / architecture / database?
- Why did you prioritise X over Y? What did you cut?
- What would you build next with another week?

**About the code**
- Walk us through how [core feature] works from UI to database.
- How do you handle authentication and authorisation?
- How is input validated, and what happens on failure?
- How do you prevent [the main edge case for this problem]?
- How did you test it? What is not covered?

**About AI and integrity**
- Which parts did you use AI for, and how did you verify them?
- Which libraries did you use? (Answer from DISCLOSURES.md)
- Show me the commit history: who built what?

**About limits**
- What are the known bugs or limitations?
- How would this scale, and what would break first?
- What are the security risks you are aware of?

## 7. Slide outline (build in the 45-minute window after 3:30 PM)

1. Title, team, problem statement in one sentence
2. Our understanding of the problem and the users
3. What we built (priority order) and what we left out, with reasons
4. Live demo (switch to the app)
5. Architecture and data model (one diagram)
6. Quality: validation, security, tests
7. Innovation / differentiator
8. Limitations and next steps

**Slide rule:** few words, one diagram, no walls of text. The demo carries the pitch.
