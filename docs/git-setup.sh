#!/bin/bash
# CONTRASTE ATELIER — Git + GitHub setup
# Corre esto en Terminal desde tu Mac
# ─────────────────────────────────────

cd "/Users/emiliopicazo/Documents/Claude/Projects/Contraste"

# 1. Limpiar cualquier git previo fallido
rm -rf .git

# 2. Inicializar repo limpio
git init -b main
git config user.name "Emilio Picazo"
git config user.email "mrpicazo2001@gmail.com"

# 3. Agregar solo los archivos del sitio (excluir carpeta web/ vieja)
git add index.html css/ js/ assets/ docs/ netlify.toml .gitignore

# 4. Primer commit
git commit -m "feat: initial deploy — CONTRASTE ATELIER

- index.html root (Netlify-ready, no build step)
- css/styles.css + js/main.js (editable config objects)
- Sections: HERO, ABOUT, ESPACIO, SHOP, CLASSES, STONES, COLABORADORES, INSTAGRAM, BOOKING, CONTACT
- assets/img/ all logos
- docs/ EDIT-GUIDE + DEPLOY-GUIDE
- netlify.toml cache headers"

echo ""
echo "✓ Repo local listo."
echo ""
echo "PASO 2 — Crea el repo en GitHub:"
echo "  1. Ve a https://github.com/new"
echo "  2. Nombre: contraste-atelier"
echo "  3. Private o Public (tú decides)"
echo "  4. NO marques 'Add README' (ya tienes uno)"
echo "  5. Crea el repo"
echo ""
echo "PASO 3 — Conecta y sube (reemplaza emilioopicazo):"
echo "  git remote add origin https://github.com/emilioopicazo/contraste-atelier.git"
echo "  git push -u origin main"
echo ""
echo "PASO 4 — Conecta Netlify:"
echo "  1. app.netlify.com → Add new site → Import from Git"
echo "  2. Selecciona contraste-atelier"
echo "  3. Publish directory: (dejar vacío)"
echo "  4. Deploy"
echo ""
echo "PASO 5 — Dominio (después de conectar Netlify):"
echo "  1. Netlify → Domain settings → contraste-atelier.com"
echo "  2. Copia los 4 nameservers de Netlify"
echo "  3. GoDaddy → DNS → Nameservers → pega los de Netlify"
echo "  4. Espera 15-30 min → HTTPS automático"
