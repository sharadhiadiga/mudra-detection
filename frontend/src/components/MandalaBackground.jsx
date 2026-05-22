/** Decorative mandala textures — very low opacity, no interaction */
export default function MandalaBackground() {
  const imgProps = {
    src: '/assets/mandala.png',
    alt: '',
    className: 'h-full w-full object-contain mix-blend-screen',
    draggable: false,
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Left */}
      <div
        className="absolute blur-[1px]"
        style={{ left: -150, top: '20%', width: 400, opacity: 0.08 }}
      >
        <img {...imgProps} />
      </div>

      {/* Right */}
      <div
        className="absolute blur-[1px]"
        style={{ right: -150, top: '25%', width: 400, opacity: 0.08 }}
      >
        <img {...imgProps} />
      </div>

      {/* Top center — very subtle */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: -200, width: 500, opacity: 0.05 }}
      >
        <img {...imgProps} className="h-full w-full object-contain mix-blend-screen" />
      </div>
    </div>
  );
}
