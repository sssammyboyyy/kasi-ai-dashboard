# Directive: Deploy to Vercel

**Goal**: Deploy the Next.js SaaS Platform to Vercel for production usage.

**Inputs**:
- GitHub Repository (pushed with latest changes).
- Vercel Account (Free or Pro).
- Supabase Project URL (`NEXT_PUBLIC_SUPABASE_URL`) & Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**Steps**:
1. **Push to GitHub**: Ensure all changes (folders, schema) are committed and pushed.
   - `git push origin main`
2. **Import in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import `kasi-ai-dashboard`.
   - Framework Preset: `Next.js`.
   - Root Directory: `./` (default).
3. **Configure Environment Variables**:
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (Ensure specific Environment is checked: Production, Preview, Development).
4. **Deploy**: Click "Deploy".
5. **Verify**: Open the deployment URL. Visit `/login` to test the new Auth route.

**Edge Cases**:
- Build Fails: Check `package.json` scripts (`build`). Ensure `@supabase/ssr` is installed.
- Auth Fails: Check Environment Variables in Vercel Settings.

**Output**:
- Live Production URL (e.g., `kasi-ai-dashboard.vercel.app`).
