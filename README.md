# 🌐 Portfolio

Personal portfolio website — **Tech · AI · Cybersecurity**

## Live Site
👉 [abdulmutholib.web.id](https://abdulmutholib.web.id)

## Tech Stack
- Next.js + Tailwind CSS
- Open-Meteo API (weather)
- ip-api.com (network info)
- FormSubmit (contact)

## Features
- Dark/light mode with 4 accent colors (Sky, Teal, Violet, Emerald)
- Live weather widget based on geolocation
- Visitor network info display
- GitHub API live repos
- Contact form
- Visit counter

## Run Locally
```bash
npx serve .
```

## Tests
Front-end logic lives in `js/` as ES modules and is unit tested with Vitest + jsdom.

```bash
npm install
npm test          # run the suite
npm run coverage  # run with a coverage report
```