# SK PMMS - Complete Program Documentation

## 📋 Executive Summary

**SK Monitoring and Program Management System (SK PMMS)** is a comprehensive full-stack web application designed for managing community programs, participants, and expenses. It provides role-based access control, real-time analytics, and complete program lifecycle management.

---

## 🎯 Core Features Overview

### 1. **Authentication & Authorization**
- ✅ User registration with email confirmation
- ✅ Secure login/logout functionality
- ✅ Role-based access control (Admin, SK Official, Viewer)
- ✅ Password reset and change password flows
- ✅ Profile picture support with Supabase Storage
- ✅ User approval workflow for new registrations

### 2. **Program Management**
- ✅ Create, read, update, and delete programs
- ✅ Program status tracking (Active, Planning, Completed)
- ✅ Budget management and tracking
- ✅ Multi-field search functionality
- ✅ Advanced filtering (by status, date, month, year)
- ✅ File attachment support for programs
- ✅ Participant registration for programs
- ✅ Registration status tracking (Pending, Accepted, Rejected)
- ✅ **Calendar View** - Interactive calendar showing programs by date
- ✅ **Grid View** - Traditional card-based layout
- ✅ Toggle between calendar and grid views

### 3. **Participant Management**
- ✅ Participant profile creation and management
- ✅ Profile picture upload and storage
- ✅ Contact information tracking
- ✅ Program participation history
- ✅ Registration status management
- ✅ Participant search and filtering

### 4. **Expense Tracking**
- ✅ Expense logging per program
- ✅ Category-based expense organization
- ✅ Budget utilization tracking
- ✅ Expense filtering and search
- ✅ Expense reports with PDF export
- ✅ Real-time budget vs. actual comparison

### 5. **Dashboard & Analytics**
- ✅ Real-time statistics dashboard
- ✅ Total programs, participants, and budget overview
- ✅ Budget utilization visualization
- ✅ Monthly program trends (bar chart)
- ✅ Program status distribution (pie chart)
- ✅ Expense breakdown by category
- ✅ Recent programs and expenses display
- ✅ Key performance indicators (KPIs)

### 6. **User Interface**
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/light theme support
- ✅ Intuitive dashboard with sidebar navigation
- ✅ Loading states and skeleton screens
- ✅ Toast notifications for user feedback
- ✅ Modal dialogs for confirmations
- ✅ Professional UI components (shadcn/ui)

---

## 🏗️ Technical Architecture

### Frontend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 15.1.8 |
| React | React | 19 |
| Language | TypeScript | 5.9.3 |
| UI Library | shadcn/ui + Radix UI | Latest |
| Styling | TailwindCSS | 3.4.17 |
| Icons | Lucide React | 0.454.0 |
| Charts | Recharts | 2.15.0 |
| Forms | React Hook Form + Zod | Latest |
| State Management | React Hooks | Built-in |

### Backend Stack
| Component | Technology |
|-----------|-----------|
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| API | Supabase REST API |
| Real-time | Supabase Realtime |

### Deployment Options
- **Netlify** - Primary deployment platform
- **Vercel** - Alternative deployment
- **Railway** - Additional support

---

## 📊 Database Schema

### Core Tables

#### 1. **users**
```sql
- id (UUID) - Primary key
- username (TEXT) - Unique username
- first_name (TEXT) - User's first name
- last_name (TEXT) - User's last name
- email (TEXT) - Unique email address
- role (TEXT) - 'admin', 'skofficial', or 'viewer'
- is_approved (BOOLEAN) - Account approval status
- approval_code (TEXT) - Approval verification code
- created_at (TIMESTAMPTZ) - Account creation timestamp
- updated_at (TIMESTAMPTZ) - Last update timestamp
```

#### 2. **programs**
```sql
- id (BIGINT) - Primary key (auto-generated)
- name (TEXT) - Program name
- description (TEXT) - Program description
- date (DATE) - Program date
- time (TEXT) - Program time
- location (TEXT) - Program location
- budget (DECIMAL) - Program budget
- status (TEXT) - 'Active', 'Planning', or 'Completed'
- file_urls (TEXT) - Attached files
- created_at (TIMESTAMPTZ) - Creation timestamp
- updated_at (TIMESTAMPTZ) - Last update timestamp
```

#### 3. **participants**
```sql
- id (BIGINT) - Primary key (auto-generated)
- user_id (UUID) - Foreign key to users table
- first_name (TEXT) - Participant's first name
- last_name (TEXT) - Participant's last name
- age (INTEGER) - Participant's age
- contact (TEXT) - Contact number
- email (TEXT) - Email address
- address (TEXT) - Physical address
- created_at (TIMESTAMPTZ) - Creation timestamp
```

#### 4. **expenses**
```sql
- id (BIGINT) - Primary key (auto-generated)
- program_id (BIGINT) - Foreign key to programs
- description (TEXT) - Expense description
- amount (DECIMAL) - Expense amount
- date (DATE) - Expense date
- category (TEXT) - Expense category
- notes (TEXT) - Additional notes
- created_at (TIMESTAMPTZ) - Creation timestamp
```

#### 5. **program_participants**
```sql
- program_id (BIGINT) - Foreign key to programs
- participant_id (BIGINT) - Foreign key to participants
- PRIMARY KEY (program_id, participant_id)
```

#### 6. **registrations**
```sql
- id (BIGINT) - Primary key (auto-generated)
- program_id (BIGINT) - Foreign key to programs
- participant_id (BIGINT) - Foreign key to participants
- status (TEXT) - 'Pending', 'Accepted', or 'Rejected'
- created_at (TIMESTAMPTZ) - Registration timestamp
- updated_at (TIMESTAMPTZ) - Last update timestamp
```

---

## 📁 Project Structure

```
sk_pmms/
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin panel pages
│   ├── api/                      # API routes
│   ├── dashboard/                # Main dashboard
│   ├── expenses/                 # Expense management
│   ├── expenses-report/          # Expense reports
│   ├── feedback/                 # Feedback collection
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── participants/             # Participant management
│   ├── programs/                 # Program management
│   ├── profile/                  # User profile
│   ├── user-dashboard/           # User dashboard
│   ├── user-view/                # User view pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard-header.tsx      # Dashboard header
│   ├── dashboard-sidebar.tsx     # Dashboard sidebar
│   └── ...                       # Other components
│
├── hooks/                        # Custom React hooks
│   └── use-toast.ts              # Toast notification hook
│
├── lib/                          # Utility functions
│   ├── supabase.ts               # Supabase client
│   └── ...                       # Other utilities
│
├── public/                       # Static assets
├── sql/                          # SQL migration files
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # TailwindCSS configuration
├── next.config.mjs               # Next.js configuration
└── schema.sql                    # Database schema
```

---

## 🔐 Security Features

### Current Implementation
- ✅ Supabase Authentication with email verification
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcryptjs
- ✅ HTTPS enforcement
- ✅ Environment variable protection
- ✅ Row Level Security (RLS) enabled on database tables

### Security Considerations
⚠️ **Note:** The application has Row Level Security enabled but policies currently allow broad access. For production use, implement:
- Strict RLS policies based on user roles
- Server-side authentication middleware
- HTTP-only secure cookies
- CSRF protection
- Input validation and sanitization
- Rate limiting on API endpoints

---

## 🚀 Key Pages & Routes

### Public Routes
- `/` - Home page with overview
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password recovery

### Authenticated Routes
- `/dashboard` - Main dashboard with analytics
- `/programs` - Program listing and management
- `/programs/[id]` - Program details
- `/participants` - Participant management
- `/expenses` - Expense tracking
- `/expenses-report` - Expense reports with PDF export
- `/profile` - User profile management
- `/feedback` - Feedback submission

### Admin Routes
- `/admin` - Admin panel
- `/admin/users` - User management
- `/admin/approvals` - User approval workflow

---

## � Calendar Feature

### Overview
The Programs page includes an **interactive calendar view** that allows users to visualize all programs by date, alongside the traditional grid view.

### Calendar Capabilities
- **Dual View System** - Toggle between Calendar and Grid views
- **Interactive Calendar** - Click on any date to see programs scheduled for that day
- **Month Navigation** - Use arrow buttons to navigate between months
- **Visual Indicators** - Dots appear on dates with scheduled programs
- **Program Details Panel** - Right-side panel displays programs for selected date
- **Program Summary** - Shows total programs and count by status
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

### Calendar Features
- Date selection with visual highlighting
- Program count display per date
- Status badges (Active, Planning, Completed)
- Program name, description, time, location, and budget display
- All existing filters apply to calendar view
- Direct links to program detail pages

### User Access
- **SK Officials** - View and manage programs in calendar
- **Viewers** - View programs in calendar (read-only)
- **Regular Users** - View programs they can join

### Files
- `components/program-calendar.tsx` - Calendar component
- `app/programs/page.tsx` - Programs page with view toggle

---

## �📊 Dashboard Analytics

The dashboard provides comprehensive insights:

### Key Metrics
- **Total Programs** - Count of all programs
- **Total Participants** - Count of all participants
- **Total Budget** - Sum of all program budgets
- **Budget Utilization** - Percentage of budget spent
- **Monthly Trends** - Program creation trends over months
- **Status Distribution** - Programs by status (pie chart)
- **Expense Breakdown** - Expenses by category
- **Recent Programs** - Latest 5 programs
- **Recent Expenses** - Latest 5 expenses

### Visualizations
- Bar charts for monthly trends
- Pie charts for status distribution
- Progress bars for budget utilization
- Line charts for expense trends

---

## 🔄 User Workflows

### 1. **Registration & Approval Workflow**
```
1. User registers with email and password
2. Email verification sent
3. Admin reviews and approves user
4. User receives approval notification
5. User can now access the system
```

### 2. **Program Creation Workflow**
```
1. Admin/SK Official creates new program
2. Enter program details (name, date, location, budget)
3. Attach files if needed
4. Set program status (Planning/Active)
5. Program appears in dashboard
```

### 3. **Participant Registration Workflow**
```
1. Participant creates profile
2. Uploads profile picture
3. Enters contact information
4. Registers for programs
5. Admin reviews and approves registration
6. Participant receives confirmation
```

### 4. **Expense Tracking Workflow**
```
1. Admin logs expense for a program
2. Enter amount, category, date, description
3. Expense is recorded in database
4. Budget utilization updates automatically
5. Expense appears in reports
```

---

## 📈 Advanced Features

### Expense Reports
- PDF export with jsPDF
- Customizable report templates
- Filter by date range, program, category
- Budget variance analysis
- Monthly expense summaries

### Program Filtering
- Filter by status (Active, Planning, Completed)
- Filter by date range
- Filter by month and year
- Multi-field search
- Sort by various criteria

### Real-time Updates
- Dashboard updates in real-time
- Expense tracking reflects immediately
- Budget calculations update automatically
- Status changes propagate instantly

---

## 🛠️ Development Setup

### Prerequisites
- Node.js >= 20.0.0
- npm >= 9.0.0
- Supabase account

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Create .env.local file with Supabase credentials
cp env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📱 Responsive Design

The application is fully responsive:
- **Mobile** (320px - 640px) - Optimized touch interface
- **Tablet** (641px - 1024px) - Balanced layout
- **Desktop** (1025px+) - Full feature display

All components adapt seamlessly across devices with TailwindCSS breakpoints.

---

## 🎨 UI/UX Features

### Design System
- **Color Scheme** - Professional dark/light themes
- **Typography** - Clear hierarchy and readability
- **Spacing** - Consistent padding and margins
- **Components** - Pre-built shadcn/ui components
- **Icons** - Lucide React icons throughout

### User Experience
- Loading states for async operations
- Toast notifications for feedback
- Modal dialogs for confirmations
- Form validation with Zod
- Error handling and recovery
- Keyboard navigation support

---

## 🔄 API Integration

### Supabase REST API
The application uses Supabase REST API for:
- User authentication
- CRUD operations on all tables
- File uploads to storage
- Real-time subscriptions
- Row Level Security enforcement

### Example API Calls
```typescript
// Fetch programs
const { data: programs } = await supabase
  .from('programs')
  .select('*')
  .eq('status', 'Active');

// Create expense
const { data: expense } = await supabase
  .from('expenses')
  .insert([{ program_id, amount, category }]);

// Update participant
const { data: participant } = await supabase
  .from('participants')
  .update({ age, contact })
  .eq('id', participant_id);
```

---

## 📊 Reporting Capabilities

### Available Reports
1. **Expense Report** - Detailed expense breakdown with PDF export
2. **Program Report** - Program statistics and performance
3. **Participant Report** - Participant demographics and engagement
4. **Budget Report** - Budget utilization and variance analysis
5. **Monthly Report** - Trends and patterns over time

### Export Formats
- PDF (via jsPDF)
- CSV (downloadable)
- JSON (for integration)

---

## 🚀 Deployment

### Netlify Deployment
```bash
# Build for Netlify
npm run build:netlify

# Deploy using Netlify CLI
netlify deploy --prod
```

### Vercel Deployment
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
```

### Railway Deployment
```bash
# Build for Railway
npm run build:railway

# Deploy using Railway CLI
railway up
```

---

## 🔮 Recommended Future Enhancements

### High Priority
1. **Enhanced Security**
   - Implement strict RLS policies
   - Add server-side authentication middleware
   - Implement CSRF protection
   - Add rate limiting

2. **Advanced Reporting**
   - Custom report builder
   - Scheduled report generation
   - Email report distribution
   - Excel export with formatting

3. **Notifications**
   - Email notifications for program updates
   - SMS alerts for important events
   - In-app notification center
   - Notification preferences

### Medium Priority
4. **Program Management**
   - Program templates
   - Recurring programs
   - Capacity management
   - Waitlist functionality

5. **Participant Features**
   - Attendance tracking with QR codes
   - Participant segmentation
   - Bulk import/export
   - Feedback collection

6. **Financial Management**
   - Budget forecasting
   - Invoice generation
   - Payment tracking
   - Financial reconciliation

### Long-term Vision
7. **AI & Machine Learning**
   - Chatbot for customer support
   - Sentiment analysis on feedback
   - Predictive analytics
   - Recommendation engine

8. **Integration Features**
   - Calendar integration (Google, Outlook)
   - Payment gateway integration (Stripe, PayPal)
   - Email service integration
   - SMS integration

9. **Mobile Application**
   - Native iOS app
   - Native Android app
   - Offline functionality
   - Push notifications

10. **Advanced Analytics**
    - Custom dashboards
    - Data visualization improvements
    - ROI calculations
    - Performance metrics

---

## 📞 Support & Maintenance

### Common Issues & Solutions

**Issue: Login not working**
- Check Supabase credentials in .env.local
- Verify email verification is complete
- Check user approval status

**Issue: File uploads failing**
- Verify Supabase Storage bucket permissions
- Check file size limits
- Ensure proper authentication

**Issue: Dashboard not loading**
- Clear browser cache
- Check network connectivity
- Verify Supabase connection

### Monitoring
- Monitor Supabase dashboard for errors
- Check application logs
- Monitor database performance
- Track API usage

---

