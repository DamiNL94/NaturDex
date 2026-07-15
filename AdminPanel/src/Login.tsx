// ================================================================================================
// Login.tsx — pantalla de acceso del panel (reutiliza auth.php, igual que el panel clásico).
// La autoridad real la comprueba siempre el servidor: admin.php exige role='admin'.
// ================================================================================================
import { useState, type FormEvent } from 'react';
import { api } from './api';

interface Props {
  /** Mensaje del servidor cuando hay sesión pero la cuenta no es de administrador (403). */
  forbiddenMsg: string | null;
  /** Se llama tras el login para volver a pedir el overview. */
  onDone: () => void;
}

export default function Login({ forbiddenMsg, onDone }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(forbiddenMsg);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api('/auth.php?action=login', { email: email.trim(), password });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-950 to-stone-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <p className="text-xs font-bold tracking-widest text-emerald-700 uppercase">NaturDex</p>
        <h1 className="mt-1 text-2xl font-extrabold text-stone-900">Administración</h1>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <label className="block text-sm font-semibold text-stone-700">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </label>
          <label className="block text-sm font-semibold text-stone-700">
            Contraseña
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </label>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <a href="/Frontend/index.html" className="mt-5 block text-center text-sm text-stone-500 hover:text-emerald-700">
          ← Volver a NaturDex
        </a>
      </div>
    </div>
  );
}
