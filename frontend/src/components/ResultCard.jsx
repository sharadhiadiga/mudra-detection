import { motion } from 'framer-motion';

const cardClass =
  'glass-panel min-h-[320px] w-full rounded-2xl border border-gold/40 p-8 shadow-glow transition-shadow duration-300';

export default function ResultCard({ mudra, confidence, loading = false, placeholder }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cardClass}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/90">
          ◆ Detection Result
        </p>
        <p className="mt-8 animate-pulse text-cream/60">Analyzing mudra…</p>
      </motion.div>
    );
  }

  if (!mudra) {
    return (
      <div className={`${cardClass} flex flex-col justify-center`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/90">
          ◆ Detection Result
        </p>
        <p className="mt-6 text-sm leading-relaxed text-cream/55">
          {placeholder ||
            'Upload a hand mudra image and tap Detect Mudra. Your result will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cardClass}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/90">
        ◆ Detection Result
      </p>
      <p className="mt-6 font-serif text-5xl font-bold leading-tight text-gold-hi text-gold-glow">
        {mudra}
      </p>
      <p className="mt-6 text-sm uppercase tracking-wider text-cream/65">Confidence</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-success">{confidence}</p>
    </motion.div>
  );
}
