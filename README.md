# Golf Handicap Tracker

A Progressive Web App (PWA) for tracking golf scores in South Africa and calculating handicaps using SAGA rules.

## Features

- 📊 Track golf rounds and scores
- 🏌️ Automatic SAGA-compliant handicap calculation
- 👥 View other players' handicaps and rounds
- 📱 Progressive Web App (installable on mobile)
- 🔐 Magic link authentication via email
- 🌍 Course database integration with GolfCourseAPI

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Neon PostgreSQL via Vercel Postgres
- **ORM**: Drizzle ORM
- **Auth**: Magic link (JWT tokens)
- **Email**: Resend
- **Styling**: Tailwind CSS

## Setup

### Prerequisites

- Node.js 18+
- Neon Database account
- Resend account
- GolfCourseAPI key (optional, for course data)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd golf-handicap
npm install
```

2. Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```

3. Fill in your environment variables:
```env
# From Vercel Postgres/Neon
POSTGRES_PRISMA_URL=postgres://...

# From Resend
RESEND_API_KEY=re_...

# Generate a random secret
JWT_SECRET=your-random-secret-key

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: GolfCourseAPI key
GOLF_COURSE_API_KEY=...
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Setup on Vercel

1. Go to your Vercel project
2. Add Neon PostgreSQL via the integrations marketplace
3. The `POSTGRES_PRISMA_URL` will be automatically added to your environment

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio for data management

## API Routes

- `POST /api/auth/request` - Request magic link
- `GET /api/auth/callback` - Handle magic link callback
- `POST /api/auth/logout` - Sign out
- `GET /api/me` - Get current user
- `GET /api/users/[email]` - Get user profile and handicap
- `GET/POST /api/rounds` - Get/create golf rounds
- `GET /api/courses/search` - Search golf courses

## Handicap Calculation

The app calculates handicaps using SAGA rules:

1. Takes the best 8 scores from your last 20 rounds
2. Calculates score differentials
3. Averages the best differentials
4. Applies 96% factor for final index

Currently simplified to not require slope rating (can be added later).

## Deployment

Deploy to Vercel:

```bash
vercel
```

Ensure environment variables are set in Vercel project settings.

## Future Features

- [ ] Slope rating integration
- [ ] Tournament mode
- [ ] Statistics and analytics
- [ ] Player leaderboards
- [ ] Course statistics
- [ ] Mobile app (React Native)
- [ ] Offline sync

## License

MIT
