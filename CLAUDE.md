# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Next.js (using Turbo mode)
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Docker Commands
- `npm run docker:up` - Start all services with Docker Compose
- `npm run docker:down` - Stop Docker Compose services
- `npm run docker:logs` - View Docker Compose logs
- `npm run docker:db` - Start only the PostgreSQL database service

### Database Commands
- `npm run db:migrate` - Run Prisma migrations in development
- `npm run db:reset` - Reset database and run migrations
- `npm run db:studio` - Open Prisma Studio for database inspection
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Run all database seeds
- `npm run db:seed:users` - Seed only users
- `npm run db:seed:posts` - Seed only posts
- `npm run db:seed:follows` - Seed only follow relationships
- `npm run db:seed:likes` - Seed only likes

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and React Server Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: AWS Cognito with Amplify
- **Maps**: Google Maps JavaScript API
- **Styling**: Tailwind CSS + Material-UI components
- **Language**: TypeScript

### Database Schema
The application uses 4 main models:
- **User**: Basic user information with email, name, iconUrl
- **Post**: Location-based posts with latitude/longitude coordinates
- **Like**: Many-to-many relationship between users and posts
- **Follow**: User follow relationships (followers/following)

### Key Architecture Patterns
- **Server Actions**: Used for data mutations (createPost, etc.) instead of API routes
- **Server Components**: Most components are server-side rendered by default
- **Path aliases**: Uses `@/` for imports from project root
- **Prisma singleton**: Database client is properly configured to prevent multiple instances in development

### Directory Structure
```
app/                    # Next.js App Router pages
├── home/              # Home page with post listing
│   └── actions/       # Server actions for home page
├── post/new/          # Post creation page
│   ├── actions/       # Server actions for post creation
│   └── components/    # Client components for post form
├── layout.tsx         # Root layout with providers
└── providers.tsx      # Client-side providers (Material-UI theme)

components/            # Shared React components
lib/                  # Shared utilities
├── prisma.ts         # Prisma client singleton
└── auth.ts           # AWS Cognito authentication helpers

prisma/               # Database schema and migrations
├── schema.prisma     # Database schema definition
├── seed.ts           # Main seeding entry point
└── src/              # Individual seed functions
```

### Authentication Flow
- AWS Cognito is configured but authentication is not fully implemented
- Posts currently use the first user found for simplicity
- Authentication helpers are available in `lib/auth.ts`

### Development Setup Requirements
Before development, ensure these environment variables are configured:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_AWS_REGION` - AWS region for Cognito
- `NEXT_PUBLIC_USER_POOLS_ID` - Cognito User Pool ID  
- `NEXT_PUBLIC_USER_POOLS_WEB_CLIENT_ID` - Cognito Client ID
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

### Docker Development
The project includes Docker Compose configuration for local development:
- PostgreSQL runs on port 5433 (to avoid conflicts)
- Application runs on port 3000
- Database initialization script at `init.sql`