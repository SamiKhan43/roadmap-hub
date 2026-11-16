# Computer Fundamentals — Architecture Library Module 01

## Included
- Module overview page
- 11 individual lesson pages
- Shared lesson data, styling, and behavior
- Responsive lesson navigation and progress tracking
- Interactive knowledge checks with immediate explanations
- Inline SVG diagrams
- Architecture Library integration snippet

## Install
1. This repository keeps the included `computer-fundamentals/` folder within `architecture/computer-fundamentals-module/`.
2. Copy `ARCHITECTURE-LIBRARY-INTEGRATION.html`'s article into the existing `.architecture-grid` in `architecture/index.html`.
3. Keep the existing `architecture.css` and PostgreSQL guide unchanged.
4. Commit and deploy the static files through GitHub Pages.

No build step, framework, backend, or external JavaScript dependency is required.

## Progress
The module stores completed lesson IDs in localStorage under:
`roadmap-hub:architecture:computer-fundamentals:v1`

This is intentionally isolated from other roadmap progress keys. It can be unified later if the Architecture Library adopts a shared progress contract.

## Paths
The page links assume the current repository structure:
- `architecture/index.html`
- `architecture/computer-fundamentals-module/computer-fundamentals/index.html`
- `logos/logo-mark.svg`
- `logos/logo-horizontal-dark.svg`

If the logo paths change, update the relative paths in the generated HTML files.
