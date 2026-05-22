import { motion } from 'framer-motion';

const sectionClass =
  'rounded-[16px] border border-[rgba(212,175,55,0.25)] bg-black/20 p-4';
const panelClass = 'elegant-card flex w-full min-h-[320px] flex-col gap-5 p-6';

function Bar({ label, value, color = 'bg-gold' }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs uppercase tracking-wider text-cream/60">
        <span>{label}</span>
        <span className="text-cream">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/50">
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

export default function LiveSidePanel({
  phase,
  stability,
  confidence,
  currentMudra,
  currentConfidence,
  history,
  running,
}) {
  const statusLabel =
    phase === 'prediction'
      ? 'Live'
      : phase === 'no_hand'
        ? 'No hand detected'
        : phase === 'stabilizing'
          ? 'Stabilizing…'
          : phase === 'detecting'
            ? 'Waiting…'
            : phase === 'error'
              ? 'Error'
              : running
                ? 'Waiting…'
                : 'Idle';

  const phaseDisplay =
    phase === 'prediction'
      ? 'Live'
      : phase === 'no_hand'
        ? 'No hand'
        : phase === 'stabilizing'
          ? 'Stabilizing'
          : phase === 'detecting'
            ? 'Waiting'
            : phase === 'error'
              ? 'Error'
              : running
                ? 'Waiting'
                : 'Waiting to start';

  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className={panelClass}
    >
      <div className={sectionClass}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gold/90">
          Detection Status
        </h3>
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              phase === 'prediction'
                ? 'bg-success'
                : running
                  ? 'animate-pulse bg-success'
                  : 'bg-gold/50'
            }`}
          />
          <span className="text-sm font-medium capitalize text-cream">{phaseDisplay}</span>
        </div>
        {running ? (
          <>
            <Bar label="Stability" value={stability} color="bg-success/80" />
            <Bar label="Confidence" value={Math.round((confidence || 0) * 100)} />
          </>
        ) : (
          <p className="text-sm text-cream/50">Start detection to see live status.</p>
        )}
      </div>

      <div className={sectionClass}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gold/90">
          Current Prediction
        </h3>
        {currentMudra ? (
          <>
            <p className="font-serif text-3xl font-bold text-gold-hi text-gold-glow">
              {currentMudra}
            </p>
            <p className="mt-1 text-xl font-semibold text-success">
              {((currentConfidence || 0) * 100).toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-cream/50">—</p>
        )}
        <p className="mt-3 text-xs uppercase tracking-wider text-gold/80">
          Status: <span className="text-cream">{statusLabel}</span>
        </p>
      </div>

      <div className={sectionClass}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gold/90">
          Prediction History
        </h3>
        <ul className="space-y-2">
          {history.length === 0 && (
            <li className="text-sm text-cream/45">Last 5 predictions will appear here.</li>
          )}
          {history.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between rounded-[12px] border border-[rgba(212,175,55,0.2)] bg-black/25 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 font-medium text-cream">
                <span className="h-2 w-2 rounded-full bg-success" />
                {h.mudra}
              </span>
              <span className="font-semibold text-success">
                {(h.confidence * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.aside>
  );
}
