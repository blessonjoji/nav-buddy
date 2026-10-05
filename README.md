# Nav-Buddy: the study app

A free study app for the 2nd Mate (FG) CoC. There is no login and no payment. It works offline once it has been opened.

## What's in it
- **Study:** all 98 topics, grouped by Function, then paper, then topic. Each topic has notes and a quiz.
  You can mark a topic as read and bookmark it.
- **Practice:**
  - Daily 10
  - Unseen questions
  - My mistakes
  - Mock tests: 30 questions in 30 minutes, for each written paper and for each Function
- **Quiz engine:**
  - One question at a time, with immediate feedback and an explanation
  - Options shuffled each time
  - Per-question history, used for "Mistakes" and the accuracy figures
- **Orals:**
  - The three surveyor Q&A banks (195 model answers, filterable, with how candidates remembered each question)
  - The oral topics
- **Lights & shapes trainer:** the 43 ROR cards, drawn as pictures from the card data (night lights and day shapes).
  There are two modes: flashcards, and a quiz with four choices.
- **Morse trainer:**
  - A flashing lamp at 4–10 words per minute
  - Learn and practice modes
  - The full exam format (60 singles plus 8 five-letter groups) with automatic marking against the pass mark of 70
- **Numericals:**
  - The fixed sailings practice set
  - A generator that makes unlimited fresh problems with step-by-step solutions and marking: great circle, Mercator, amplitude, intercept, course to steer, true wind, list, final drafts
- **Calculators:** 17 tools in total.
  - Sailings: great circle, Mercator, plane sailing, destination, day's work
  - Celestial: sight reduction, ABC tables, amplitude, meridian and ex-meridian, longitude by chronometer
  - Wind and current: true wind, current triangle, set and drift
  - Stability: list and free surface, trim, FWA and DWA
  - Time and distance: arc-time conversion
- **Symbols trainers.** Only symbols fixed exactly by a standard and checked against it are drawn:
  - Signal flags A–Z, checked one by one against the International Code of Signals flag SVGs
  - IALA marks with topmarks and animated lights
  - Light-rhythm timelines
  - Weather-front map symbols
- **Past papers:** all 351 MMD written papers (May 2017 to Nov 2025), searchable across every question. Each question links to its topic, and each topic shows how many papers asked it and when it was last asked.
- **Oral exam simulator:** 10 surveyor-style questions per Function. These come from the Q&A banks and the oral quizzes; F1 also includes lights-and-shapes cards. You reveal the model answer, mark yourself, and the score is compared with the pass mark (F1 70, F2 and F3 60). Your attempts are kept.
- **COLREG rule finder:** every rule and annex in one or two lines of plain words, searchable, and linked to the notes.
- **Collision situations:** generated encounters at night and in restricted visibility, each with one correct action under the Rules and the reasoning shown. They cover head-on, crossing (give way or stand on), overtaking and being overtaken, Rule 18 vessels, "no risk" cases, Rule 19 radar-only targets and fog signals.
- **Written exam mode:** sit a real past paper against the real time limit (3 h, or 2 h for Meteorology). Then rate each question, and get a revision list of the linked topics.
- **Formula sheet:** sailings, coastal, celestial, stability, trim, cargo and meteorology. **Abbreviations:** 73 terms, filterable.
- **Reading:** a contents list for each topic, text size S/M/L, and previous/next topic.
- **Day streak, and backup/restore** of progress to a file (no account needed).
- **Spaced repetition:** wrong answers come back the next day, right ones at growing intervals ("Review due").
- **Progress and exam planner:** per-paper progress, exam dates, a daily question target and your weakest topics.
- **Search** across notes, quiz questions and the Q&A banks.
- **Diagram register:** the planned drawings, with how often the exam asks for each.
- **Light and dark themes.**

Progress is kept in the browser's local storage on that device only. Nothing is sent anywhere.

## Files
| File | Purpose |
|---|---|
| `index.html` | app shell (header, view, bottom tabs) |
| `styles.css` | all styling, light/dark tokens, mobile-first |
| `app.js` | router and all views (home, study, topic, quiz, practice, orals, ROR, Morse, search, saved, settings) |
| `ror.js` | draws a lights/shapes scene as SVG from a card's data |
| `morse.js` | Morse lamp flasher (standard 1/3/7 unit timing) |
| `navcalc.js` | navigation and stability maths, ported from research/navcalc.py and cross-checked against it |
| `symbols.js` | flags, IALA marks, light rhythms, front symbols (standardised symbols only) |
| `features.js` | calculators, numericals generator, symbols trainers, spaced repetition, planner |
| `features2.js` | past papers, oral simulator, COLREG rule finder, backup/restore |
| `features3.js` | collision situation trainer, exam mode, formula sheet, glossary |
| `colreg.js` | rule-by-rule summaries (own words) |
| `data/papers.js` | **generated**: past papers with each question tagged to topics (loaded on demand) |
| `sw.js` | offline cache (version auto-bumped by the build) |
| `manifest.webmanifest`, `icon.svg` | install to home screen |
| `data/content.js` | **generated**: every topic with notes pre-rendered to HTML, quizzes, Q&A, extras, diagram register |

## Rebuild after editing content
Run:
```bash
python research/build_app.py
```
This needs the Python `markdown` package (`pip install markdown`). The build refuses to write the file if it finds an em dash.

## Run locally
Run:
```bash
python -m http.server 8766 --directory app
```
Then open http://localhost:8766. Any static host works too (GitHub Pages, Netlify and others), because the app is plain HTML, CSS and JS with no server code.
