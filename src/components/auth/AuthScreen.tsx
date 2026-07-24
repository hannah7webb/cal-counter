import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type Step = 'email' | 'password' | 'check-email' | 'reset-sent';

export function AuthScreen() {
  const {
    isPasswordRecovery,
    signInOrSignUpWithPassword,
    sendPasswordReset,
    updatePassword,
    cancelPasswordRecovery,
  } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isPasswordRecovery) {
    return <ResetPasswordCard onSubmit={updatePassword} onCancel={cancelPasswordRecovery} />;
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setStep('password');
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setError('');
    setSubmitting(true);
    const result = await signInOrSignUpWithPassword(email.trim(), password);
    setSubmitting(false);
    if (result.status === 'error') {
      setError(result.message);
    } else if (result.status === 'check-email') {
      setStep('check-email');
    }
    // 'signed-in' needs no further action here — the session change re-renders the app.
  }

  async function handleForgotPassword() {
    if (!email.trim()) return;
    setError('');
    setSubmitting(true);
    const { error: resetError } = await sendPasswordReset(email.trim());
    setSubmitting(false);
    if (resetError) {
      setError(resetError);
    } else {
      setStep('reset-sent');
    }
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
      {step === 'email' && (
        <>
          <h1 className="text-lg font-semibold text-neutral-800">Sign in</h1>

          <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-2">
            <label htmlFor="auth-email" className="text-xs text-neutral-500">
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              type="submit"
              className="mt-2 rounded-md bg-accent py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-neutral-500">
            Don&apos;t have an account? Continuing above will create one for you!
          </p>
        </>
      )}

      {step === 'password' && (
        <>
          <button
            type="button"
            onClick={() => {
              setStep('email');
              setPassword('');
              setError('');
            }}
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            &larr; Back
          </button>
          <h1 className="mt-2 text-lg font-semibold text-neutral-800">Enter your password</h1>
          <p className="mt-1 text-xs text-neutral-500 truncate">{email}</p>

          <form onSubmit={handlePasswordSubmit} className="mt-4 flex flex-col gap-2">
            <label htmlFor="auth-password" className="text-xs text-neutral-500">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-md bg-accent py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? 'Please wait…' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={submitting}
              className="mt-1 text-xs text-neutral-500 hover:text-accent self-center"
            >
              Forgot password?
            </button>
          </form>
        </>
      )}

      {step === 'check-email' && (
        <div className="text-center">
          <h1 className="text-lg font-semibold text-neutral-800">Check your email</h1>
          <p className="mt-2 text-sm text-neutral-500">
            We sent a confirmation link to <span className="font-medium">{email}</span>. Click it
            to finish creating your account.
          </p>
        </div>
      )}

      {step === 'reset-sent' && (
        <div className="text-center">
          <h1 className="text-lg font-semibold text-neutral-800">Check your email</h1>
          <p className="mt-2 text-sm text-neutral-500">
            We sent a password reset link to <span className="font-medium">{email}</span>.
          </p>
          <button
            type="button"
            onClick={() => setStep('password')}
            className="mt-4 text-xs text-neutral-500 hover:text-accent"
          >
            &larr; Back to sign in
          </button>
        </div>
      )}
    </div>
  );
}

function ResetPasswordCard({
  onSubmit,
  onCancel,
}: {
  onSubmit: (password: string) => Promise<{ error: string | null }>;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    const { error: updateError } = await onSubmit(password);
    setSubmitting(false);
    if (updateError) {
      setError(updateError);
    } else {
      setDone(true);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
      {done ? (
        <div className="text-center">
          <h1 className="text-lg font-semibold text-neutral-800">Password updated</h1>
          <p className="mt-2 text-sm text-neutral-500">You&apos;re all set.</p>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-semibold text-neutral-800">Set a new password</h1>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
            <label htmlFor="new-password" className="text-xs text-neutral-500">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-md bg-accent py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? 'Please wait…' : 'Save password'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-1 text-xs text-neutral-500 hover:text-neutral-700 self-center"
            >
              Cancel
            </button>
          </form>
        </>
      )}
    </div>
  );
}
