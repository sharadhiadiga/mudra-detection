import { motion } from 'framer-motion';

function MandalaSvg({ className }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="92" stroke="#d4af37" strokeWidth="0.5" opacity="0.6" />
      <circle cx="100" cy="100" r="72" stroke="#d4af37" strokeWidth="0.4" opacity="0.5" />
      <circle cx="100" cy="100" r="52" stroke="#e8c96a" strokeWidth="0.35" opacity="0.45" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        const x1 = 100 + 88 * Math.cos(a);
        const y1 = 100 + 88 * Math.sin(a);
        const x2 = 100 + 40 * Math.cos(a);
        const y2 = 100 + 40 * Math.sin(a);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#d4af37"
            strokeWidth="0.35"
            opacity="0.35"
          />
        );
      })}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI) / 12;
        const x = 100 + 68 * Math.cos(a);
        const y = 100 + 68 * Math.sin(a);
        return <circle key={`d-${i}`} cx={x} cy={y} r="2" fill="#e8c96a" opacity="0.25" />;
      })}
    </svg>
  );
}

export default function MandalaBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute left-1/2 top-[6%] h-[min(480px,85vw)] w-[min(480px,85vw)] -translate-x-1/2 opacity-[0.08]"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        <MandalaSvg className="h-full w-full" />
      </motion.div>
      <motion.div
        className="absolute -left-16 top-24 h-56 w-56 opacity-[0.06]"
        animate={{ rotate: -360 }}
        transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
      >
        <MandalaSvg className="h-full w-full" />
      </motion.div>
      <motion.div
        className="absolute -right-16 bottom-16 h-64 w-64 opacity-[0.06]"
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
      >
        <MandalaSvg className="h-full w-full" />
      </motion.div>
    </div>
  );
}
