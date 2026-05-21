import { motion } from 'framer-motion';

function Bar({ label, value, color = 'bg-gold' }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-xs uppercase tracking-wider text-cream/60">
        <span>{label}</span>
        <span className="text-cream">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/50">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

export function StatusPanelLeft({ phase, stability, confidence, frames }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-gold/25 bg-maroon-card/90 p-5 shadow-glow-gold"
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-gold/90">
        Detection Status
      </h3>
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            phase === 'locked' ? 'bg-success' : phase === 'detecting' || phase === 'stabilizing' ? 'animate-pulse bg-success' : 'bg-gold'
          }`}
        />
        <span className="text-sm capitalize text-cream">{phase.replace('_', ' ')}</span>
      </div>
      <Bar label="Stability" value={stability} color="bg-success/80" />
      <Bar label="Confidence" value={Math.round(confidence * 100)} />
      <p className="mt-4 text-xs text-cream/50">Frames analyzed: {frames}</p>
      <p className="mt-3 rounded-lg border border-gold/20 bg-black/30 p-3 text-xs leading-relaxed text-cream/60">
        Tip: Hold your mudra steady inside the guide box for a stable lock.
      </p>
    </motion.aside>
  );
}

export function StatusPanelRight({ currentMudra, currentConfidence, history, phase }) {
  const statusLabel =
    phase === 'locked' ? 'Locked' : phase === 'stabilizing' ? 'Stabilizing…' : 'Detecting…';

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-gold/25 bg-maroon-card/90 p-5 shadow-glow-gold"
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-gold/90">
        Current Prediction
      </h3>
      {currentMudra ? (
        <>
          <p className="font-serif text-2xl text-gold-hi">{currentMudra}</p>
          <p className="text-success">{(currentConfidence * 100).toFixed(2)}%</p>
        </>
      ) : (
        <p className="text-cream/50">—</p>
      )}

      <h4 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-cream/50">
        Prediction History
      </h4>
      <ul className="space-y-2">
        {history.length === 0 && (
          <li className="text-xs text-cream/40">Waiting for frames…</li>
        )}
        {history.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between rounded-lg border border-gold/10 bg-black/25 px-2 py-1.5 text-xs"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {h.mudra}
            </span>
            <span className="text-success">{(h.confidence * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs uppercase tracking-wider text-gold">
        Status: <span className="text-cream">{statusLabel}</span>
      </p>
    </motion.aside>
  );
}
