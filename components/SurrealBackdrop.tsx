/**
 * SurrealBackdrop: a constant, app-wide background shared by every route.
 * It shows the user's chosen remembrance photo with a slow, dreamlike drift and
 * the guiding quote. It sits behind all content (z-0, pointer-events disabled),
 * so it never blocks interaction.
 */

export const REMEMBRANCE_QUOTE =
  'Our loved ones always keep a watch over us no matter where they are.. let\u2019s do the simple things rightly and make them and us proud \u2764';

export default function SurrealBackdrop() {
  return (
    <div aria-hidden="true" className="surreal-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Photo layer with a slow, gentle drift */}
      <div className="surreal-backdrop__photo absolute inset-0" />
      {/* Soft vignette + tint so foreground text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/55 via-[#080c14]/35 to-[#080c14]/80" />
      <div className="surreal-backdrop__glow absolute inset-0" />
      {/* Guiding quote */}
      <p className="surreal-backdrop__quote absolute bottom-3 left-1/2 -translate-x-1/2 w-[min(92vw,56rem)] text-center font-serif italic text-[13px] sm:text-sm leading-snug text-amber-100/70">
        {REMEMBRANCE_QUOTE}
      </p>
    </div>
  );
}
