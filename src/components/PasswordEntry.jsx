import axios from 'axios';
import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { apiUrl, getApiErrorMessage } from '../lib/api';

const pageDetails = {
  birthday: {
    title: 'Amritha’s celebration page',
    description: 'Enter the birthday password to open her celebration.',
    button: 'Open celebration',
  },
  wish: {
    title: 'Send a video birthday wish',
    description: 'Enter the video-wish password to record and send your wish.',
    button: 'Continue to video wishes',
  },
};

export default function PasswordEntry({ page, onAccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const details = pageDetails[page];

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const response = await axios.post(apiUrl('/api/access/verify'), { page, password });
      const data = response.data;
      if (!data.token) throw new Error('The API response did not include an access token.');
      setPassword('');
      onAccess(data.token);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Cannot reach the password service. Start the backend and configure server/.env.'
          : getApiErrorMessage(requestError)
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-purple-500/25 bg-slate-950/75 p-5 shadow-xl backdrop-blur-md sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15 text-purple-300">
          <KeyRound size={18} />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-purple-100">{details.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-purple-200/60">{details.description}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <label htmlFor={`${page}-password`} className="sr-only">
          Password for {details.title}
        </label>
        <input
          id={`${page}-password`}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          maxLength={256}
          placeholder="Enter password"
          className="w-full rounded-lg border border-purple-500/30 bg-slate-900/70 px-4 py-3 text-purple-100 outline-none placeholder:text-purple-300/35 focus:border-purple-300"
        />
        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-3 font-medium text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? 'Checking password…' : details.button}
        </button>
      </form>

    </section>
  );
}
