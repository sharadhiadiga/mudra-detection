import { motion } from 'framer-motion';
import Header from '../components/Header';
import FeatureCard from '../components/FeatureCard';
import PageShell from '../components/PageShell';

const features = [
  { icon: '◎', label: 'High Accuracy' },
  { icon: '⚡', label: 'Real-time Detection' },
  { icon: '🔒', label: 'Secure & Private' },
  { icon: '💃', label: 'Made for Dancers' },
];

export default function Home() {
  return (
    <PageShell>
      <Header />

      <section className="mb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-4xl font-bold uppercase tracking-[0.12em] text-gold-hi text-gold-glow sm:text-5xl"
        >
          AI Mudra Detection
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-xl text-cream/75"
        >
          Instantly recognize Indian classical dance mudras using AI
        </motion.p>
      </section>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <FeatureCard
          title="Upload Mudra"
          description="Upload a clear image of your hand performing a mudra for instant AI recognition."
          buttonLabel="Upload Image"
          to="/upload"
          icon="🖼"
          delay={0.15}
        />
        <FeatureCard
          title="Live Detection"
          description="Use your webcam for real-time mudra detection with stability locking."
          buttonLabel="Start Live Detection"
          to="/live"
          icon="📷"
          delay={0.25}
        />
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-14 rounded-2xl border border-gold/20 bg-maroon-card/80 px-4 py-5"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.label} className="flex flex-col items-center gap-2 text-center">
              <span className="text-xl text-gold-hi">{f.icon}</span>
              <span className="text-xs font-medium uppercase tracking-wide text-cream/70">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </motion.footer>
    </PageShell>
  );
}
