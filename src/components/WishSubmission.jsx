import axios from 'axios';
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
  const [secondsRecorded, setSecondsRecorded] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const stopRecording = () => {
    clearRecordingTimers();
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
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
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 text-sm text-purple-300 transition-colors hover:text-purple-100"
          >
            <ArrowLeft size={16} /> Back to page options
          </button>
          <button
            type="button"
            onClick={() => {
              onExit();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-400/40 bg-slate-900/70 px-3 py-2 text-sm text-purple-100 transition-colors hover:bg-slate-800/80"
          >
            <LogOut size={16} /> Logout
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
              {recording && !recordingActive && (
                <p className="flex items-center justify-center text-sm text-green-200">
                  Recording ready · {(recording.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              )}
            </div>
            <p className="text-xs leading-relaxed text-purple-300/45">
              Your browser will ask for camera and microphone access. Recording stops automatically at 20 seconds.
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 px-5 py-3 font-medium text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            <Upload size={17} /> {busy ? 'Uploading…' : 'Submit video wish'}
          </button>
        </form>
        <p className="mt-5 text-center text-xs leading-relaxed text-purple-300/45">
          Please share only a video you have permission to submit. Unapproved videos will
          not be shown on the birthday page.
        </p>
      </section>
    </main>
  );
}
