import { motion } from 'framer-motion';

export default function PageShell({ children, className = '' }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className={`relative z-10 mx-auto min-h-screen w-full max-w-[1200px] p-8 ${className}`}
    >
      {children}
    </motion.main>
  );
}
