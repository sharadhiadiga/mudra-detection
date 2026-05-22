import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FeatureCard({
  title,
  description,
  buttonLabel,
  to,
  icon: Icon,
  delay = 0,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="elegant-card group flex flex-col p-6 transition-[transform,border-color] duration-300 hover:border-gold-hi"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(212,175,55,0.5)] bg-black/30">
        <Icon className="h-7 w-7 text-gold opacity-80" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="mb-2 font-serif text-xl font-semibold uppercase tracking-wide text-gold-hi">
        {title}
      </h2>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-cream/75">{description}</p>
      <Link
        to={to}
        className="inline-flex items-center justify-center rounded-full border border-[rgba(212,175,55,0.5)] bg-gradient-to-b from-maroon-mid to-maroon px-5 py-2.5 text-sm font-semibold text-gold-hi transition duration-300 hover:scale-[1.02] hover:border-gold-hi"
      >
        {buttonLabel}
      </Link>
    </motion.article>
  );
}
