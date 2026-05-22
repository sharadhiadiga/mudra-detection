import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import GlowButton from './GlowButton';

export default function Header({ showBack = false, backTo = '/' }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 mb-8 flex items-center justify-between gap-4 border-b border-gold/20 pb-5"
    >
      <div className="flex items-center gap-2.5">
        {showBack ? (
          <Link
            to={backTo}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(212,175,55,0.5)] text-gold transition duration-300 hover:scale-[1.02] hover:border-gold-hi"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        ) : (
          <Link to="/" className="logo" aria-label="NrityaAI home">
            <img src="/assets/logo.png" alt="" />
          </Link>
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
