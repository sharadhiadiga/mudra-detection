import { motion } from 'framer-motion';

const SIZE = 350;

export default function CircleViewer({
  children,
  locked = false,
  live = false,
  showGuide = false,
  badge,
  className = '',
}) {
  const ringClass = locked
    ? 'border-success shadow-glow-green'
    : live
      ? 'animate-pulse border-gold shadow-glow'
      : 'border-gold shadow-glow-gold';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* Radial rays */}
        <div
          className="pointer-events-none absolute inset-0 -m-10 rounded-full"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0deg, rgba(212,175,55,0.1) 15deg, transparent 30deg,
              rgba(232,122,42,0.08) 45deg, transparent 60deg,
              rgba(212,175,55,0.1) 75deg, transparent 90deg,
              rgba(232,122,42,0.08) 105deg, transparent 120deg,
              rgba(212,175,55,0.1) 135deg, transparent 150deg,
              rgba(232,122,42,0.08) 165deg, transparent 180deg,
              rgba(212,175,55,0.1) 195deg, transparent 210deg,
              rgba(232,122,42,0.08) 225deg, transparent 240deg,
              rgba(212,175,55,0.1) 255deg, transparent 270deg,
              rgba(232,122,42,0.08) 285deg, transparent 300deg,
              rgba(212,175,55,0.1) 315deg, transparent 330deg
            )`,
            boxShadow: '0 0 50px rgba(212,175,55,0.12)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -m-6 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(212,175,55,0.14) 0%, rgba(232,122,42,0.06) 40%, transparent 72%)',
          }}
          aria-hidden="true"
        />

        <motion.div
          animate={
            locked
              ? {
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    '0 0 32px rgba(74,222,128,0.45), 0 0 64px rgba(74,222,128,0.25)',
                    '0 0 48px rgba(74,222,128,0.65), 0 0 80px rgba(74,222,128,0.35)',
                    '0 0 32px rgba(74,222,128,0.45), 0 0 64px rgba(74,222,128,0.25)',
                  ],
                }
              : live
                ? { scale: [1, 1.015, 1] }
                : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
          className={`relative h-full w-full overflow-hidden rounded-full border-[3px] bg-black ${ringClass}`}
        >
          {children}
          {showGuide && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="h-[58%] w-[58%] rounded-lg border-2 border-dashed border-success shadow-[0_0_12px_rgba(74,222,128,0.4)]" />
            </div>
          )}
          {locked && (
            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-success bg-black/80 text-lg text-success">
              🔒
            </div>
          )}
        </motion.div>
      </div>

      {badge && (
        <span
          className={`mt-4 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${
            locked
              ? 'border-success/60 bg-success/15 text-success shadow-glow-green'
              : 'border-success/50 bg-black/80 text-success'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
