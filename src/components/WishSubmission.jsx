import axios from 'axios';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, LogOut, RotateCcw, Square, Upload } from 'lucide-react';
import { apiUrl, getApiErrorMessage } from '../lib/api';

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_DURATION_SECONDS = 20;
const RECORDING_MIME_TYPES = ['video/webm', 'video/mp4'];

export default function WishSubmission({ accessToken, onExit }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [recordingActive, setRecordingActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const fileInputRef = useRef(null);
  const [secondsRecorded, setSecondsRecorded] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const successCardRef = useRef(null);
  const liveVideoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recordingStartedAtRef = useRef(0);
  const mountedRef = useRef(true);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  };

  const clearRecordingTimers = () => {
    window.clearTimeout(recordingTimeoutRef.current);
    window.clearInterval(recordingIntervalRef.current);
    recordingTimeoutRef.current = null;
    recordingIntervalRef.current = null;
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearRecordingTimers();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!success || !successCardRef.current) return;

    const card = successCardRef.current;
    const items = card.querySelectorAll('[data-gsap-item]');

    gsap.set(items, { opacity: 0, y: 18, scale: 0.98 });
    gsap.to(card, {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out',
    });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.12,
      ease: 'back.out(1.7)',
      delay: 0.1,
    });
  }, [success]);

  const stopRecording = () => {
    clearRecordingTimers();
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  const validateVideoFile = (file) =>
    new Promise((resolve, reject) => {
      if (!(file instanceof Blob)) {
        reject('Please upload a valid video file.');
        return;
      }

      if (!file.type.startsWith('video/')) {
        reject('Please upload a valid video file.');
        return;
      }

      if (file.size > MAX_FILE_BYTES) {
        reject('The uploaded video must be 100 MB or smaller.');
        return;
      }

      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        if (Number.isFinite(video.duration) && video.duration > MAX_DURATION_SECONDS) {
          reject(`The uploaded video must be ${MAX_DURATION_SECONDS} seconds or shorter.`);
          return;
        }
        resolve(file);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject('This file could not be checked as a valid video. Please upload a different file.');
      };
      video.src = url;
    });

  const handleVideoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setRecordingActive(false);
    clearRecordingTimers();
    stopCamera();

    validateVideoFile(file)
      .then((validatedFile) => {
        setRecording(validatedFile);
        setPreviewUrl(URL.createObjectURL(validatedFile));
        setSecondsRecorded(0);
      })
      .catch((message) => {
        setError(message);
        setRecording(null);
        setPreviewUrl('');
      })
      .finally(() => {
        event.target.value = '';
      });
  };

  const startRecording = async () => {
    if (cameraStarting || recordingActive) return;
    setError('');
    setSuccess('');
    setRecording(null);
    setSecondsRecorded(0);
    setPreviewUrl('');

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Live recording is not supported by this browser. Try a current version of Chrome, Edge, or Firefox.');
      return;
    }

    setCameraStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        await liveVideoRef.current.play();
      }

      const mimeType = RECORDING_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) {
        setCameraStarting(false);
        stopCamera();
        setError('This browser cannot record an MP4 or WebM video. Try a current version of Chrome, Edge, or Firefox.');
        return;
      }
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setError('The recording could not be completed. Please try again.');
        setRecordingActive(false);
        clearRecordingTimers();
        stopCamera();
      };
      recorder.onstop = () => {
        if (!mountedRef.current) {
          chunksRef.current = [];
          return;
        }
        const type = (recorder.mimeType || 'video/webm').split(';', 1)[0];
        const clip = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        if (clip.size > 0) {
          setRecording(clip);
          setPreviewUrl(URL.createObjectURL(clip));
        } else {
          setError('No video was recorded. Please try again.');
        }
        setRecordingActive(false);
        clearRecordingTimers();
        stopCamera();
      };

      recordingStartedAtRef.current = Date.now();
      recorder.start(250);
      setRecordingActive(true);
      setCameraStarting(false);
      recordingIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartedAtRef.current) / 1000);
        setSecondsRecorded(Math.min(elapsed, MAX_DURATION_SECONDS));
      }, 200);
      recordingTimeoutRef.current = window.setTimeout(
        stopRecording,
        MAX_DURATION_SECONDS * 1000
      );
    } catch (cameraError) {
      if (!mountedRef.current) {
        stopCamera();
        return;
      }
      setCameraStarting(false);
      stopCamera();
      if (cameraError.name === 'NotAllowedError' || cameraError.name === 'PermissionDeniedError') {
        setError('Allow camera and microphone access in your browser to record a video wish.');
      } else if (cameraError.name === 'NotFoundError' || cameraError.name === 'DevicesNotFoundError') {
        setError('No camera or microphone was found on this device.');
      } else {
        setError('Could not start the camera. Use HTTPS or localhost and check that your camera is available.');
      }
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!recording) {
      setError('Record a video wish before submitting.');
      return;
    }

    try {
      await validateVideoFile(recording);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : validationError);
      return;
    }

    if (recording.size > MAX_FILE_BYTES) {
      setError('The video must be 100 MB or smaller.');
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('message', message);
      const extension = recording.type.includes('mp4') ? 'mp4' : 'webm';
      formData.append('video', recording, `birthday-wish.${extension}`);

      const response = await axios.post(apiUrl('/api/wishes'), formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = response.data;
      setSuccess(data.message);
      setName('');
      setMessage('');
      setRecording(null);
      setPreviewUrl('');
      setSecondsRecorded(0);
      event.target.reset();
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Cannot reach the upload service. Start the backend and configure server/.env.'
          : getApiErrorMessage(requestError)
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <section className="relative z-10 w-full max-w-xl rounded-2xl border border-purple-500/30 bg-slate-950/85 p-6 shadow-[0_0_50px_rgba(168,85,247,0.2)] backdrop-blur-md sm:p-9">
        {success ? (
          <div
            ref={successCardRef}
            className="relative overflow-hidden rounded-4xl border border-pink-400/30 bg-linear-to-br from-pink-500/10 via-purple-500/10 to-slate-950 p-6 text-center shadow-[0_25px_80px_rgba(236,72,153,0.18)]"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_62%)]" />
            <div className="relative space-y-6">
              <div data-gsap-item className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-pink-300/40 bg-pink-500/15 text-2xl shadow-[0_0_25px_rgba(244,114,182,0.2)]">
                💌
              </div>

              <div data-gsap-item className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-pink-200/80">Thank you</p>
                <h2 className="font-display text-3xl font-semibold text-purple-100">💖 A Heartfelt Thank You! 🎂</h2>
              </div>

              <div data-gsap-item className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-5 text-left shadow-inner shadow-white/5">
                <p className="mt-3 text-sm leading-7 text-purple-100/80">
                  Thank you so much for your lovely birthday wishes and for being a part of this special celebration! Your love and kind words made Amritha&apos;s birthday even more memorable. 🥰✨
                </p>
                <p className="mt-5 text-sm leading-7 text-purple-100/80">
                  With love and gratitude,
                </p>
                <p className="mt-2 font-display text-lg text-pink-100">Amritha&apos;s Students ❤️</p>
                <p className="mt-1 font-display text-base text-purple-200/80">Thrissur May Batch 🎓💕</p>
              </div>

              <p data-gsap-item className="text-sm leading-relaxed text-purple-200/65">
                Your wish has been received and is now part of this beautiful celebration.
              </p>

              <button
                data-gsap-item
                type="button"
                onClick={onExit}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-400 to-pink-400 px-5 py-3 font-medium text-slate-950 transition-opacity hover:opacity-90"
              >
                <ArrowLeft size={16} /> Back to page options
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-start gap-3">
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-2 text-sm text-purple-300 transition-colors hover:text-purple-100"
              >
                <ArrowLeft size={16} /> Back to page options
              </button>
            </div>
            <div className="mb-7 mt-8 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80">
            Share a birthday wish
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-purple-100">
            Send a video to Amritha Ma’am
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-purple-200/65">
            Record a short video wish. An admin will review it before it appears on her
            birthday page.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <label className="block space-y-2 text-sm text-purple-100">
            <span>Your name</span>
            <input
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-purple-500/30 bg-slate-900/70 px-4 py-3 text-purple-100 outline-none focus:border-purple-300"
            />
          </label>

          <label className="block space-y-2 text-sm text-purple-100">
            <span>Your birthday message</span>
            <textarea
              required
              maxLength={300}
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full resize-y rounded-lg border border-purple-500/30 bg-slate-900/70 px-4 py-3 text-purple-100 outline-none focus:border-purple-300"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm text-purple-100">
              <span>Record your video wish (up to 20 seconds)</span>
              <span className={recordingActive ? 'font-mono text-red-300' : 'font-mono text-purple-300/70'}>
                {recordingActive ? 'Recording' : recording ? 'Recorded' : 'Ready'} · {secondsRecorded}/{MAX_DURATION_SECONDS}s
              </span>
            </div>
            <video
              ref={liveVideoRef}
              autoPlay
              muted
              playsInline
              className={recordingActive ? 'aspect-video w-full rounded-xl bg-slate-900 object-cover' : 'hidden'}
              aria-label="Live camera preview"
            />
            {!recordingActive && previewUrl && (
              <video
                src={previewUrl}
                controls
                playsInline
                className="aspect-video w-full rounded-xl bg-slate-900 object-cover"
                aria-label="Recorded video preview"
              />
            )}
            {!recordingActive && !previewUrl && (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-purple-500/20 bg-slate-900/70 text-sm text-purple-300/60">
                Your camera preview will appear here
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {recordingActive ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 font-medium text-red-200 hover:bg-red-500/25"
                >
                  <Square size={16} /> Stop recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={busy || cameraStarting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-400/40 bg-purple-500/15 px-4 py-3 font-medium text-purple-100 hover:bg-purple-500/25 disabled:opacity-50"
                >
                  {recording ? <RotateCcw size={17} /> : <Camera size={17} />}
                  {cameraStarting ? 'Starting camera…' : recording ? 'Record again' : 'Start recording'}
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-pink-400/40 bg-pink-500/10 px-4 py-3 font-medium text-pink-100 hover:bg-pink-500/20"
              >
                <Upload size={17} /> Upload video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.webm"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>
            {recording && !recordingActive && (
              <p className="text-sm text-green-200">
                Video ready · {(recording.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}
            <p className="text-xs leading-relaxed text-purple-300/45">
              Choose a video from your device or record one directly. Recording stops automatically at 20 seconds.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="rounded-lg border border-green-400/30 bg-green-500/10 p-3 text-sm text-green-200">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || recordingActive || !recording}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-400 to-pink-400 px-5 py-3 font-medium text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            <Upload size={17} /> {busy ? 'Uploading…' : 'Submit video wish'}
          </button>
        </form>
            <p className="mt-5 text-center text-xs leading-relaxed text-purple-300/45">
              Please share only a video you have permission to submit. Unapproved videos will
              not be shown on the birthday page.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
