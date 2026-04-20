# CONTRASTE ATELIER — Edit Guide

> Everything you need to update the site. No coding required — just edit the config objects in `js/main.js`.

---

## 1. WhatsApp / Instagram / Maps links

Open `js/main.js` → find `SITE`:

```js
const SITE = {
  whatsapp:  '529841234567',          // Your number, no + no spaces
  instagram: 'contraste.tulum',       // Handle without @
  email:     'contraste.tulum@gmail.com',
  mapsUrl:   'https://maps.google.com/?q=...',  // Paste your Google Maps link
};
```

---

## 2. Product prices and names

Find `PRODUCTS` in `js/main.js`. Each object is one product:

```js
{
  name:     'Raw Stone Ring',
  material: 'Sterling Silver · Labradorite',
  price:    2400,          // MXN number only
  category: 'rings',       // rings | necklaces | bracelets
  badge:    'New',         // 'New' | 'Limited' | '' (empty = no badge)
  imageSrc: '',            // 'assets/img/photo.webp' or leave '' for placeholder
  imgStyle: 'background:...',  // placeholder gradient, keep as is
},
```

---

## 3. Class prices

Find `CLASSES` in `js/main.js`:

```js
{ id:'private', name:'Private', price:3000, priceLabel:'MXN 3,000', ... }
```

Change `price` (number) and `priceLabel` (display string) to update everywhere at once.

---

## 4. Adding a product photo

1. Convert photo to WebP (use squoosh.app — free, fast)
2. Drop it into `assets/img/`
3. In `PRODUCTS`, set `imageSrc: 'assets/img/your-photo.webp'`

---

## 5. Adding atelier / espacio photos

In `index.html`, search for `EDIT-IMAGE`. Each comment shows exactly which `<img>` to add:

```html
<!-- EDIT-IMAGE: Add photo here -->
<img src="assets/img/atelier.webp" alt="CONTRASTE Atelier" loading="lazy">
```

---

## 6. Instagram feed

In `js/main.js` → `IG_PROFILES`. For each profile, fill the `posts` array with 9 image paths:

```js
posts: [
  'assets/img/ig-ca-1.webp',
  'assets/img/ig-ca-2.webp',
  // ... 9 total
]
```

Take screenshots of your IG posts, save as WebP at 600×600, drop into `assets/img/`.

---

## 7. Collaborator brands

Find `COLABORADORES` in `js/main.js`. Update names, descriptions, and IG links.

---

## 8. All page text (bilingual)

Find `CONTENT` in `js/main.js`. Two objects: `en` and `es`. Edit the string values.

---

## 9. Hero image or video

In `index.html`, find the `hero-right` div. Replace the comment with:

**Photo:**
```html
<div class="hero-right" style="background-image:url('assets/img/hero.webp');background-size:cover;background-position:center;">
```

**Video:**
```html
<div class="hero-right">
  <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    <source src="assets/video/hero.mp4" type="video/mp4">
  </video>
  ...
</div>
```

---

## File map

```
index.html          ← Page structure + HTML comments
css/styles.css      ← All visual styling (brand colors, layout)
js/main.js          ← All editable content (SITE, PRODUCTS, CLASSES, CONTENT...)
assets/img/         ← All images go here (.webp preferred)
assets/video/       ← Videos go here (.mp4)
assets/icons/       ← Icons / favicons
docs/               ← This guide + deploy guide
```
