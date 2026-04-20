# CONTRASTE ATELIER — Website

Jewelry atelier · Tulum, Mexico · Est. 2026

## Stack

- Pure HTML / CSS / JS — no frameworks, no build step
- Deploy: Netlify Drop or GitHub → Netlify
- Domain: contraste-atelier.com (GoDaddy → Netlify DNS)

## Project structure

```
contraste-atelier.com/
├── index.html          ← Entry point (all sections)
├── netlify.toml        ← Netlify config + cache headers
├── .gitignore
├── css/
│   └── styles.css      ← Brand palette, layout, animations
├── js/
│   └── main.js         ← All editable content + UI logic
├── assets/
│   ├── img/            ← Photos + logos (.webp preferred)
│   ├── video/          ← Hero video or class demos (.mp4)
│   └── icons/          ← Favicon, app icons
└── docs/
    ├── README.md       ← This file
    ├── EDIT-GUIDE.md   ← How to update content
    └── DEPLOY-GUIDE.md ← How to go live
```

## Sections

| # | Section        | ID               |
|---|----------------|------------------|
| — | Navigation     | `#nav`           |
| 1 | Hero           | `#hero`          |
| 2 | About          | `#about`         |
| 3 | Espacio        | `#espacio`       |
| 4 | Shop           | `#shop`          |
| 5 | Classes        | `#classes`       |
| 6 | Stones         | `#stones`        |
| 7 | Colaboradores  | `#colaboradores` |
| 8 | Instagram      | `#instagram`     |
| 9 | Booking        | `#booking`       |
| 10| Contact        | `#contact`       |

## Brand colors

| Variable     | Hex       | Use                  |
|--------------|-----------|----------------------|
| `--forge`    | `#0E0D0B` | Primary background   |
| `--concrete` | `#1E1C19` | Secondary background |
| `--warm`     | `#2A2722` | Hover states         |
| `--silver`   | `#C8C4BC` | Secondary text       |
| `--wall`     | `#D4CFC3` | Accents / labels     |
| `--stone`    | `#F0EDE8` | Light panels / text  |

## Contacts

- Instagram: @contraste.tulum
- Email: contraste.tulum@gmail.com
- Domain registrar: GoDaddy
