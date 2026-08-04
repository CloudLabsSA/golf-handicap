# Quick Start Guide

## 1. Local Development (Optional)

Test locally before deploying to Vercel:

```bash
# Install dependencies
npm install

# Ensure you have .env.local with:
# POSTGRES_PRISMA_URL= (from Neon or Vercel Postgres)
# RESEND_API_KEY= (from Resend)
# JWT_SECRET= (any random string)

# Run migrations
npm run db:push

# Start dev server
npm run dev

# Visit http://localhost:3000
```

## 2. Deploy to Vercel

### Option A: Connect GitHub (Recommended)

1. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/golf-handicap.git
git branch -M main
git push -u origin main
```

2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Select your GitHub repository
5. Click "Deploy"

### Option B: Deploy with Vercel CLI

```bash
vercel
```

## 3. Add Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

**Required:**
- `POSTGRES_PRISMA_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - From Resend (https://resend.com/api-keys)
- `JWT_SECRET` - Generate: `openssl rand -hex 32`
- `NEXT_PUBLIC_APP_URL` - Your Vercel project URL

**Optional:**
- `GOLF_COURSE_API_KEY` - From GolfCourseAPI (for course search)

## 4. Database Setup

### Using Vercel + Neon (Easiest)

1. In Vercel Dashboard → Integrations
2. Search for "Neon"
3. Connect and authorize
4. This adds `POSTGRES_PRISMA_URL` automatically
5. Run: `npm run db:push` (or via Vercel CLI)

### Using Existing Database

1. Get PostgreSQL connection string
2. Add to Vercel as `POSTGRES_PRISMA_URL`
3. Run: `npm run db:push`

## 5. Email Setup

1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Add to Vercel as `RESEND_API_KEY`

Note: Free tier can only send from `noreply@resend.com`

## 6. Test It Out

1. Visit your Vercel deployment URL
2. Click "Sign In"
3. Enter your email
4. Check your email for login link
5. Click the link to sign in
6. Add a golf round to test!

## 7. (Optional) Custom Domain

In Vercel Dashboard → Settings → Domains:
1. Add your custom domain
2. Follow DNS configuration steps

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Database migration fails
```bash
npm run db:push
```

### Can't receive login emails
- Check Resend API key is correct
- Check Resend account is verified
- Check spam folder
- For production email, verify domain in Resend

### App won't start
- Check all environment variables are set
- Verify PostgreSQL connection string is valid
- Check build logs in Vercel Dashboard

## Next Steps

- Add your golf courses
- Record some rounds
- Check out the players leaderboard
- Invite friends!

See [SETUP.md](./SETUP.md) for detailed configuration options.
