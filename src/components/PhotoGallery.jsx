import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn } from 'lucide-react';
import { galleryPhotos } from '../data/gallery';

export default function PhotoGallery() {
  const [open, setOpen] = useState(null);
  const [errored, setErrored] = useState(new Set());

  const visible = galleryPhotos.filter((p) => !errored.has(p.id));

  const close = useCallback(() => setOpen(null), []);
  const next = useCallback(
    () => setOpen((cur) => (cur === null ? cur : (cur + 1) % visible.length)),
    [visible.length]
  );
  const prev = useCallback(
    () => setOpen((cur) => (cur === null ? cur : (cur - 1 + visible.length) % visible.length)),
    [visible.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, next, prev]);

  const handleError = (id) =>
    setErrored((prev) => new Set(prev).add(id));

  // Balanced layout spans designed specifically for 8 photos
  const getSpanClass = (index) => {
    switch (index) {
      case 0:
        return 'col-span-2 row-span-2 md:col-span-2 md:row-span-2'; // Featured large square
      case 1:
        return 'col-span-1 row-span-1'; // Standard
      case 2:
        return 'col-span-1 row-span-2'; // Tall portrait
      case 3:
        return 'col-span-1 row-span-1'; // Standard
      case 4:
        return 'col-span-2 row-span-1'; // Wide landscape banner
      case 5:
        return 'col-span-1 row-span-1'; // Standard
      case 6:
        return 'col-span-1 row-span-2'; // Tall portrait
      case 7:
        return 'col-span-1 row-span-1'; // Wide banner
      default:
        return 'col-span-1 row-span-2';
    }
  };

  return (
    <section id="gallery" className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80">
            Moments & Memories
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-purple-100 sm:text-4xl">
            A Little Photo Gallery
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-purple-200/60 font-sans">
            Some moments are worth keeping. Here are a few from our journey together.
          </p>
        </motion.div>

        {visible.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-purple-500/20 bg-slate-950/60 p-10 text-center backdrop-blur-md">
            <ImageOff className="text-purple-400/50" size={32} />
            <p className="text-sm text-purple-200/60 font-sans">
              No photos yet. Drop images into{' '}
              <code className="font-mono text-purple-300">public/images/gallery/</code> and
              update <code className="font-mono text-purple-300">src/data/gallery.js</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 auto-rows-37.5 sm:auto-rows-45 gap-4">
            {visible.map((photo, i) => (
              <motion.button
                key={photo.id}
                type="button"
                onClick={() => setOpen(i)}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.06, 0.4) }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-950/60 cursor-pointer shadow-lg ${getSpanClass(
                  i
                )}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  onError={() => handleError(photo.id)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 text-left opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="line-clamp-2 text-xs sm:text-sm text-purple-100 font-sans font-medium">
                    {photo.caption}
                  </p>
                </div>
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-purple-100 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ZoomIn size={15} />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open !== null && visible[open] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/80 p-2.5 text-purple-100 transition-colors hover:bg-purple-500/20 cursor-pointer"
              aria-label="Close lightbox"
            >
              <X size={22} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 z-10 rounded-full bg-slate-900/80 p-2.5 text-purple-100 transition-colors hover:bg-purple-500/20 sm:left-6 cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft size={26} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 z-10 rounded-full bg-slate-900/80 p-2.5 text-purple-100 transition-colors hover:bg-purple-500/20 sm:right-6 cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight size={26} />
            </button>

            <motion.figure
              key={visible[open].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] max-w-4xl flex-col items-center gap-4"
            >
              <img
                src={visible[open].src}
                alt={visible[open].alt}
                className="max-h-[75vh] w-auto rounded-2xl border border-purple-500/30 object-contain shadow-[0_0_50px_rgba(168,85,247,0.3)]"
              />
              <figcaption className="text-center text-sm text-purple-200/70 font-sans">
                {visible[open].caption}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}