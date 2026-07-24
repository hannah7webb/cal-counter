export function SetupRequired() {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-800">Supabase setup needed</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This app needs a Supabase project before sign-in will work. Copy{' '}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">.env.local.example</code>{' '}
          to <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">.env.local</code>, fill
          in your project URL and anon key, then restart the dev server.
        </p>
        <p className="mt-3 text-sm text-neutral-500">
          See <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">SETUP.md</code> for the
          full walkthrough (creating the project, running the database schema).
        </p>
      </div>
    </div>
  );
}
