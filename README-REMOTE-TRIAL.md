# Remote Trial Setup

This tracker now supports two modes:

1. Local demo mode
2. Shared remote trial mode with Supabase

## 1. Create the Supabase project

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run the SQL in `supabase/schema.sql`.

## 2. Add invited team emails

For each trial participant:

1. Insert the user's email, name, role, and client scope into `public.access_invites`.
2. Send the hosted app URL to that person.
3. When they sign in with the same email, Supabase Auth creates the auth user and the database trigger automatically creates the matching `public.profiles` row.

You can start from `supabase/seed-example.sql` and replace the placeholder emails with your real trial emails.

Example:

```sql
insert into public.access_invites (email, full_name, role, client_name)
values
  ('rich@example.com', 'Richard', 'admin', null),
  ('lead@example.com', 'Team Lead', 'manager', null),
  ('client@example.com', 'Acme Client Contact', 'client', 'Acme Client')
on conflict (email) do update
set full_name = excluded.full_name,
    role = excluded.role,
    client_name = excluded.client_name;
```

## 3. Configure the app

1. Copy `config.example.js` to `config.js`.
2. Fill in:
   - `supabaseUrl`
   - `supabaseAnonKey`
   - `appUrl`

`appUrl` must match the actual hosted URL you will send to the team.

## 4. Host the app

Because this app is static HTML and browser JavaScript, you can host it on:

- Netlify
- Vercel
- Cloudflare Pages
- GitHub Pages
- Any static web host

### Recommended quickest path: Netlify

1. Push this folder to GitHub or upload it directly to Netlify.
2. In Netlify, create a new site from the repo.
3. Publish directory: `.`
4. Build command: leave blank, or use the default from `netlify.toml`.
5. Make sure your final `config.js` is included in the published files.

This repo already includes `netlify.toml` for static hosting.

### Vercel fallback

If you prefer Vercel, this repo also includes `vercel.json`.
Use it as a static deployment with the project root as the published content.

Upload these files/folders:

- `index.html`
- `config.js`
- `src/browser-app.jsx`
- any other project assets used by the page

For a quick static host, the important thing is that `index.html` and `config.js` are served from the same root URL.

## 5. Trial sign-in flow

1. Team members open the hosted URL.
2. They enter their invited email.
3. The app sends a magic link through Supabase Auth.
4. On first sign-in, the backend auto-creates the user's `profiles` row from `access_invites`.
5. The app reads the user's role and client scope from `profiles`.

## 5a. Supabase Auth settings

In Supabase Authentication settings:

1. Enable email login and magic links.
2. Add your final hosted URL to the site URL setting.
3. Add the same domain to redirect URLs.

Example:

- Site URL: `https://your-team-tracker.netlify.app`
- Redirect URL: `https://your-team-tracker.netlify.app`

## 6. Recommended pilot roles

- 1 admin
- 1 manager
- 1 or 2 client-view users

## 7. Trial monitoring

The schema includes:

- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

That gives you a clean activity trail during the trial period.

## 8. Important note

If `config.js` is empty, the app stays in local demo mode.

## 9. Minimum launch checklist

Before sending the link to your team, confirm:

- `schema.sql` has been run
- `access_invites` rows exist for every trial user
- `config.js` has the real Supabase values
- Supabase Auth site URL and redirect URL match the hosted URL
- the hosted page opens and sends a magic link successfully
