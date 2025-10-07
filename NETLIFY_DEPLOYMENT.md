# PMMS SK Monitor - Netlify Deployment Guide

## Application Overview

**PMMS SK Monitor** is a comprehensive Participant Management and Program Monitoring System designed for SK (Sangguniang Kabataan) San Francisco, Agusan del Sur. This Next.js application provides a complete solution for managing youth programs, tracking participants, monitoring expenses, and collecting feedback.

## Key Features

### For Administrators
- **Dashboard Analytics**: Real-time insights into programs, participants, and expenses
- **Program Management**: Create, edit, and monitor youth programs with detailed tracking
- **Participant Directory**: Comprehensive participant database with enrollment tracking
- **Request Management**: Handle and approve program requests from users
- **Expense Tracking**: Monitor and manage program-related expenses
- **Feedback System**: Review and respond to user feedback

### For Regular Users
- **User Dashboard**: Personalized view of enrolled programs and activities
- **Program Discovery**: Browse and view available SK programs
- **Participant Profiles**: View participant information and program enrollments
- **Expense Transparency**: View program expenses and budget allocations
- **Feedback Submission**: Submit feedback, bug reports, and feature requests

### Technical Features
- **Authentication**: Secure user authentication with role-based access control
- **Profile Management**: User profiles with profile picture uploads
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Live data synchronization using Supabase
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (Profile Pictures)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## Netlify Deployment Configuration

### Build Settings

```
Build command: npm install && npm run build:netlify
Publish directory: .next
Node version: 20
```

### Environment Variables Required

Add these environment variables in Netlify dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://ryspfqoxnzdrhrqiiqht.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Configuration

The application includes:
- **netlify.toml**: Pre-configured build settings
- **@netlify/plugin-nextjs**: Next.js optimization plugin
- **Security Headers**: XSS protection, frame options, content type options
- **Legacy peer deps**: Ensures compatibility with all dependencies

### Performance Optimizations

- Server-side rendering (SSR) for optimal performance
- Static asset optimization
- Image optimization through Next.js
- Edge caching for static resources
- Lazy loading for improved initial load time

## Database Setup

The application uses Supabase for backend services. The database includes:

### Tables
- `participants`: User and participant information
- `programs`: SK program details and schedules
- `registrations`: Program enrollment tracking
- `expenses`: Financial tracking for programs
- `feedback`: User feedback and ratings
- `requests`: Program requests and approvals

### Storage Buckets
- `profile-pictures`: User profile picture storage

### Security
- Row-level security (RLS) policies
- Role-based access control
- Secure authentication flow

## User Roles

1. **Admin**: Full system access, can manage all resources
2. **SK Official**: Similar to admin, official SK personnel
3. **User**: Regular users with limited access
4. **Viewer**: Read-only access to public information

## Getting Started After Deployment

### Initial Setup
1. Access the application at your Netlify URL
2. Use the default admin credentials (should be configured in Supabase)
3. Change default passwords immediately
4. Configure user roles in the database

### Admin Tasks
- Add SK programs and schedules
- Register participants
- Set up expense categories
- Review and respond to feedback

### User Experience
- Users can register and create profiles
- Browse available programs
- View participant information
- Submit feedback and requests

## Support & Maintenance

### Monitoring
- Check Netlify deployment logs for build issues
- Monitor Supabase dashboard for database performance
- Review user feedback regularly

### Updates
- Application automatically rebuilds on git push
- Database migrations should be run manually
- Test in staging environment before production

## Project Structure

```
sk_pmms/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Admin dashboard
│   ├── user-dashboard/    # User dashboard
│   ├── programs/          # Program management
│   ├── participants/      # Participant directory
│   ├── expenses/          # Expense tracking
│   ├── feedback/          # Feedback management
│   └── progrequest/       # Request management
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-header.tsx
│   └── dashboard-sidebar.tsx
├── lib/                   # Utility functions
│   ├── db.ts             # Database operations
│   ├── auth.ts           # Authentication
│   └── storage.ts        # File storage
└── public/               # Static assets

```

## Contact & Documentation

For issues, feature requests, or contributions, please refer to the project repository or contact the SK San Francisco development team.

---

**Built with ❤️ for SK San Francisco, Agusan del Sur**
