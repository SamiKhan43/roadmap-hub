<div align="center">

# Interactive Learning Roadmaps

**Structured, step-by-step developer roadmaps. Pick a learning path, study real-world examples, complete interactive challenges, and build production-ready projects.**

[![Live Demo](https://img.shields.io/badge/demo-live-34d399?style=for-the-badge)](https://YOUR-USERNAME.github.io/roadmaps/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
![No Build Step](https://img.shields.io/badge/build-none-lightgrey?style=for-the-badge)
![Hosted on GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-24292e?style=for-the-badge&logo=github)

[Live Demo](https://YOUR-USERNAME.github.io/roadmaps/) · [Explore Roadmaps](#available-roadmaps) · [Quick Start](#quick-start) · [Add a New Path](#adding-a-new-roadmap) · [Contributing](#contributing)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Available Roadmaps](#available-roadmaps)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Adding a New Roadmap](#adding-a-new-roadmap)
- [Deployment Guide](#deployment-guide)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [Technical Notes](#technical-notes)
- [License](#license)

---

## About the Project

Traditional learning guides are often just overwhelming walls of links. This project reimagines documentation by transforming topics into an **interactive, guided learning timeline**. Every single level features:

- A dedicated, self-contained lesson primer.
- Real-world context and architectural blueprints.
- A hands-on practice challenge with integrated hints.
- A portfolio-ready mini-project to validate your skills.

**The best part?** It is a zero-dependency, plain static site. With **no frameworks, no build steps, and no backend complexity**, you can spin it up locally, host it anywhere for free, and extend it in minutes.

---

## Key Features

| Feature | Description |
| :--- | :--- |
| **Dynamic Roadmap Picker** | Filter and search through available paths directly from an intuitive dashboard card system. |
| **Interactive Lesson Drawer** | Access concept overviews, multi-language syntax blueprints, and concrete, real-world analogies. |
| **Targeted Practice Challenges** | Reinforce your learning with custom problems, progressive hints, and step-by-step solutions. |
| **Milestone Level Projects** | Cap off each learning level by building an independent, portfolio-grade practical application. |
| **Local Progress Tracking** | Automatically track completed topics and modules. Progress is safely saved inside your browser storage. |
| **Contextual Theme Accents** | Enjoy a cohesive, modern dark layout where each individual path carries its own custom accent branding. |
| **Power-User Shortcuts** | Fast keyboard navigation: press `/` to search, `←` `→` to traverse topics, and `Esc` to exit drawers. |
| **Fully Responsive Layout** | Clean, responsive UI optimized fluidly for mobile devices, tablets, and ultra-wide desktops. |

---

## Available Roadmaps

| Learning Path | Levels | Total Topics | Release Status |
| :--- | :---: | :---: | :--- |
| [SQL Fundamentals](sql/) | 5 | 32 | **Production Live** |
| PostgreSQL Deep-Dive | — | — | In Development |
| FastAPI Architecture | — | — | In Development |
| Auth & Identity Management | — | — | In Development |

> Note: The **SQL Roadmap** systematically navigates through core fundamentals, intermediate join mechanics, complex analytical queries, and production topics like indexing, transactions, and security practices.

---

## Quick Start

This project requires absolutely no compilation, package installation, or environment configuration.

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/roadmaps.git
cd roadmaps
```

### 2. Launch Local Environment
You can double-click `index.html` to open it directly in your browser. Alternatively, run a lightweight local development server:

```bash
# Using Python 3
python3 -m http.server 8000
```
Once initialized, navigate to `http://localhost:8000`.

> [!NOTE]
> An active internet connection is required to dynamically fetch utilities like Tailwind CSS and Lucide Icons from their CDNs.

---

## Project Structure

The codebase is structured to maximize simplicity and modularity:

```text
roadmaps/
├── index.html        # Main dashboard and Roadmap Picker
├── README.md         # Repository documentation
├── LICENSE           # Open-source license terms
└── sql/
    └── index.html    # Isolated, self-contained single-page roadmap
```

Every learning path functions autonomously within its own directory using a single HTML file with its content embedded.

---

## Adding a New Roadmap

Follow these steps to expand the platform with a custom learning path:

### Step 1: Build Your Roadmap Page
Generate your roadmap from its content file into the target directory:
```bash
python build_roadmap.py roadmap.json fastapi/index.html --accent cyan --hub ../
```

### Step 2: Establish the Directory
Ensure your new file is placed within its own subdirectory matching your pathway name (e.g., `fastapi/index.html`).

### Step 3: Register Content on the Hub Dashboard
Open the root `index.html` file, locate the global `ROADMAPS` array definition, and append your project entry metadata:

```javascript
{
  slug: "fastapi",
  title: "FastAPI Architecture",
  icon: "zap",
  rgb: "34,211,238",
  status: "live",
  levels: 5,
  topics: 28,
  desc: "Design, secure, and deploy high-performance Python APIs.",
  tags: ["Backend", "Python"]
}
```
*   Ensure the `slug` exactly matches your subdirectory name.
*   Verify the `rgb` value matches your roadmap's accent color.

### Step 4: Push to Source Control
Commit your updates and push to your remote branch. GitHub Pages redeploys automatically, usually within a minute or two.

---

## Deployment Guide

Deploying to production takes less than two minutes using **GitHub Pages**:

1. Push your cloned fork or repository directly to your personal GitHub profile.
2. Navigate to your repository dashboard and select **Settings** ➔ **Pages**.
3. Under the **Build and deployment** section, configure the source dropdown to **Deploy from a branch**.
4. Set your target branch to `main` and the deployment folder to `/ (root)`, then click **Save**.
5. Your application will be live at `https://YOUR-USERNAME.github.io/roadmaps/` momentarily.

---

## Tech Stack

- **Core Engine:** Vanilla HTML5, CSS3, and modern ECMAScript JavaScript (no compilation dependencies)
- **Styling Architecture:** [Tailwind CSS](https://tailwindcss.com) (distributed via CDN)
- **Iconography:** [Lucide](https://lucide.dev) (distributed via CDN)
- **State Lifecycle:** Native Web `localStorage` API for progress caching (client-side only, no cookies)

---

## Contributing

We welcome community collaborations! Whether you are adding a completely new roadmap, fixing a logical error, updating examples, or refining UI design:

1. Fork the project repository and isolate a working branch: `git checkout -b feat/my-new-roadmap`
2. Implement your changes and thoroughly validate behaviors in your local preview.
3. Confirm code samples, schema definitions, and queries behave as expected.
4. Submit a descriptive Pull Request detailing your enhancements.

If you spot an issue or typo within a live lesson module, please feel free to open a bug report issue containing the topic title.

---

## Technical Notes

- **Code Execution:** Code blocks and results inside lessons are **pre-written and hand-verified**. Clicking "Run" reveals the expected output and does not execute any code on your machine.
- **Data Persistence:** Clearing browser data or using Incognito windows will reset your client-side progress back to default.

---

## License

This project is open-source software distributed under the terms of the [MIT License](LICENSE). You are free to modify, redistribute, and build on it as needed.

---

<div align="center">

If these roadmaps helped speed up your learning journey, consider giving the repository a star to support the project!

</div>