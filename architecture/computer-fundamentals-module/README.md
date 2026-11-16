# Computer & OS Fundamentals — Architecture Library modules

| Module | Folder | Lessons | Progress key |
|---|---|---|---|
| 01 Computer Fundamentals | `computer-fundamentals/` | 11 | `roadmap-hub:architecture:computer-fundamentals:v1` |
| 02 Memory Management | `memory-management/` | 15 | `roadmap-hub-memory-management-progress` |

Static HTML, CSS and vanilla JavaScript. No build step. Deployed via GitHub Pages.

## Structure
- Both modules are linked from `architecture/index.html` (cards already added).
- `architecture/arch-progress.js` reads both progress keys and shows progress on the cards.
- Module 01 renders lessons from `lessons-data.js` into 11 thin HTML pages (`lessons/NN-*.html`).
- Module 02 is a single page; lessons have URLs like `index.html#lesson-4`.
- UX enhancements live at the end of each module's `.js` and `.css` files (`cf-*` / `mm-*`).

## Adding a lesson
- Module 01: add an object to `lessons-data.js`, copy an existing `lessons/*.html`, set `data-lesson` to its index, update `LESSON-INVENTORY.txt`, the "11" counts, and the overview time total.
- Module 02: add an object to `memoryLessons`; update the "15" counts in `index.html` and `arch-progress.js`.

## Notes
- Progress is stored per browser (localStorage) and is not synced across devices.
- Quiz options are shuffled on each page load, so data order does not matter.
- `ARCHITECTURE-LIBRARY-INTEGRATION.html` is obsolete (the card is live) and can be deleted.
