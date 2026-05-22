import { motion } from 'framer-motion';

const variants = {
  primary:
    'border-2 border-gold bg-gradient-to-b from-maroon-mid to-maroon text-gold-hi transition-all duration-300 hover:border-gold/80 hover:shadow-glow-hover',
  gold:
    'border-2 border-gold bg-gradient-to-r from-gold-line via-gold to-gold-hi text-maroon font-semibold transition-all duration-300 hover:shadow-glow-hover',
  outline:
    'border border-[rgba(212,175,55,0.35)] bg-transparent text-gold-hi transition-all duration-300 hover:border-gold/60 hover:shadow-glow-hover',
  ghost:
    'border border-[rgba(212,175,55,0.25)] bg-maroon-card/60 text-cream/80 transition-all duration-300 hover:border-gold/40 hover:text-cream',
};

export default function GlowButton({
  children,
  variant = 'primary',
  className = '',
  disabled,
  onClick,
  type = 'button',
  as: Component = 'button',
  ...props
}) {
  const cls = `inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`;

  if (Component !== 'button') {
    return (
      <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={cls}>
        {children}
      </motion.span>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={cls}
      {...props}
    >
      {children}
    </motion.button>
  );
}
