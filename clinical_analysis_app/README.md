# Clinical Analysis App — Register & Login Module

This is the ONE final project. Ignore any earlier zip files named
`clinical_app`, `clinical_ui`, `frontend_standalone`, or `final_app` —
this `clinical_analysis_app` folder replaces all of them.

## Folder structure

```
clinical_analysis_app/
│
├── app.py                    Flask backend — routes, SQLite, pandas
├── clinical_app.db           SQLite database (auto-created on first run)
│
├── templates/                HTML pages, rendered by Flask (Jinja)
│   ├── login.html
│   ├── register.html
│   └── dashboard.html
│
└── static/                   CSS and JS used by the pages above
    ├── style.css
    └── script.js
```

That is the entire project. There is no second copy of the frontend and
no separate server to run — Flask serves the HTML, CSS, and JS itself.

## Naming convention used throughout

| Item                | Convention          | Example              |
|---------------------|----------------------|-----------------------|
| Folders              | lowercase, underscores | `clinical_analysis_app`, `templates`, `static` |
| Python files         | lowercase, underscores | `app.py`              |
| HTML files           | lowercase, matches its page | `login.html`, `register.html`, `dashboard.html` |
| CSS file             | always `style.css`, one per project | `static/style.css` |
| JS file              | always `script.js`, one per project | `static/script.js` |
| Flask route functions| lowercase, underscores, `_page` suffix for page routes | `login_page()`, `register_page()` |
| API endpoints        | prefixed `/api/`, verb-free noun | `/api/register`, `/api/login` |
| Database file        | matches project name  | `clinical_app.db`     |

Rule of thumb: **one `style.css`, one `script.js`, one `app.py` per
project.** If you add more pages later (e.g. an upload page), add its
HTML file to `templates/` and reuse the same `style.css`/`script.js` —
don't create a second stylesheet or a second app.py.

## How to run it

```bash
cd clinical_analysis_app
pip install flask pandas
python app.py
```

Then open: http://127.0.0.1:5000/register

The database file `clinical_app.db` will appear automatically in this
same folder the first time you run `app.py`. Deleting it resets all
registered accounts.

## What each file does

- **app.py** — creates the `users` and `reports` tables in SQLite,
  hashes passwords (PBKDF2 + per-user salt), and exposes:
  - `GET /register`, `GET /login`, `GET /dashboard`, `GET /logout`
  - `POST /api/register`, `POST /api/login`
  - `GET /api/users` (pandas-based export of registered users)
- **templates/login.html** / **register.html** — the split-screen
  design (ink-green intro panel + form panel), linked to Flask via
  `url_for(...)`.
- **templates/dashboard.html** — placeholder page shown after login.
- **static/style.css** — all colors, type, and layout for every page.
- **static/script.js** — password show/hide toggle, form validation,
  and the `fetch()` calls to `/api/register` and `/api/login`.

## Motion and 3D effects

All four pages load `static/motion.css`, `static/motion.js`, and
`static/three-effects.js`. The motion library contains 120 entrance animations
and 120 hover/focus transitions: 12 families with 10 strengths each.
Use the **Effects gallery** button to preview every preset. **Pause motion**
persists across pages; system reduced-motion preferences also disable motion.

Reusable classes: `mo-animate-rise-01` and `mo-transition-rise-01`.
Families: rise, drop, left, right, zoom, shrink, spin, flip, swing, blur,
diagonal, pop. Strengths range from 01 to 10. The full catalog is in
`static/motion-presets.json`. Existing cards, headings, navigation, fields,
and buttons receive selected presets automatically when they appear.

The Three.js scene includes a DNA helix, orbital rings, particles, and pointer
interaction. The dashboard uses its existing visualization container; landing
and authentication pages get a scene inside their introduction panel.
Three.js is served locally from `static/vendor` (copied from the installed
npm package). Scenes pause when hidden, outside the viewport, or motion is
paused. WebGL failure leaves a readable fallback and working page controls.

Validation: JavaScript syntax checks and static integration/preset checks pass.
Runtime rendering requires Flask and the project's MySQL connector; install
`flask mysql-connector-python` in your Python environment before running the app.
