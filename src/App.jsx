import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import TerminalIntro from './components/TerminalIntro';
import PasswordEntry from './components/PasswordEntry';
import BirthdayReveal from './components/BirthdayReveal';
import PhotoReveal from './components/PhotoReveal';
import CodeBirthdayCard from './components/CodeBirthdayCard';
import AppreciationCards from './components/AppreciationCards';
import JourneyTimeline from './components/JourneyTimeline';
import PhotoGallery from './components/PhotoGallery';
import ApprovedVideoWishes from './components/ApprovedVideoWishes';
import SurpriseBox from './components/SurpriseBox';
import BalloonPop from './components/BalloonPopping';
import ScratchCard from './components/ScratchCard';
import BirthdayWishGenerator from './components/BirthdayWishGenerator';
import CelebrationSection from './components/CelebrationSection';
import BirthdayLetter from './components/BirthdayLetter';
import FinalSurprise from './components/FinalSurprise';
import { useSound } from './hooks/useSound';
import Navigation from './components/Navigation';
import Confetti from './components/Confetti';
import SoundControls from './components/SoundControls';
import CursorTrail from './components/CursorTrail';
import AmbientField from './components/AmbientField';

const WishSubmission = lazy(() => import('./components/WishSubmission'));
const AdminPage = lazy(() => import('./components/AdminPage'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BirthdayExperience />} />
      <Route
        path="/wish"
        element={
          <Suspense fallback={<PageLoading />}>
            <WishRoute />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<PageLoading />}>
            <AdminPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function WishRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = location.state?.accessToken;
  return (
    <Suspense fallback={<PageLoading />}>
      {accessToken ? (
        <WishSubmission accessToken={accessToken} onExit={() => navigate('/')} />
      ) : (
        <main className="relative flex min-h-screen items-center justify-center px-4 py-14">
          <section className="w-full max-w-xl">
            <button type="button" onClick={() => navigate('/')} className="mb-6 text-sm text-purple-300 hover:text-purple-100">
              Back
            </button>
            <PasswordEntry
              page="wish"
              onAccess={(token) => navigate('/wish', { replace: true, state: { accessToken: token } })}
            />
          </section>
        </main>
      )}
    </Suspense>
  );
}

function PageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-sm text-purple-200/70">
      Loading…
    </main>
  );
}

function BirthdayExperience() {
  const { play } = useSound();
  const navigate = useNavigate();
  const [stage, setStage] = useState('terminal');
  const [accessToken, setAccessToken] = useState('');
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const scrollRef = useRef(null);

  const fireConfetti = useCallback(() => {
    setConfettiTrigger((n) => n + 1);
    play('confetti');
  }, [play]);

  const unlock = useCallback((token) => {
    setAccessToken(token);
    setStage('experience');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const replay = useCallback(() => {
    setStage('terminal');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (stage === 'experience') {
      const timer = setTimeout(fireConfetti, 200);
      return () => clearTimeout(timer);
    }
  }, [stage, fireConfetti]);

  return (
    <div ref={scrollRef} className="relative min-h-screen bg-midnight">
      <AmbientField />
      <CursorTrail />
      <Confetti trigger={confettiTrigger} />

      <Navigation visible={stage === 'experience'} onReplay={replay} />
      <SoundControls visible={stage === 'experience'} />

      <AnimatePresence mode="wait">
        {stage === 'terminal' ? (
          <motion.main
            key="terminal"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TerminalIntro
              onAccess={({ page, token }) => {
                if (page === 'birthday') {
                  unlock(token);
                  return;
                }
                navigate('/wish', { state: { accessToken: token } });
              }}
            />
          </motion.main>
        ) : (
          <motion.main
            key="experience"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <BirthdayReveal onConfetti={fireConfetti} />
            <PhotoReveal />
            <CodeBirthdayCard />
            <AppreciationCards />
            <JourneyTimeline />
            <PhotoGallery />
            <ApprovedVideoWishes accessToken={accessToken} />
            <SurpriseBox />
            <BalloonPop />
            {/* <ScratchCard /> */}
            <BirthdayWishGenerator />
            <CelebrationSection onConfetti={fireConfetti} />
            <BirthdayLetter />
            <FinalSurprise onReplay={replay} />
          </motion.main>
        )}
      </AnimatePresence>

      <footer className="border-t border-lavender/10 px-4 py-8 text-center">
        <p className="font-mono text-xs text-warmwhite/35">
          crafted with love, gratitude, and a little JavaScript — for Amritha Ma'am 💜
        </p>
      </footer>
    </div>
  );
}