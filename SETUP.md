# Setup Guide: Golf Handicap Tracker

This guide will walk you through setting up the Golf Handicap Tracker on Vercel with all required integrations.

## Prerequisites

- GitHub account
- Vercel account (connected to GitHub)
- Resend account (free tier available)
- (Optional) GolfCourseAPI account

## Step 1: Push to GitHub

First, push this repository to GitHub:

```bash
git remote add origin https://github.com/yourusername/golf-handicap.git
git branch -M main
git push -u origin main
```

## Step 2: Connect Neon Database on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. In the "Environment Variables" section, click "Add Integration"
5. Find and click "Neon"
6. Authorize Neon and select your project
7. This will automatically add `POSTGRES_PRISMA_URL` to your environment variables

Alternative: If you want to use an existing Neon database:
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new database or use existing
3. Copy the connection string (starts with `postgresql://`)
4. In Vercel project settings, add `POSTGRES_PRISMA_URL` with this value

## Step 3: Set Up Resend

1. Go to [Resend Console](https://resend.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)
6. In Vercel project settings:
   - Go to Settings → Environment Variables
   - Add new variable: `RESEND_API_KEY` = your Resend API key

## Step 4: Configure JWT Secret

In Vercel project settings:
- Go to Settings → Environment Variables
- Add new variable: `JWT_SECRET` = (generate a random string, e.g., `openssl rand -hex 32`)

## Step 5: Set App URL

In Vercel project settings:
- Add new variable: `NEXT_PUBLIC_APP_URL` = `https://your-project-name.vercel.app`

## Step 6: (Optional) Golf Course API

To enable course data search:

1. Go to [GolfCourseAPI](https://golfcourseapi.com) and sign up
2. Get your API key
3. In Vercel project settings:
   - Add new variable: `GOLF_COURSE_API_KEY` = your API key

If you skip this, users can still manually add courses.

## Step 7: Deploy

Once all environment variables are set:

```bash
git push origin main
```

Vercel will automatically deploy. You can watch the build in your Vercel dashboard.

## Step 8: Initialize Database

After the first deployment:

1. Go to your Vercel project's deployment
2. In the terminal/logs, run the database migration:
   ```bash
   npm run db:push
   ```

Or from your local machine (if connected to Vercel CLI):
```bash
vercel env pull
npm run db:push
```

## Troubleshooting

### "Missing POSTGRES_PRISMA_URL"
- Make sure the Neon integration was added to Vercel
- Check in Vercel Settings → Environment Variables that `POSTGRES_PRISMA_URL` exists

### "Resend API error"
- Verify your `RESEND_API_KEY` is correct (should start with `re_`)
- Check that your Resend account is active
- Verify sender email is configured in Resend (free tier limited to accounts@resend.com)

### "JWT token verification failed"
- Make sure `JWT_SECRET` is set and consistent across all environments
- Try regenerating: `openssl rand -hex 32`

## Local Development

To test locally before pushing:

1. Copy environment variables:
   ```bash
   vercel env pull .env.local
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run database migrations:
   ```bash
   npm run db:push
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Configuring Resend for Production

By default, Resend free tier can only send from `noreply@resend.com`. To send from a custom domain:

1. Verify your domain in Resend Console
2. Update the `from` email in `/app/api/auth/request/route.ts`

## Database Schema

The app uses these tables:
- `users` - Player profiles
- `rounds` - Individual golf rounds with scores
- `courses` - Golf course data
- `authTokens` - Magic link tokens for email auth

Schema is defined in `/lib/db/schema.ts`

## Next Steps

- Test the login flow with your email
- Add your first golf round
- Browse other players' handicaps
- Start tracking your scores!

## Support

For issues:
1. Check Vercel build logs
2. Check browser console for client-side errors
3. Check Resend email delivery status
4. Verify all environment variables are set

Good luck! 🏌️
