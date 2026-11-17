# UI/UX Rescue — Redesign Notes

**Scenario:** A student is choosing a community service program, wants to understand how much time and effort previous volunteers put in (and what they said), and then logs their own hours for a *different* program.

## 1. Problems found in the original walkthrough

| # | Where | Problem (why the student hesitates / guesses / does extra work) |
|---|---|---|
| 1 | Activity feed | Programs are shown only as codes (`ENV110`). Seeing a name means hovering over each code. |
| 2 | Activity feed | Hours are shown as `●●●○○○○○`, so you have to count dots. The filter calls hours "effort / Level N", which doesn't match the "Hours" field in the form. |
| 3 | Activity feed | Every entry says "This term" instead of its real date. |
| 4 | Dashboard | There is no place to **compare programs**. The student has to piece effort together from scattered feed cards or type codes into "Program check" one at a time. |
| 5 | Program check | The input has no label and only the placeholder "Code". Stats are labelled `avg / entries / total` with no units. The **Open program page** action is hidden behind a `⋯` menu. "Values refresh automatically" adds nothing. |
| 6 | Program page | Content is split across About / Team / Entries tabs. Comparing effort with reflections means switching tabs. Hero stats read "avg / logs". Every entry still says "This term". |
| 7 | Program page | "+ Log" sits inside the Entries tab only and does **not** pre-fill the program the student is viewing. |
| 8 | Log form | Labels are vague ("Program"). Placeholders are `0` and `…`. Nothing says hours must be 1–8, or that you can log only one entry per program. |
| 9 | Validation | Messages are "Missing field.", "Invalid value." and "Not allowed." They don't say which field failed or how to fix it. A duplicate is only revealed after submitting. |
| 10 | Feedback | Toasts only render on the dashboard, so saving from a program page shows nothing. They also never disappear on their own. "Saved." doesn't say what was saved. |
| 11 | Navigation | "+ New" is a faint grey text link while the primary action is elsewhere. "My log" works by typing `You` into the search box. Nav items are `<a>` tags without `href`, so the keyboard can't reach them. |
| 12 | Destructive action | **Reset data** is a solid red button right next to "+ Log hours", with no confirmation. |
| 13 | Noise | The "Refresh" button does nothing useful. Text is 10–12 px light beige on cream (low contrast). |

## 2. What changed

**Step 1: compare programs (new "Programs" section at the top of the home page)**
- One card per program shows the name, partner, **average hours / entry, number of entries and total hours**, the latest volunteer reflection, and a "You logged X h" badge for programs you've already done.
- A sort control (*lowest/highest average hours, most entries*) lets the student pick by effort.
- A short "1 Compare → 2 Read reflections → 3 Log hours" strip states the purpose of the page.

**Step 2: understand effort and reflections (program details page)**
- Everything is now on **one page** with no tabs: header (code, name, partner) → stats row (*average per entry, entries logged, total hours, range*) → About → "What volunteers said" → Program team (2025/26 and 2024/25 side by side).
- The page is still a shareable `#/programs/<CODE>` URL, with a **Copy link** button and a matching browser tab title.
- A primary **"+ Log hours for this program"** button pre-fills the form. If you already logged this program, it becomes **"Edit your entry (X h)"**.
- Unknown codes show a clear "Program details not yet added" notice.

**Step 3: log hours for a different program (form)**
- Clear labels with *required / optional* markers. The intro reminds you of the one-entry-per-program rule and lists the programs **you've already logged**.
- The program code field suggests directory programs and confirms the match live ("✓ Digital Skills for Seniors — City Community Library").
- **Live duplicate warning** with an "Edit that entry instead" shortcut.
- Hours field is a number input with the hint "A whole number from 1 to 8".
- Specific error messages appear next to the field they belong to, and focus moves to the first invalid field.
- Escape closes the dialog and the first field is focused when it opens.
- Toasts work on every page, disappear after 5 s, and say exactly what happened ("Logged 3 hours for TEC220 · Digital Skills for Seniors.").

**General**
- The feed shows **code + program name** (as a link), hours as a readable "3 h" plus a small 8-step bar, real dates, and a "Your entry" highlight with a labelled **Edit** button.
- The filters are labelled: Search, Hours ("Any number of hours / 1 hour … 8 hours"), plus an **Only my entries** checkbox, a "Clear filters" button and a "Showing X of Y entries" count. The useless Refresh button is gone.
- Navigation: **Programs · Activity · My entries**, with a prominent **+ Log hours** button always in the top bar. All controls are real buttons or links, with visible focus styles and a skip link.
- **Reset data** moved to a quiet footer with an explanation and a confirmation dialog.
- Higher-contrast text, larger font sizes, and a responsive layout down to phone width.

## 3. Feature checklist (all still working)

| Area | Status |
|---|---|
| Browse entries (program, hours, reflection, volunteer, edit for own) | ✅ |
| Search by code / reflection / name; filter by hours | ✅ |
| Overview stats: total entries, average hours per entry, programs with activity, hours distribution 1–8 | ✅ |
| Program check (average, entries, total hours) | ✅ (plus a visible "Open program page" button) |
| Shareable program page `#/programs/<CODE>` with name, partner, description, team for 2024/25 & 2025/26, entries | ✅ |
| Log hours (code, hours, optional reflection) | ✅ |
| Edit only your own entries | ✅ |
| Validation: code required, whole number 1–8, one entry per program | ✅ (same rules in `save`, plus live hints) |
| Persistence in `localStorage` (`acl-service-hours-v1`) and Reset data | ✅ (Reset now asks for confirmation) |

The data shape, `KEY`, `PROGRAMS`, `seed`, `readRoute`, `openProgram` and `save` are unchanged in meaning. Existing saved data keeps working.
