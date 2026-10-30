import { FormEvent, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  KeyRound,
  Save,
  Loader2,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

type Role = 'SUPER' | 'EDITOR' | 'BOOKING';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

const ROLE_META: Record<Role, { label: string; color: string }> = {
  SUPER: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  EDITOR: { label: 'Content Editor', color: 'bg-blue-100 text-blue-800' },
  BOOKING: { label: 'Booking Manager', color: 'bg-green-100 text-green-800' },
};

export default function UsersManagePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2500);
  };

  /* ---- Actions ---- */
  const toggleActive = async (user: AdminUser) => {
    setError('');
    try {
      await api.patch(`/admin/users/${user.id}`, {
        isActive: !user.isActive,
      });
      refresh();
      showNotice(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not update user.');
    }
  };

  const remove = async (user: AdminUser) => {
    if (!window.confirm(`Delete ${user.name} permanently?`)) return;
    setError('');
    try {
      await api.delete(`/admin/users/${user.id}`);
      refresh();
      showNotice('User deleted');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete user.');
    }
  };

  /* ---- Filter ---- */
  const filtered = (users ?? []).filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      ROLE_META[u.role].label.toLowerCase().includes(q)
    );
  });

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <Skeleton className="h-9 w-48 mb-2 rounded" />
        <Skeleton className="h-4 w-72 mb-8 rounded" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">
            Admin Users
          </h1>
          <p className="text-sm text-neutral-mid mt-1">
            Manage admin accounts, roles, and access.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm('create');
          }}
          className="btn-primary text-sm"
        >
          <Plus size={16} /> Add user
        </button>
      </div>

      {/* TOASTS */}
      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-input bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={16} className="text-green-600" />
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-input bg-red-50 px-4 py-3 text-sm text-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* SEARCH */}
      <div className="relative mb-4 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid"
        />
        <input
          type="text"
          placeholder="Search by name, email, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-mid hover:text-neutral-dark"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b bg-neutral-light">
            <tr>
              {['User', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <UserIcon
                    className="mx-auto text-neutral-mid mb-2"
                    size={32}
                  />
                  <p className="text-neutral-mid">
                    {search ? 'No users match your search.' : 'No admin users yet.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const roleMeta = ROLE_META[user.role];
                return (
                  <tr
                    key={user.id}
                    className="border-b border-neutral-light last:border-0 hover:bg-neutral-light/40"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-dark">
                            {user.name}
                          </p>
                          <p className="text-xs text-neutral-mid flex items-center gap-1">
                            <Mail size={10} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${roleMeta.color}`}
                      >
                        {user.role === 'SUPER' && <ShieldCheck size={10} />}
                        {roleMeta.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(user)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.isActive ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-xs text-neutral-mid">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditing(user);
                            setShowForm('edit');
                          }}
                          className="p-1.5 rounded-button text-primary hover:bg-primary/10"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setResetPasswordId(user.id)}
                          className="p-1.5 rounded-button text-neutral-mid hover:bg-neutral-light"
                          title="Reset password"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => remove(user)}
                          className="p-1.5 rounded-button text-error hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-neutral-mid">
        Showing {filtered.length} of {users?.length ?? 0} users
      </p>

      {/* MODAL: Create / Edit */}
      {showForm && (
        <UserFormModal
          mode={showForm}
          user={editing}
          onClose={() => {
            setShowForm(null);
            setEditing(null);
          }}
          onSuccess={(msg) => {
            refresh();
            showNotice(msg);
            setShowForm(null);
            setEditing(null);
          }}
        />
      )}

      {/* MODAL: Reset password */}
      {resetPasswordId && (
        <ResetPasswordModal
          userId={resetPasswordId}
          onClose={() => setResetPasswordId(null)}
          onSuccess={() => {
            setResetPasswordId(null);
            showNotice('Password updated');
          }}
        />
      )}
    </div>
  );
}

/* -------------------- User Form Modal -------------------- */
function UserFormModal({
  mode,
  user,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(user?.role ?? 'EDITOR');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (mode === 'create') {
        await api.post('/admin/users', { name, email, password, role });
        onSuccess('User created');
      } else if (user) {
        await api.patch(`/admin/users/${user.id}`, { name, role });
        onSuccess('User updated');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save user.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-modal max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-light px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-mid uppercase tracking-wide">
              {mode === 'create' ? 'New user' : 'Edit user'}
            </p>
            <h2 className="font-heading font-bold text-primary">
              {mode === 'create' ? 'Add admin user' : user?.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-button hover:bg-neutral-light"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-input bg-red-50 p-3 text-sm text-error">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="label">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="input"
              placeholder="Full name"
            />
          </div>

          {mode === 'create' && (
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="user@aikbukak.com"
              />
            </div>
          )}

          {mode === 'create' && (
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input"
                placeholder="Minimum 6 characters"
              />
            </div>
          )}

          <div>
            <label className="label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="input"
            >
              <option value="EDITOR">Content Editor</option>
              <option value="BOOKING">Booking Manager</option>
              <option value="SUPER">Super Admin</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Saving…
                </>
              ) : (
                <>
                  <Save size={16} /> {mode === 'create' ? 'Create user' : 'Save'}
                </>
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------- Reset Password Modal -------------------- */
function ResetPasswordModal({
  userId,
  onClose,
  onSuccess,
}: {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.patch(`/admin/users/${userId}/password`, { password });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not reset password.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-modal max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-light px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-primary">
            Reset password
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-button hover:bg-neutral-light"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-error bg-red-50 p-3 rounded-input">
              {error}
            </p>
          )}
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input"
              placeholder="Minimum 6 characters"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Saving…
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Update
                </>
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
