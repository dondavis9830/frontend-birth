import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { apiUrl, getApiErrorMessage } from '../lib/api';

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function WishMessageTicker({ wishes }) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (wishes.length < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      controls.set({ x: 0 });
      return undefined;
    }

    controls.start({
      x: '-50%',
      transition: { duration: Math.max(24, wishes.length * 8), ease: 'linear', repeat: Infinity },
    });

    return () => controls.stop();
  }, [controls, wishes]);

  if (wishes.length === 0) return null;

  const pause = () => controls.stop();
  const resume = () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      controls.start({
        x: '-50%',
        transition: { duration: Math.max(24, wishes.length * 8), ease: 'linear', repeat: Infinity },
      });
    }
  };

  return (
    <div
      className="mt-10 overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resume();
      }}
      aria-label="Birthday messages from students"
    >
      <motion.div
        className="flex w-max gap-5 py-3"
        animate={controls}
        style={{ x: 0 }}
      >
        {[...wishes, ...wishes].map((wish, index) => (
          <article
            key={`${wish._id}-${index >= wishes.length ? 'copy' : 'message'}`}
            aria-hidden={index >= wishes.length}
            className="w-[min(82vw,390px)] shrink-0 rounded-2xl border border-purple-500/25 bg-slate-950/75 p-5 shadow-lg"
          >
            <h3 className="font-display text-lg font-semibold text-purple-100">{wish.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-purple-200/75">{wish.message}</p>
          </article>
        ))}
      </motion.div>
    </div>
  );
}

export default function ApprovedVideoWishes({ accessToken }) {
  const [wishes, setWishes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let active = true;
    axios.get(apiUrl('/api/wishes'), {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((response) => response.data.wishes)
      .then((items) => {
        if (active) {
          const randomOrder = shuffle(items);
          setWishes(randomOrder);
          setActiveIndex(0);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof TypeError
              ? 'Video wishes are unavailable until the backend is configured and running.'
              : getApiErrorMessage(requestError)
          );
        }
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  return (
    <section id="video-wishes" className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80">
            Video Wishes
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-purple-100 sm:text-4xl">
            Wishes Straight From The Heart
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-purple-200/60 font-sans">
            Approved birthday videos play one at a time in a random order.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-center text-sm text-pink-300">
            {error}
          </p>
        )}
        {loaded && !error && wishes.length === 0 && (
          <p className="text-center text-sm text-purple-200/55">
            Video wishes will appear here after they are approved.
          </p>
        )}

        {wishes.length > 0 && (
          <>
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-purple-500/25 bg-slate-950/80 shadow-[0_0_45px_rgba(168,85,247,0.12)]">
              <AnimatePresence mode="wait" initial={false}>
                {wishes[activeIndex] && (
                  <motion.video
                    ref={videoRef}
                    key={wishes[activeIndex]._id}
                    src={wishes[activeIndex].videoUrl}
                    autoPlay
                    playsInline
                    preload="auto"
                    volume={1}
                    onLoadedMetadata={(event) => {
                      event.currentTarget.muted = false;
                      event.currentTarget.volume = 1;
                    }}
                    onPlay={(event) => {
                      event.currentTarget.muted = false;
                      event.currentTarget.volume = 1;
                    }}
                    onClick={() => {
                      if (!videoRef.current) return;
                      videoRef.current.muted = false;
                      videoRef.current.volume = 1;
                      videoRef.current.play().catch(() => {});
                    }}
                    onEnded={() => setActiveIndex((index) => (index + 1) % wishes.length)}
                    onError={() => {
                      if (wishes.length > 1) {
                        setActiveIndex((index) => (index + 1) % wishes.length);
                      }
                    }}
                    initial={{ x: '100%', opacity: 0.6 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-100%', opacity: 0.6 }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                    className="aspect-video w-full bg-slate-900 object-contain"
                    aria-label="Birthday wish video"
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="mt-4 text-center font-mono text-xs text-purple-300/55">
              Video {activeIndex + 1} of {wishes.length}
            </div>
            <div className="mt-14">
              <h3 className="text-center font-display text-2xl font-semibold text-purple-100">
                Birthday Messages
              </h3>
              <p className="mt-2 text-center text-sm text-purple-200/55">
                Notes from everyone celebrating with you
              </p>
              <WishMessageTicker wishes={wishes} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
