import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlowButton from './GlowButton';

export default function Header({ showBack = false, backTo = '/' }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 mb-8 flex items-center justify-between gap-4 border-b border-gold/20 pb-5"
    >
      <div className="flex items-center gap-3">
        {showBack ? (
          <Link
            to={backTo}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-cream transition hover:border-gold hover:shadow-glow-gold"
            aria-label="Back"
          >
            ←
          </Link>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-maroon-card text-lg text-gold-hi">
            ॥
          </span>
        )}
        <div>
          <Link to="/" className="font-serif text-lg font-bold tracking-[0.2em] text-gold-hi">
            NRITYAAI
          </Link>
          <p className="text-xs italic text-cream/75">Preserving Art. Empowering Talent.</p>
        </div>
      </div>
      {!showBack && (
        <GlowButton variant="outline" className="text-xs uppercase tracking-wider">
          About Us
        </GlowButton>
      )}
    </motion.header>
  );
}
