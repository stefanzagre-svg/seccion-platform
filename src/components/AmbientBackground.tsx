'use client';

/**
 * AmbientBackground — Global neon atmosphere layer
 * Replicates the LandingPageHook's electric laser-line + orb aesthetic
 * across every page of the platform.
 *
 * Rendered once in RootLayout, fixed to the viewport.
 */
export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-10] bg-[#0B0C10]">

      {/* ── Radial gradient wash on viewport ─────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 50%, rgba(255, 171, 243, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(0, 251, 251, 0.05), transparent 25%)',
        }}
      />

      {/* ── Large neon orbs ──────────────────────────────────────── */}
      <div className="absolute w-[800px] h-[400px] bg-[#fe00fe] rounded-full -top-40 -left-40 blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute w-[600px] h-[300px] bg-[#00fbfb] rounded-full bottom-20 right-0 blur-[100px] opacity-30 pointer-events-none" />
    </div>
  );
}
