import { notFound } from "next/navigation";

/* Routes unmatched inside a locale render the branded not-found
   (with site chrome) instead of Next's default 404 shell. */
export default function CatchAll() {
  notFound();
}
