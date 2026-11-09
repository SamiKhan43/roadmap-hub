# SQL Learning Roadmap

An interactive roadmap for learning SQL, starting with basic queries and moving towards advanced database concepts and practical analytics.

**Live Demo:** https://SamiKhan43.github.io/sql-roadmap/

## Features

- **32 topics in 5 levels**, covering SQL from fundamentals to real-world applications.
- **Visual roadmap** showing the learning path and topic progression.
- **Topic details** including explanations, syntax, examples, sample tables, and expected query results.
- **Progress tracking** to mark completed topics and milestones. Progress is saved in your browser using `localStorage`.
- **Keyboard navigation** using `←` and `→` to switch topics and `Esc` to close a lesson.
- **Responsive layout** with a dark theme.
- No installation or build process required.

## Roadmap

| Level | Topics | Coverage |
|---|---:|---|
| 1. Fundamentals | 1–6 | Databases and basic SQL queries |
| 2. Intermediate | 7–14 | Functions, joins, subqueries, and DML |
| 3. Advanced | 15–20 | CTEs, window functions, views, and database design |
| 4. Professional | 21–27 | Transactions, indexing, optimization, and security |
| 5. Real-World SQL & Analytics | 28–32 | Data cleaning, business analysis, projects, and interview preparation |

## Project Structure

```text
sql-roadmap/
├── index.html   # HTML, CSS, JavaScript, and lesson content
└── README.md
```

## Run Locally

There is no setup required.

1. Clone or download the repository.
2. Open `index.html` in your browser.

An internet connection is needed to load Tailwind CSS and Lucide Icons from their CDNs.

## Deploy on GitHub Pages

1. Push the project files to a GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder.
5. Save the settings.

GitHub Pages will publish the site. The URL will follow this format:

```text
https://YOUR-USERNAME.github.io/REPO-NAME/
```

## Editing the Roadmap

The lesson content is stored in the `TOPICS` array inside `index.html`.

Each topic contains:

- `t` — Topic title
- `c` — Subtopics
- `p` — Explanation
- `s` — SQL syntax
- `sc` — Practical scenario
- `tb` — Sample tables
- `q` — Example SQL query
- `o` — Expected query output

You can edit existing topics or add new ones directly in this array.

## Notes

- The **Run query** button displays predefined results. It does not execute SQL against a real database.
- The examples primarily use PostgreSQL syntax. Some queries may need adjustments for MySQL, SQL Server, or Oracle.

## Technologies

- HTML
- CSS
- Tailwind CSS
- JavaScript
- Lucide Icons

Tailwind CSS and Lucide Icons are loaded through CDNs.

## License

This project is released under the [MIT License](https://opensource.org/licenses/MIT).