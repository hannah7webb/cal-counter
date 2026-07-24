# Setup: Supabase auth + data

This app uses [Supabase](https://supabase.com) for accounts (email +
password) and as the database for each user's food items, day entries, and
goals. Without a configured project, the app shows a "Supabase setup
needed" screen.

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → sign in → **New Project**. Pick
an org, name it, set a database password (save it), pick a region, and
create. Provisioning takes a minute or two.

## 2. Add your credentials

**Project Settings → API** → copy the **Project URL** and the **anon
public** key.

```
cp .env.local.example .env.local
```

Fill in the two values in `.env.local`, then (re)start the dev server —
Vite only reads env vars at startup.

## 3. Create the database tables

**SQL Editor → New query**, paste the full contents of
[`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This
creates `food_items`, `day_entries`, and `goals`, all with row-level
security so a user can only ever read or write their own rows.

New accounts start with an empty food library — there's no seed/demo data
server-side, since this is now a real per-user database rather than a local
demo.

## 4. Enable email sign-in

**Authentication → Providers → Email** should already be on by default.
Password reset uses Supabase's built-in email flow — no extra setup
required. You can customize the reset email's subject/body under
**Authentication → Email Templates → Reset Password** if you want.

By default new signups require clicking a confirmation link before they
can sign in. If you'd rather they get in immediately, turn off **Confirm
email** under **Authentication → Providers → Email**.

## 5. Set the site URL

**Authentication → URL Configuration** → set **Site URL** to
`http://localhost:5173` for local dev. Add your production domain there
too once you deploy (both the Site URL and, if different, an entry under
**Redirect URLs**) — this is what the "forgot password" reset link uses to
send people back to the right place.

## That's it

Once `.env.local` is filled in and the schema has been run, reload the
app — you should see the sign-in screen. Entering an email and continuing
either signs you in (existing account) or creates one (new email), with a
confirmation email if that's enabled.
