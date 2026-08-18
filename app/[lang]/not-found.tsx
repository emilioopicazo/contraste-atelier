import Link from "next/link";

/* Rendered inside the [lang] layout; copy is bilingual by design since the
   locale isn't available in not-found. */
export default function NotFound() {
  return (
    <main className="zone zone--ink plain">
      <div className="wrap plain__in">
        <span className="kicker">
          <span className="dot" />
          404
        </span>
        <h1 className="h2">Page not found · Página no encontrada</h1>
        <Link className="link-underline" href="/">
          ← Contraste Atelier
        </Link>
      </div>
    </main>
  );
}
