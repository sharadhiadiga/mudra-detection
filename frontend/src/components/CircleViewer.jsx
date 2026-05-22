import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

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
    ? 'border-success'
    : live
      ? 'animate-pulse border-gold'
      : 'border-gold';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* Soft radial halo */}
        <div
          className="pointer-events-none absolute inset-0 -m-8 rounded-full"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0deg, rgba(212,175,55,0.04) 20deg, transparent 40deg,
              rgba(212,175,55,0.03) 80deg, transparent 100deg,
              rgba(212,175,55,0.04) 140deg, transparent 160deg,
              rgba(212,175,55,0.03) 200deg, transparent 220deg,
              rgba(212,175,55,0.04) 280deg, transparent 300deg
            )`,
            boxShadow: 'inset 0 0 12px rgba(212,175,55,0.08)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -m-4 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        <motion.div
          animate={
            locked
              ? {
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    'inset 0 0 12px rgba(74,222,128,0.2)',
                    'inset 0 0 18px rgba(74,222,128,0.28)',
                    'inset 0 0 12px rgba(74,222,128,0.2)',
                  ],
                }
              : live
                ? { scale: [1, 1.008, 1] }
                : {}
          }
          transition={{ duration: 2.5, repeat: Infinity }}
          className={`group relative h-full w-full overflow-hidden rounded-full border-[3px] bg-black ${ringClass}`}
        >
          {children}
          {showGuide && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="h-[58%] w-[58%] rounded-lg border-2 border-dashed border-success/80 shadow-[0_0_8px_rgba(74,222,128,0.2)]" />
            </div>
          )}
          {locked && (
            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-success bg-black/80 text-success">
              <Lock className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </motion.div>
      </div>

      {badge && (
        <span
          className={`mt-4 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${
            locked
              ? 'border-success/50 bg-success/10 text-success'
              : 'border-success/40 bg-black/80 text-success'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
