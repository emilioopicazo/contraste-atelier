# CONTRASTE ATELIER — Deploy Guide

## Option A — Netlify Drop (fastest, no account needed)

1. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser
2. Select ALL files from your project folder:
   - `index.html`
   - `css/` folder
   - `js/` folder
   - `assets/` folder
   - `netlify.toml`
3. Drag and drop them all onto the page
4. Netlify gives you a live URL instantly (e.g. `quirky-name-123.netlify.app`)

---

## Option B — GitHub + Netlify (recommended for ongoing edits)

### Step 1: Push to GitHub

```bash
cd /Users/emiliopicazo/Documents/Claude/Projects/Contraste
git init
git add .
git commit -m "initial deploy"
git branch -M main
git remote add origin https://github.com/emilioopicazo/contraste-atelier.git
git push -u origin main
```

### Step 2: Connect to Netlify

1. Log in at [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import from Git**
3. Select your GitHub repo
4. Build settings: leave blank (static site, no build command)
5. Publish directory: leave blank (or set to `.`)
6. Click **Deploy site**

Every time you push to GitHub, Netlify redeploys automatically.

---

## Option C — Update an existing Netlify deploy

1. Go to your site in Netlify dashboard
2. **Deploys** tab → **Drag and drop** your updated files

---

## Connect your custom domain (contraste-atelier.com)

1. In Netlify → **Domain settings** → **Add custom domain** → enter `contraste-atelier.com`
2. Netlify shows you 4 nameservers (e.g. `dns1.p01.nsone.net`)
3. Log in to GoDaddy → **DNS** → change nameservers to Netlify's
4. Wait 10–30 min → HTTPS auto-provisions

---

## What to update before going live

- [ ] Replace `529841234567` with real WhatsApp number in `js/main.js`
- [ ] Replace Google Maps placeholder URL with exact location
- [ ] Update Adrián's Instagram handle in `COLABORADORES` and `IG_PROFILES`
- [ ] Add real product photos (WebP, drop into `assets/img/`)
- [ ] Add hero image or video (`assets/img/hero.webp` or `assets/video/hero.mp4`)
- [ ] Add atelier/espacio photos
- [ ] Add Instagram feed screenshots (9 per profile)
- [ ] Confirm SSL shows green padlock after domain connection
