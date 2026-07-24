import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function AccountMenu() {
  const { session, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const email = session?.user.email ?? '';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent hover:opacity-80 transition-opacity"
        aria-label="Account menu"
      >
        {email.charAt(0).toUpperCase() || '?'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
            <p className="truncate text-xs text-neutral-500">{email}</p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="mt-2 w-full rounded-md border border-neutral-200 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
