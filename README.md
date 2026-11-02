# Personal Portfolio — David Rey Bali-os

An independent copy of the portfolio at https://davidreybali-os.vercel.app/, prepared for future Upwork portfolio edits. The starting design, content, images, and interactions are preserved from davidxx22/personal-cv.

Repository: https://github.com/davidxx22/personal-portfolio

## Run locally

No dependencies or build step are needed. From this folder, run:

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Open http://127.0.0.1:5500. Stop the server with Ctrl+C.

## Make changes

- `index.html`: sections, text, project cards, social profiles, and contact links.
- `styles.css`: layout, colors, typography, and responsive styling.
- `script.js`: featured projects, filters, screenshot galleries, and navigation.
- `assets/`: portrait, icons, project previews, and screenshots.

All original sections remain in this initial copy. Upwork-specific content changes can be made independently in this repository.

## Deploy on Vercel

Import `davidxx22/personal-portfolio` as a new Vercel project. Choose the **Other** framework preset and the repository root. Leave build, install, and output settings at their static-site defaults; no environment variables are required. Use `main` as the production branch.

The original live URL belongs to the original portfolio, not this copy. This repository has no new deployment URL yet. Do not select the existing Vercel project when deploying this version.

## Asset provenance

The source and assets were copied from David's `personal-cv` repository. Original project attributions are retained in `DEVELOPMENT.md`. Devicon's license remains at `assets/icons/LICENSE-devicon.txt`.
