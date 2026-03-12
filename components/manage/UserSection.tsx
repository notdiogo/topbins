import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export const UserSection: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    if (!supabaseAdmin) { setLoadError('Service role key not configured (VITE_SUPABASE_SERVICE_ROLE_KEY).'); return; }
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) { setLoadError(error.message); return; }
    setUsers(
      data.users.map((u) => ({
        id: u.id,
        email: u.email ?? '(no email)',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
      }))
    );
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    if (!supabaseAdmin) { setCreateError('Service role key not configured.'); return; }
    setCreating(true);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });
    setCreating(false);
    if (error) { setCreateError(error.message); return; }
    setCreateSuccess(`Created ${data.user.email} — they can now sign in with those credentials.`);
    setEmail('');
    setPassword('');
    load();
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (!supabaseAdmin) return;
    if (!confirm(`Delete ${userEmail}? This cannot be undone.`)) return;
    setDeletingId(id);
    await supabaseAdmin.auth.admin.deleteUser(id);
    setDeletingId(null);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* User list */}
      <div>
        <h2 className="font-serif font-bold text-lg text-ink mb-3">Members</h2>
        {loadError && <p className="text-xs text-red-600 mb-3">{loadError}</p>}
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between px-4 py-3 bg-beige border border-warm-border rounded"
            >
              <div>
                <p className="text-sm font-medium text-ink">{u.email}</p>
                <p className="text-xs text-muted">
                  Last sign-in: {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'never'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(u.id, u.email)}
                disabled={deletingId === u.id}
                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 ml-4 shrink-0"
              >
                {deletingId === u.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          ))}
          {users.length === 0 && !loadError && (
            <p className="text-muted text-sm py-4">No users yet.</p>
          )}
        </div>
      </div>

      {/* Create form */}
      <div className="bg-beige border border-warm-border rounded-lg p-6">
        <h2 className="font-serif font-bold text-lg text-ink mb-1">Add member</h2>
        <p className="text-xs text-muted mb-5">Create an account and share the credentials with your friend.</p>

        {createError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{createError}</p>
        )}
        {createSuccess && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">{createSuccess}</p>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-parchment border border-warm-border rounded px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-forest/50"
              placeholder="friend@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-parchment border border-warm-border rounded px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-forest/50"
              placeholder="Choose something they'll remember"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-forest text-parchment text-sm font-semibold py-2.5 rounded hover:bg-forest/90 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};
