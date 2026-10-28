import axios from 'axios';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, LogOut, RefreshCw, Trash2, X } from 'lucide-react';
import { apiUrl, getApiErrorMessage, readApiResponse } from '../lib/api';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [wishes, setWishes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadWishes = useCallback(async (adminToken) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(apiUrl('/api/admin/wishes'), {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await readApiResponse(response);
      setWishes(data.wishes);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await axios.post(
        apiUrl('/api/admin/login'),
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = await readApiResponse(response);
      setToken(data.token);
      setPassword('');
      setNotice('');
      await loadWishes(data.token);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const review = async (id, status) => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const response = await axios.patch(
        apiUrl(`/api/admin/wishes/${id}`),
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await readApiResponse(response);
      setWishes((current) => current.filter((wish) => wish._id !== id));
      setNotice(data.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const deleteWish = async (wish) => {
    if (!window.confirm(`Permanently delete the video wish from ${wish.name}?`)) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const response = await axios.delete(apiUrl(`/api/admin/wishes/${wish._id}`), {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await readApiResponse(response);
      setWishes((current) => current.filter((item) => item._id !== wish._id));
      setNotice(data.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-12 text-purple-100">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="text-sm text-purple-300 hover:text-purple-100">
          Birthday page
        </Link>

        {!token ? (
          <section className="mx-auto mt-16 max-w-md rounded-2xl border border-purple-500/30 bg-slate-950/85 p-7 shadow-xl">
            <h1 className="font-display text-3xl font-semibold">Admin login</h1>
            <p className="mt-2 text-sm text-purple-200/65">
              Sign in to review and approve video wishes.
            </p>
            <form onSubmit={login} className="mt-6 space-y-4">
              <label className="block space-y-2 text-sm">
                <span>Username</span>
                <input
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-lg border border-purple-500/30 bg-slate-900/70 px-4 py-3 outline-none focus:border-purple-300"
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span>Password</span>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-purple-500/30 bg-slate-900/70 px-4 py-3 outline-none focus:border-purple-300"
                />
              </label>
              {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-3 font-medium text-slate-950 disabled:opacity-60"
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </section>
        ) : (
          <section className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-semibold">Video wishes</h1>
                <p className="mt-2 text-sm text-purple-200/65">
                  Review, approve, or permanently delete video wishes.
                </p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => loadWishes(token)}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 px-4 py-2 text-sm hover:bg-purple-500/10 disabled:opacity-50"
              >
                <RefreshCw size={15} /> Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  setToken('');
                  setWishes([]);
                  setNotice('');
                  setError('');
                }}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 px-4 py-2 text-sm hover:bg-purple-500/10"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>

            {error && <p role="alert" className="mt-6 text-sm text-red-300">{error}</p>}
            {notice && <p role="status" className="mt-6 text-sm text-green-300">{notice}</p>}
            {loading && <p className="mt-8 text-sm text-purple-200/65">Loading submissions…</p>}
            {!loading && !error && wishes.length === 0 && (
              <p className="mt-8 text-sm text-purple-200/65">No video wishes yet.</p>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {wishes.map((wish) => (
                <article
                  key={wish._id}
                  className="overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-950/80"
                >
                  <video
                    src={wish.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full bg-slate-900"
                    aria-label={`Pending video wish from ${wish.name}`}
                  />
                  <div className="p-5">
                    <h2 className="font-display text-lg font-semibold">{wish.name}</h2>
                    <p className="mt-2 text-sm text-purple-200/70">{wish.message}</p>
                    <p className="mt-2 text-xs text-purple-300/50">
                      {wish.status} · {new Date(wish.createdAt).toLocaleString()} · {wish.durationSeconds.toFixed(1)} sec
                    </p>
                    <div className="mt-5 flex gap-3">
                      {wish.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => review(wish._id, 'approved')}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-400/15 px-4 py-2 text-sm text-green-200 hover:bg-green-400/25 disabled:opacity-50"
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => review(wish._id, 'rejected')}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-400/15 px-4 py-2 text-sm text-red-200 hover:bg-red-400/25 disabled:opacity-50"
                          >
                            <X size={16} /> Reject
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteWish(wish)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-200 hover:bg-red-400/15 disabled:opacity-50"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
