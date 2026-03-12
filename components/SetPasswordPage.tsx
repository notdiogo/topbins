import React, { useState } from 'react';

interface SetPasswordPageProps {
  onSetPassword: (password: string) => Promise<string | null>;
}

export const SetPasswordPage: React.FC<SetPasswordPageProps> = ({ onSetPassword }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const err = await onSetPassword(password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif font-bold text-3xl text-ink tracking-tight">TopBins ⚽</h1>
          <p className="text-muted text-sm mt-1">Create your password</p>
        </div>

        <div className="bg-beige border border-warm-border rounded-lg p-8 shadow-sm">
          <p className="text-sm text-muted mb-5">
            You've been invited. Set a password to activate your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                minLength={8}
                className="w-full bg-parchment border border-warm-border rounded px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-forest/50"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full bg-parchment border border-warm-border rounded px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-forest/50"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-parchment text-sm font-semibold py-2.5 rounded hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting password…' : 'Set password & enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
