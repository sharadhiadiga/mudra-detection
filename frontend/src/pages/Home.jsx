import { motion } from 'framer-motion';
import { Upload, Video } from 'lucide-react';
import Header from '../components/Header';
import FeatureCard from '../components/FeatureCard';
import PageShell from '../components/PageShell';

export default function Home() {
  return (
    <PageShell className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1 flex-col justify-center pb-16 pt-8 sm:pt-12">
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
          icon={Upload}
          delay={0.15}
        />
        <FeatureCard
          title="Live Detection"
          description="Use your webcam for real-time mudra detection with stability locking."
          buttonLabel="Start Live Detection"
          to="/live"
          icon={Video}
          delay={0.25}
        />
      </div>
      </div>
    </PageShell>
  );
}
