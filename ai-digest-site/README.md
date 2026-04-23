# AI Daily Digest — Website

A clean, minimal public blog documenting a structured daily AI learning journey.

## Structure

```
ai-digest-site/
├── index.html          ← Single-page app (all pages live here)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── app.js          ← Routing, rendering, search/filter logic
└── data/
    └── content.js      ← All digests, glossary, and site data
```

## How to add a new session

1. Open `data/content.js`
2. Add a new entry at the **top** of the `digests` array:

```js
{
  day: 29,
  date: "Apr 24, 2026",
  isoDate: "2026-04-24",
  title: "Concept A & Concept B",
  concepts: ["Concept A", "Concept B"],
  topic: "Architecture",   // one of: Architecture, Business, Governance, Infrastructure, Models, Safety
  summary: "One or two sentences summarising what was covered.",
  useCase: "The business application highlighted in this session.",
},
```

3. Add the new concepts to the **top** of the `glossary` array:

```js
{ term: "Concept A", def: "Clear one-sentence definition.", day: 29 },
{ term: "Concept B", def: "Clear one-sentence definition.", day: 29 },
```

That's it — the site updates automatically.

---

## Deployment

### Option A: GitHub Pages (free, recommended)

1. Create a new GitHub repository (e.g. `ai-digest`)
2. Upload all files maintaining the folder structure
3. Go to **Settings → Pages**
4. Set Source to `main` branch, root folder `/`
5. Your site will be live at `https://yourusername.github.io/ai-digest`

### Option B: Netlify (free, drag-and-drop)

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag the entire `ai-digest-site` folder onto the Netlify dashboard
3. Done — you get a live URL instantly
4. Optionally connect a custom domain in Netlify settings

### Option C: Local preview

Just open `index.html` in any browser. No build step, no dependencies.

---

## Customisation

| What | Where |
|---|---|
| Site title / author name | `data/content.js` → `meta` object |
| Colour scheme | `css/style.css` → `:root` variables |
| Hero text | `index.html` → `.hero` section |
| Progress target (currently 50) | `js/app.js` → `Progress.init()` → `TARGET` |
| Timeline milestones | `index.html` → Progress page `.timeline-card` |

---

## Tech stack

Plain HTML, CSS, JavaScript. No frameworks, no build tools, no dependencies.
Font: Lora (serif) + DM Sans, loaded from Google Fonts.
