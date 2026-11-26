// Voallen logo: an original mark (a deep teal tile holding a "V" drawn as two
// people leaning in, one white, one apricot, with a small heart-dot above) plus
// the wordmark in our Clash Grotesk with tight tracking.

export const VOALLEN_TEAL = "#1f3039";
export const VOALLEN_APRICOT = "#eaab6c";
export const VOALLEN_GREEN = "#3d7a5a";

export const VoallenMark = ({ className = "w-9 h-9" }) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
    <rect width="40" height="40" rx="11" fill={VOALLEN_TEAL} />
    {/* left stroke of the V */}
    <path d="M11 13.5 L19 29" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" fill="none" />
    {/* right stroke of the V, leaning in */}
    <path d="M29 13.5 L21 29" stroke={VOALLEN_APRICOT} strokeWidth="4.2" strokeLinecap="round" fill="none" />
    {/* the two "heads" above each stroke */}
    <circle cx="11" cy="8.6" r="2.3" fill="#ffffff" />
    <circle cx="29" cy="8.6" r="2.3" fill={VOALLEN_APRICOT} />
  </svg>
);

export const VoallenLogo = ({ size = "md", tone = "default", className = "" }) => {
  const sizes = {
    sm: { mark: "w-8 h-8", text: "text-lg" },
    md: { mark: "w-9 h-9 sm:w-10 sm:h-10", text: "text-xl sm:text-2xl" },
    lg: { mark: "w-10 h-10 md:w-11 md:h-11", text: "text-2xl md:text-[1.75rem]" },
  }[size];
  const textColor = tone === "light" ? "text-white" : "text-stone-900";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <VoallenMark className={`${sizes.mark} ${tone === "light" ? "rounded-[11px] ring-1 ring-white/25" : ""}`} />
      <span className={`${sizes.text} ${textColor} font-display font-medium tracking-[-0.03em] leading-none`}>
        Voallen
      </span>
    </span>
  );
};

export default VoallenLogo;
