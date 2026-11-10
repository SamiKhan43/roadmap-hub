# Contributing

Thanks for helping! This guide shows how to add or improve a topic. Typo fixes and small corrections are just as welcome as new lessons.

## Ways to contribute

- **Add a topic:** write a new file in `content/<roadmap>/topics/`.
- **Improve a topic:** fix an example, sharpen an analogy, correct an output.
- **Suggest a topic:** open a *Topic request* issue if you do not want to write it yourself.
- **Report a mistake:** open a *Content error* issue with the topic title.

## Which roadmap?

Each roadmap has its own source folder `content/<roadmap>/` (for example `content/fastapi/`) and builds into its own page `<roadmap>/index.html`. Replace `<roadmap>` below with that folder name. To start a brand-new roadmap, run `python3 scripts/build.py --new <roadmap>` and open an issue first so we can agree on the scope.

## Workflow

1. **Fork** the repo and create a branch: `git checkout -b topic/short-name`
2. **Copy** `_template/_TOPIC_TEMPLATE.json` to `content/<roadmap>/topics/NN-short-name.json`
   (`NN` is a two-digit number to control order inside a level, for example `05-error-handling.json`).
3. **Fill in** the fields (see the field guide below).
4. **Build:** `python3 scripts/build.py <roadmap>`. Fix any error it prints.
5. **Preview:** open `<roadmap>/index.html` and read your lesson, click Run, try the practice challenge.
6. **Commit** your topic file and the rebuilt `<roadmap>/index.html`, then open a pull request.

> If two pull requests both change the same `index.html`, the later one will conflict. Resolve it by running `python3 scripts/build.py <roadmap>` again and committing the result. Never edit a generated `index.html` by hand.

## Topic file field guide

| Field | Meaning | Rules |
| :--- | :--- | :--- |
| `l` | Level number, starting at `0` | Must match a level in `content/<roadmap>/roadmap.json` |
| `i` | Icon | A [Lucide](https://lucide.dev/icons) name in kebab-case, for example `book-open`. A wrong name shows no icon. |
| `t` | Title | Unique across all topics |
| `c` | Sub-topics (chips) | 3 to 6 short phrases |
| `p` | Primer | 2 to 4 short sentences, one real-world analogy. `<b>` and `<code>` allowed. |
| `s` | Syntax blueprint | The generic structure with placeholders such as `<name>` |
| `sc` | Scenario | One sentence of realistic context for the example |
| `tb` | Sample data | `[]`, or table keys from `roadmap.json`, or inline `{ "n": name, "c": [columns], "r": [rows] }` |
| `q` | Worked example | Real code that runs. Use `\n` for newlines. |
| `o` | Output | `{ "text": "..." }` for terminal or HTTP output, or `{ "c": [cols], "r": [rows] }` for a table (`null` for NULL) |
| `pr` | Practice | Exactly three strings: `[question, hint, solution]` |
| `lang` | Optional | Overrides the roadmap's code language for this topic |

A finished example is in [`docs/example-roadmap.json`](docs/example-roadmap.json).

## Quality checklist

- [ ] The code in `q` and the solution in `pr` actually run, and `o` matches what they print.
- [ ] The practice question can be solved using only what this lesson teaches.
- [ ] Every term is defined before it is used. One analogy, short sentences.
- [ ] No invented version numbers or features. State assumptions in the roadmap `footnote`.
- [ ] Original writing only. Do not paste text from books, courses or other sites.
- [ ] No `REPLACE:` text is left in your file.
- [ ] `python3 scripts/build.py <roadmap>` passes and `index.html` is committed.

## Changing levels, milestones or the page itself

Levels, level projects, milestones and the title live in `content/<roadmap>/roadmap.json`. Please open an issue before large structural changes. Layout fixes belong in `assets/template.html` so every roadmap benefits.

## Commit and PR style

- Use short, clear messages: `Add topic: Error Handling`, `Fix output in Variables topic`.
- One topic or one fix per pull request keeps review fast.

## Review process

A maintainer checks accuracy, clarity and the checklist above. Expect feedback; it is about the content, not about you. The GitHub Action must pass before merging.

By contributing you agree that your work is released under the [MIT License](LICENSE) and that you will follow the [Code of Conduct](CODE_OF_CONDUCT.md).