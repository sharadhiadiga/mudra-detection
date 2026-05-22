import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { Video } from 'lucide-react';
import CircleViewer from '../components/CircleViewer';
import CircleEmptyState from '../components/CircleEmptyState';
import GlowButton from '../components/GlowButton';
import PageShell from '../components/PageShell';
import MainGrid from '../components/MainGrid';
import LiveSidePanel from '../components/LiveSidePanel';
import { useLiveDetection } from '../hooks/useLiveDetection';

export default function Live() {
  const navigate = useNavigate();
  const { videoRef, canvasRef, live, running, start, stop, isLocked } = useLiveDetection();

  const statusText =
    live.phase === 'locked'
      ? 'Mudra locked'
      : running
        ? 'Detecting…'
        : 'Place your hand inside the circle';

  return (
    <PageShell className="flex min-h-screen flex-col">
      <Header showBack backTo="/" />

      <div className="flex flex-1 flex-col justify-center pb-16 pt-8 sm:pt-12">
      <MainGrid
        left={
          <>
            <CircleViewer
              locked={isLocked}
              live={running && !isLocked}
              showGuide={running}
              badge={running ? (isLocked ? 'LOCKED' : 'LIVE') : null}
            >
              <div className="relative h-full w-full">
                <video
                  ref={videoRef}
                  className={`h-full w-full object-cover ${running ? '' : 'invisible'}`}
                  playsInline
                  muted
                  autoPlay
                />
                {!running && (
                  <div className="absolute inset-0 bg-black">
                    <CircleEmptyState icon={Video} label="Camera preview" />
                  </div>
                )}
              </div>
            </CircleViewer>
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

            <AnimatePresence>
              {isLocked && live.lockedMudra && (
                <motion.div
                  key="lock-result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 w-full max-w-[350px] text-center"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-success">
                    Locked
                  </p>
                  <p className="mt-2 font-serif text-4xl font-bold text-gold-hi text-gold-glow">
                    {live.lockedMudra}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-success">
                    {(live.lockedConfidence * 100).toFixed(2)}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-5 text-center text-sm text-cream/70">{statusText}</p>

            <div className="mt-6 flex w-full max-w-md flex-wrap items-center justify-center gap-3">
              {!running ? (
                <GlowButton variant="gold" onClick={start}>
                  Start Detection
                </GlowButton>
              ) : (
                <GlowButton variant="outline" onClick={stop}>
                  Stop Detection
                </GlowButton>
              )}
              <GlowButton variant="ghost" onClick={() => navigate('/')}>
                Home
              </GlowButton>
            </div>
          </>
        }
        right={
          <LiveSidePanel
            phase={live.phase}
            stability={live.stability}
            confidence={live.lockedConfidence || live.currentConfidence}
            currentMudra={live.lockedMudra || live.currentMudra}
            currentConfidence={live.lockedConfidence || live.currentConfidence}
            history={live.history}
            running={running}
          />
        }
      />
      </div>
    </PageShell>
  );
}
