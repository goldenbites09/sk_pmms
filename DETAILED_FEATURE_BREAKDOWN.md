# SK PMMS - Complete Feature Breakdown

## 📋 All Pages & Routes (Comprehensive List)

### 1. **Authentication Pages**

#### `/` - Home Page
- Landing page with overview
- Quick navigation to main features
- Call-to-action buttons

#### `/login` - Login Page
- Email/password authentication
- "Forgot Password" link
- "Register" link for new users
- Form validation

#### `/register` - Registration Page
- User registration form
- Email verification
- Password requirements
- Role selection
- Approval code entry (if required)

#### `/forgot-password` - Password Recovery
- Email-based password reset
- Reset link generation
- Security verification

#### `/reset-password` - Password Reset
- New password entry
- Password confirmation
- Token validation

#### `/change-password` - Change Password
- Current password verification
- New password entry
- Password confirmation
- For authenticated users

---

### 2. **Dashboard Pages**

#### `/dashboard` - Main Dashboard (Admin/SK Official)
- Real-time statistics
  - Total programs count
  - Total participants count
  - Total budget
  - Budget utilization percentage
- Charts & Visualizations
  - Monthly program trends (bar chart)
  - Program status distribution (pie chart)
  - Expense breakdown by category
  - Budget vs. actual comparison
- Recent activity
  - Latest 5 programs
  - Latest 5 expenses
- Quick actions
  - Create new program
  - Add participant
  - Log expense
- KPI cards

#### `/user-dashboard` - User Dashboard
- Personalized dashboard for regular users
- Programs they're registered for
- Upcoming programs
- Registration status
- Quick links to join programs

---

### 3. **Program Management Pages**

#### `/programs` - Programs List
- **Dual View System**
  - Calendar View (interactive calendar)
  - Grid View (card-based layout)
- Features:
  - Search functionality (multi-field)
  - Filter by status (Active, Planning, Completed)
  - Filter by month and year
  - Sort options
  - Program count display
- For each program card:
  - Program name
  - Description
  - Date and time
  - Location
  - Budget
  - Status badge
  - Participant count
  - Action buttons (View, Join, Edit, Delete)

#### `/programs/new` - Create New Program
- Form fields:
  - Program name
  - Description
  - Date picker
  - Time input
  - Location
  - Budget amount
  - Status selection (Active, Planning, Completed)
  - File attachments
- Submit and cancel buttons
- Form validation

#### `/programs/[id]` - Program Details
- Full program information
- Participants list
- Expenses for the program
- Budget utilization
- Program status
- Edit button (for admins)
- Delete button (for admins)
- Join button (for users)
- Tabs:
  - Overview
  - Participants
  - Expenses
  - Details

#### `/programs/[id]/edit` - Edit Program
- Pre-filled form with current data
- All fields editable
- Save and cancel buttons
- Form validation

#### `/programs/[id]/participants` - Program Participants
- List of all participants in program
- Participant details
  - Name
  - Contact
  - Email
  - Status
- Add participant button
- Remove participant button
- Search and filter

#### `/programs/[id]/participants/register` - Register Participant
- Form to add participant to program
- Participant selection dropdown
- Status selection
- Submit button

---

### 4. **Participant Management Pages**

#### `/participants` - Participants List
- Search functionality (multi-field)
- Filter by program
- Sort options
- For each participant:
  - Name
  - Age
  - Contact
  - Email
  - Address
  - Programs registered
  - Action buttons (View, Edit, Delete)
- Create new participant button
- Modal view for participant details

#### `/participants/new` - Create New Participant
- Form fields:
  - First name
  - Last name
  - Age
  - Contact number
  - Email
  - Address
  - Profile picture upload
- Submit and cancel buttons
- Form validation

#### `/participants/[id]` - Participant Details
- Full participant information
- Profile picture
- Contact details
- Programs registered
- Registration status for each program
- Edit button
- Delete button

#### `/participants/[id]/edit` - Edit Participant
- Pre-filled form with current data
- All fields editable
- Profile picture update
- Save and cancel buttons

#### `/participants/register` - Participant Registration
- Self-registration form
- Profile creation
- Program selection
- Submit button

---

### 5. **Expense Management Pages**

#### `/expenses` - Expenses List
- Search functionality (multi-field)
- Filter by program
- Filter by category
- Sort options
- For each expense:
  - Description
  - Amount
  - Date
  - Category
  - Program name
  - Notes
  - Action buttons (View, Edit, Delete)
- Create new expense button
- Modal view for expense details

#### `/expenses/new` - Create New Expense
- Form fields:
  - Program selection
  - Description
  - Amount
  - Date picker
  - Category selection
  - Notes
- Submit and cancel buttons
- Form validation
- Real-time budget calculation

#### `/expenses/[id]` - Expense Details
- Full expense information
- Associated program
- Amount and category
- Date and notes
- Edit button
- Delete button

#### `/expenses/[id]/edit` - Edit Expense
- Pre-filled form with current data
- All fields editable
- Save and cancel buttons
- Budget recalculation

---

### 6. **Reporting Pages**

#### `/expenses-report` - Expense Reports
- Comprehensive expense analysis
- Features:
  - Date range filter
  - Program filter
  - Category filter
  - Expense summary
  - Total expenses
  - Breakdown by category
  - Breakdown by program
  - Monthly trends
- PDF export functionality
- Print option
- Data visualization (charts)

---

### 7. **User Profile Pages**

#### `/profile` - User Profile
- User information
  - Username
  - First name
  - Last name
  - Email
  - Role
  - Profile picture
- Edit profile button
- Change password button
- Logout button
- Account settings

#### `/user-view/profile` - User View Profile
- View-only profile
- User information display
- Programs registered
- Participation history

---

### 8. **Admin Pages**

#### `/admin/requests` - Program Requests
- Pending program requests
- Request details
- Approve button
- Reject button
- Request history
- Filter options

---

### 9. **Special Pages**

#### `/feedback` - Feedback Submission
- Feedback form
- Program selection
- Rating system
- Comments field
- Submit button
- Feedback history

#### `/progrequest` - Program Request
- Request form for new programs
- Program details
- Justification
- Budget request
- Submit button
- Request tracking

#### `/user-view` - User View Dashboard
- User-specific view
- Available programs
- Registered programs
- Program details
- Join program option
- View profile option

#### `/user-view/programs/[id]` - User View Program Details
- Program information
- Join button
- Participant list
- Program expenses (if visible)
- Registration status

#### `/user-view/participants/[id]` - User View Participant
- Participant information
- Programs registered
- Contact information

---

## 🎯 Feature Matrix by Page

| Feature | Programs | Participants | Expenses | Dashboard | Reports | Profile |
|---------|----------|--------------|----------|-----------|---------|---------|
| Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Search | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Filter | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Export | ❌ | ❌ | ✅ (PDF) | ❌ | ✅ (PDF) | ❌ |
| Charts | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## 🔐 Role-Based Access Control

### Admin Role
- ✅ Full access to all pages
- ✅ Create/edit/delete programs
- ✅ Create/edit/delete participants
- ✅ Create/edit/delete expenses
- ✅ View all reports
- ✅ Manage user approvals
- ✅ View admin dashboard
- ✅ Access admin requests page

### SK Official Role
- ✅ Create/edit programs
- ✅ Create/edit participants
- ✅ Create/edit expenses
- ✅ View all data
- ✅ View reports
- ✅ Cannot delete data
- ✅ Cannot manage users

### Viewer Role
- ✅ View all programs
- ✅ View all participants
- ✅ View all expenses
- ✅ View reports
- ❌ Cannot create/edit/delete
- ❌ Cannot manage users

### Regular User Role
- ✅ View available programs
- ✅ Join programs
- ✅ View own profile
- ✅ View own registrations
- ❌ Cannot create programs
- ❌ Cannot manage participants
- ❌ Cannot view expenses

---

## 📊 Data Models & Relationships

### Programs
- Program ID (PK)
- Name, Description
- Date, Time, Location
- Budget
- Status (Active, Planning, Completed)
- File URLs
- Created/Updated timestamps

### Participants
- Participant ID (PK)
- User ID (FK)
- First Name, Last Name
- Age, Contact, Email, Address
- Created timestamp

### Expenses
- Expense ID (PK)
- Program ID (FK)
- Description, Amount
- Date, Category, Notes
- Created timestamp

### Registrations
- Program ID (FK)
- Participant ID (FK)
- Registration Status (Pending, Accepted, Rejected)
- Created/Updated timestamps

### Users
- User ID (PK)
- Username, Email
- First Name, Last Name
- Role (admin, skofficial, viewer)
- Is Approved (boolean)
- Approval Code
- Created/Updated timestamps

---

## 🎨 UI Components Used

### Layout Components
- DashboardHeader
- DashboardSidebar
- DashboardLayout
- Tabs
- Card (CardHeader, CardContent, CardDescription, CardTitle)

### Form Components
- Input
- Select (SelectContent, SelectItem, SelectTrigger, SelectValue)
- Button
- Dialog (DialogContent, DialogHeader, DialogTitle, DialogTrigger)
- Popover (PopoverContent, PopoverTrigger)
- Command (CommandEmpty, CommandGroup, CommandInput, CommandItem)

### Data Display
- Table
- Badge
- Calendar
- Charts (Recharts)

### Icons (Lucide React)
- Plus, Search, Edit, Trash, Eye, EyeOff
- Calendar, CalendarDays, Clock, MapPin
- Users, User, Phone, Mail
- Check, X, ChevronDown, ChevronsUpDown
- Grid3x3, BarChart3, PieChart
- And many more...

---

## 🔄 Key Workflows

### 1. Program Creation Workflow
```
Admin/SK Official → Create Program → Fill Details → Upload Files → Set Status → Save
                                                                      ↓
                                                    Program appears in Dashboard & Programs page
```

### 2. Participant Registration Workflow
```
User → View Programs → Click Join → Complete Profile (if needed) → Submit Registration
                                                                      ↓
                                                    Admin Reviews → Approve/Reject
                                                                      ↓
                                                    User Notified → Appears in Programs
```

### 3. Expense Tracking Workflow
```
Admin → Create Expense → Select Program → Enter Amount & Category → Save
                                                                      ↓
                                                    Budget Updated → Appears in Reports
```

### 4. Report Generation Workflow
```
Admin → Go to Expenses Report → Select Filters → View Data → Export to PDF
```

---

## 📱 Responsive Features

- Mobile-optimized layouts
- Touch-friendly buttons and inputs
- Collapsible sidebar on mobile
- Responsive tables and cards
- Mobile-friendly modals
- Responsive calendar view

---

## 🔍 Search & Filter Capabilities

### Programs Page
- Search by: Name, Description, Location, Status
- Filter by: Status, Month, Year
- Sort by: Date, Name, Budget

### Participants Page
- Search by: Name, Email, Contact, Address
- Filter by: Program, Age Range
- Sort by: Name, Date Joined

### Expenses Page
- Search by: Description, Amount, Category, Notes
- Filter by: Program, Category, Date Range
- Sort by: Amount, Date, Category

### Reports Page
- Filter by: Date Range, Program, Category
- Export as: PDF

---

## 🚀 Advanced Features

### Calendar Feature
- Interactive month view
- Click dates to see programs
- Visual indicators for programs
- Program count display
- Status color coding
- Responsive design

### PDF Export
- Expense reports
- Program summaries
- Participant lists
- Budget reports

### Real-time Updates
- Dashboard statistics
- Budget calculations
- Status changes
- Participant counts

### Form Validation
- Required field validation
- Email format validation
- Number format validation
- Date format validation
- Custom validation rules

### Error Handling
- User-friendly error messages
- Toast notifications
- Error logging
- Graceful fallbacks

---

## 📈 Analytics & Reporting

### Dashboard Metrics
- Total Programs
- Total Participants
- Total Budget
- Budget Utilization %
- Active Programs Count
- Planning Programs Count
- Completed Programs Count

### Charts & Visualizations
- Monthly Program Trends (Bar Chart)
- Program Status Distribution (Pie Chart)
- Expense Breakdown by Category (Bar Chart)
- Budget vs Actual (Line Chart)

### Reports Available
- Expense Report (detailed, filterable, exportable)
- Program Summary
- Participant Demographics
- Budget Analysis
- Monthly Trends

---

## 🔐 Security Features Implemented

- Email verification for registration
- Password hashing (bcryptjs)
- Role-based access control
- User approval workflow
- Session management
- Protected routes
- HTTPS support
- Environment variable protection

---

## 🛠️ Technical Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| UI Framework | shadcn/ui, Radix UI |
| Styling | TailwindCSS |
| Icons | Lucide React |
| Charts | Recharts |
| Forms | React Hook Form, Zod |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| PDF Export | jsPDF, jsPDF-AutoTable |
| Deployment | Netlify, Vercel, Railway |

---

## 📝 Summary

SK PMMS is a **comprehensive program management system** with:

✅ **30+ Pages** covering all aspects of program management  
✅ **Complete CRUD Operations** for programs, participants, and expenses  
✅ **Advanced Search & Filtering** across all data  
✅ **Real-time Analytics** with multiple visualizations  
✅ **Calendar View** for program scheduling  
✅ **PDF Reports** for expense tracking  
✅ **Role-Based Access Control** with 4 user roles  
✅ **Responsive Design** for all devices  
✅ **Form Validation** and error handling  
✅ **User-Friendly Interface** with modern UI components  

The system provides a complete solution for managing community programs from creation through completion, with comprehensive tracking of participants and expenses.

---

**Last Updated:** December 7, 2025
**Total Pages:** 30+
**Total Features:** 100+
**Status:** Production Ready
