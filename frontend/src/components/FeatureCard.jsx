import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FeatureCard({ title, description, buttonLabel, to, icon, delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group flex flex-col rounded-2xl border border-gold/30 bg-maroon-card p-6 shadow-glow transition-shadow hover:border-gold/60 hover:shadow-glow"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-black/30 text-2xl text-gold-hi">
        {icon}
      </div>
      <h2 className="mb-2 font-serif text-xl font-semibold uppercase tracking-wide text-gold-hi">
        {title}
      </h2>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-cream/75">{description}</p>
      <Link
        to={to}
        className="inline-flex items-center justify-center rounded-full border-2 border-gold bg-gradient-to-b from-maroon-mid to-maroon px-5 py-2.5 text-sm font-semibold text-gold-hi transition group-hover:shadow-glow"
      >
        {buttonLabel}
      </Link>
    </motion.article>
  );
}
