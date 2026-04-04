# Cervio — AI Chief of Staff

> Think sharper. Decide faster. Lead better.

Built by Morphotech

---

## Stack

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL + Auth)
- **AI:** Anthropic Claude API (Haiku + Sonnet)
- **Payments:** Stripe
- **Deployment:** Vercel

---

## Features

1. **Daily Briefing** — AI-generated personalised morning briefing
2. **Decision Support** — Structured analysis with options and recommendation
3. **Meeting Prep** — AI briefs for any meeting
4. **Goal Tracking** — Progress tracking with AI check-ins

---

## Setup Instructions

### 1. Clone and install

```bash
git clone https://github.com/your-org/cervio.git
cd cervio
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `ANTHROPIC_API_KEY` — Get from console.anthropic.com
- `STRIPE_SECRET_KEY` — From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` — From Stripe webhook settings
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `STRIPE_SOLO_PRICE_ID` — Create $49/month price in Stripe
- `STRIPE_PRO_PRICE_ID` — Create $99/month price in Stripe
- `STRIPE_TEAM_PRICE_ID` — Create $299/month price in Stripe

### 3. Database setup

In your Supabase project, go to SQL Editor and run:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, RLS policies, and triggers.

### 4. Supabase Auth setup

In Supabase dashboard:
- Enable Email auth provider
- Enable Google OAuth provider
- Add your domain to allowed redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`

### 5. Stripe setup

1. Create products and prices in Stripe dashboard:
   - Solo: $49/month recurring
   - Pro: $99/month recurring
   - Team: $299/month recurring
2. Copy price IDs to `.env.local`
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 6. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or use: vercel env add
```

Deploy to production:
```bash
vercel --prod
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── middleware.ts               # Auth middleware
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts       # OAuth callback
│   ├── onboarding/page.tsx         # User setup flow
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar layout
│   │   ├── page.tsx                # Main dashboard + briefing
│   │   ├── decisions/
│   │   │   ├── page.tsx            # Decisions list
│   │   │   └── new/page.tsx        # Create + analyse decision
│   │   ├── meetings/page.tsx       # Meeting prep
│   │   ├── goals/page.tsx          # Goal management
│   │   └── settings/page.tsx       # Account + billing
│   └── api/
│       ├── briefing/generate/      # Generate daily briefing
│       ├── decisions/analyse/      # Analyse decision
│       ├── meetings/prep/          # Generate meeting brief
│       ├── goals/checkin/          # Weekly goal check-in
│       ├── billing/checkout/       # Stripe checkout
│       ├── billing/portal/         # Stripe billing portal
│       └── webhooks/stripe/        # Stripe webhook handler
├── lib/
│   ├── supabase.ts                 # Supabase client + types
│   ├── ai.ts                       # Claude AI engine
│   ├── stripe.ts                   # Stripe configuration
│   └── utils.ts                    # Utility functions
├── components/
│   └── features/
│       └── AuthForm.tsx            # Reusable auth form
└── styles/
    └── globals.css                 # Global styles + Tailwind
```

---

## AI Cost Management

Cervio uses two Claude models:
- **Haiku** (`claude-haiku-4-5-20251001`) — Fast, cheap. Used for: daily briefings, meeting prep, goal check-ins
- **Sonnet** (`claude-sonnet-4-6`) — More capable. Used for: decision analysis (complex reasoning)

Approximate cost per interaction:
- Daily briefing: ~$0.001
- Decision analysis: ~$0.01
- Meeting prep: ~$0.001
- Goal check-in: ~$0.001

At 200 users with avg 5 interactions/day:
- Monthly AI cost: ~$200–400
- Monthly revenue at $75 avg ARPU: ~$15,000
- **AI cost = ~2% of revenue**

---

## Expansion Roadmap (Phase 3)

- [ ] Enhanced memory engine (vector search with Pinecone)
- [ ] Team features (multi-user, shared goals)
- [ ] Google Calendar integration (auto-meeting prep)
- [ ] Slack integration (briefing delivery to Slack)
- [ ] iOS mobile app (React Native)
- [ ] Enterprise API + white-label

---

## Contact

**Freddy Elturk** — freddy.elturk@morphotech.com
**Morphotech** — morphotech.com
