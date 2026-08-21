# HANDOFF — Activación de CONTRASTE Platform V1
### Para Claude (Cowork) en la Mac de Emilio · rama `claude/dreamy-thompson-d5080l`

Todo el código ya está construido, probado (48 tests) y subido a esta rama.
Tu trabajo NO es reescribir nada: es **conectar las cuentas reales y verificar**.
Lo que está aquí ya pasó lint, typecheck, build de producción, QA visual en
6 breakpoints y una revisión adversarial de seguridad/dominio. Léelo, no lo rehagas.

## Contexto en una línea

Sitio Next.js (App Router, EN en `/` y ES en `/es`) con reservaciones de taller
en Supabase (proyecto **Contraste-Web**, ref `xrqxfyymlbktxygofawm`) y tienda
Shopify headless **apagada** por feature flag. Producción (`main`) sigue siendo
el sitio viejo — no lo toques; el merge lo decide Emilio.

## Reglas duras (no negociables)

1. **No hagas push a `main`** ni abras PR sin que Emilio lo pida.
2. **No inventes el precio del taller.** Si Emilio no da un número para
   `NEXT_PUBLIC_WORKSHOP_PRICE_MXN`, se queda vacío (el sitio lo oculta solo).
3. **Nunca** pongas `SUPABASE_SERVICE_ROLE_KEY` ni tokens en archivos commiteados
   (`.env.local` está en .gitignore — ahí sí).
4. No crees productos, precios ni datos falsos. No conectes ninguna tienda o
   proyecto de otra marca (Sunset Seeker, NATIVO, etc. — CONTRASTE es independiente).
5. No cambies el diseño. Cualquier ajuste visual lo pide Emilio directamente.

## Paso 0 — Preparar

```bash
git fetch origin && git checkout claude/dreamy-thompson-d5080l
npm install
npm test && npm run build   # deben pasar 48/48 y build verde antes de seguir
```

## Paso 1 — Supabase: migraciones

El MCP de Supabase ya está en `.mcp.json`. Pide a Emilio autenticarlo
(`/mcp` → supabase → Authenticate). Luego, contra el proyecto `xrqxfyymlbktxygofawm`:

1. Ejecuta **completo** `supabase/migrations/0001_workshops.sql`.
2. Ejecuta `supabase/migrations/0002_seed_september_2026.sql`.
3. Verifica:
   - `select count(*) from workshop_sessions;` → **8**
   - `select * from get_public_sessions();` → 8 filas, `available_seats = 4`
   - `select relrowsecurity from pg_class where relname in ('workshop_sessions','workshop_bookings');` → ambas `true`

Ambos archivos son idempotentes; si algo falla a medias, se pueden re-correr.

## Paso 2 — Supabase: Auth

En el dashboard (o Management API si el MCP lo permite):

- **Authentication → Sign In/Up**: Email (magic link) activo.
- **Authentication → URL Configuration**:
  - Site URL: `https://contraste-atelier.com`
  - Redirect URLs: `https://contraste-atelier.com/auth/callback`,
    `http://localhost:3000/auth/callback`, y el dominio de preview de Vercel
    (`https://*.vercel.app/auth/callback`) cuando exista.

## Paso 3 — Probar en local (con llaves reales)

Crea `.env.local` (Settings → API en el dashboard; NO commitear):

```
NEXT_PUBLIC_SITE_URL=https://contraste-atelier.com
NEXT_PUBLIC_SUPABASE_URL=https://xrqxfyymlbktxygofawm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable/anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
ADMIN_EMAIL_ALLOWLIST=mrpicazo2001@gmail.com
NEXT_PUBLIC_WORKSHOP_PRICE_MXN=<pregúntale a Emilio; vacío si no hay decisión>
```

Después `npm run dev` y verifica de verdad (no asumas):

- `/workshops/wax-ring` muestra el calendario con las 8 fechas de septiembre
  y "4 spots available" (ya no el fallback de WhatsApp).
- Haz una **reserva de prueba** completa → pantalla de confirmación con
  referencia `CTR-WRK-2609xx-XXXX` → el contador de esa fecha baja en vivo.
- `/admin/workshops` → magic link al correo de Emilio → entra el panel →
  se ve la reserva de prueba → **cancélala** desde ahí (restaura el lugar).
- `/es/workshops/wax-ring` igual, en español.

## Paso 4 — Vercel

Con `vercel` CLI (login de Emilio) o dashboard:

1. Importar/crear proyecto desde el repo `emilioopicazo/contraste-atelier`
   (Next.js se auto-detecta; sin config extra).
2. Cargar las mismas variables del Paso 3 como Environment Variables
   (Production + Preview).
3. Deploy de **preview de esta rama** → correr el mismo checklist del Paso 3
   sobre la URL de preview, en desktop y en un teléfono real.
4. Pasar la URL de preview a Emilio. **El merge a main y el apuntado del
   dominio los decide él** (ojo: si `contraste-atelier.com` sirve hoy desde
   Netlify, el dominio debe moverse a Vercel al publicar — coordinarlo antes
   del merge).

## Pendientes que NO son tuyos (solo para que no los "arregles")

- Tienda Shopify: apagada a propósito (`SHOPIFY_ENABLED=false`) hasta que
  exista la tienda dedicada de CONTRASTE con sus tokens.
- Email transaccional y webhook n8n: dormidos hasta tener
  `TRANSACTIONAL_EMAIL_API_KEY` / `BOOKING_WEBHOOK_URL`.
- Analytics: dormido hasta tener `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_ID`.

## Al terminar

Reporta a Emilio: qué se activó, la URL del preview, el resultado del checklist
del Paso 3/4, y cualquier bloqueo real. Nada más.
