# Expenses Report Feature - Complete Guide

## 📊 Overview

A comprehensive expense reporting system that allows you to analyze expenses by program, time frame (month/year), and category with visual breakdowns and export capabilities.

---

## 🎯 Features

### 1. **Multi-Dimensional Filtering**
- **Program Filter**: View expenses for specific programs or all programs
- **Time Frame Filter**: 
  - All Time
  - Specific Month (e.g., January 2024)
  - Specific Year (e.g., 2024)
- **Category Filter**: Filter by expense categories (Supplies, Food, Equipment, etc.)

### 2. **Summary Statistics**
- **Total Expenses**: Sum of all filtered expenses
- **Average Expense**: Mean expense amount
- **Expense Count**: Number of expenses matching filters
- **Time Period Display**: Shows current filter selection

### 3. **Visual Analytics**
- **Expenses by Category**: 
  - Progress bars showing percentage distribution
  - Amount and count per category
  - Sorted by highest to lowest
  
- **Expenses by Program** (when viewing all programs):
  - Progress bars showing percentage distribution
  - Amount and count per program
  - Sorted by highest to lowest

### 4. **Detailed Expense List**
- Sortable table with all expense details
- Columns: Date, Program, Description, Category, Amount
- Total row at the bottom
- Sorted by date (newest first)

### 5. **Export Capabilities**
- **CSV Export**: Download filtered expenses as CSV file
- **Print Report**: Print-friendly view of the report
- Filename includes date: `expenses-report-YYYY-MM-DD.csv`

---

## 📁 Database Structure

### Expenses Table Schema:
```sql
CREATE TABLE expenses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    program_id BIGINT REFERENCES programs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Key Fields:
- **program_id**: Links expense to a specific program (nullable for general expenses)
- **description**: What the expense was for
- **amount**: Cost in PHP (₱)
- **date**: When the expense occurred
- **category**: Type of expense (Supplies, Food, Equipment, etc.)
- **notes**: Additional details (optional)

---

## 🚀 How to Use

### Accessing the Report:
1. Navigate to **Dashboard**
2. Click **"Expenses Report"** in the sidebar (chart icon)
3. Or go directly to `/expenses-report`

### Filtering Expenses:

#### **By Program:**
1. Click the "Program" dropdown
2. Select "All Programs" or a specific program
3. Report updates automatically

#### **By Time Frame:**
1. Click the "Time Frame" dropdown
2. Options:
   - **All Time**: Shows all expenses ever recorded
   - **Specific Month**: Shows expenses for a selected month/year
   - **Specific Year**: Shows expenses for a selected year
3. If "Specific Month" is selected:
   - Select the month from the "Month" dropdown
   - Select the year from the "Year" dropdown
4. If "Specific Year" is selected:
   - Select the year from the "Year" dropdown

#### **By Category:**
1. Click the "Category" dropdown
2. Select "All Categories" or a specific category
3. Categories are dynamically loaded from your expense data

### Exporting Data:

#### **CSV Export:**
1. Click the "Export CSV" button (top right)
2. File downloads automatically with name: `expenses-report-YYYY-MM-DD.csv`
3. CSV includes: Date, Program, Description, Category, Amount, Notes

#### **Print Report:**
1. Click the "Print" button (top right)
2. Browser print dialog opens
3. Adjust print settings as needed
4. Print or save as PDF

---

## 📈 Report Sections

### 1. Summary Cards (Top Row)
- **Total Expenses**: ₱XX,XXX.XX
  - Shows total amount of filtered expenses
  - Displays count of expenses
  
- **Average Expense**: ₱X,XXX.XX
  - Mean expense amount
  - "Per expense" label
  
- **Time Period**: Current filter
  - Shows selected time frame
  - Shows selected program

### 2. Expenses by Category
- Visual breakdown with progress bars
- Shows:
  - Category name
  - Number of expenses in category
  - Total amount for category
  - Percentage of total expenses
- Sorted by highest amount first

### 3. Expenses by Program (All Programs View)
- Only shown when "All Programs" is selected
- Visual breakdown with progress bars
- Shows:
  - Program name
  - Number of expenses in program
  - Total amount for program
  - Percentage of total expenses
- Sorted by highest amount first

### 4. Detailed Expenses Table
- Complete list of all filtered expenses
- Columns:
  - **Date**: When expense occurred
  - **Program**: Which program (or "N/A")
  - **Description**: What it was for
  - **Category**: Type of expense
  - **Amount**: Cost in ₱
- **Total Row**: Sum of all filtered expenses
- Sorted by date (newest first)

---

## 💡 Use Cases

### 1. Monthly Budget Review
**Scenario**: Review all expenses for January 2024
- Set Time Frame: "Specific Month"
- Select Month: "January"
- Select Year: "2024"
- Program: "All Programs"
- Category: "All Categories"

**Result**: See all expenses for January 2024 across all programs

### 2. Program-Specific Analysis
**Scenario**: Analyze expenses for "Youth Leadership Workshop"
- Program: "Youth Leadership Workshop"
- Time Frame: "All Time"
- Category: "All Categories"

**Result**: See all expenses ever recorded for that program

### 3. Category Spending Analysis
**Scenario**: Review all food expenses for 2024
- Program: "All Programs"
- Time Frame: "Specific Year"
- Year: "2024"
- Category: "Food and Beverages"

**Result**: See all food-related expenses for 2024

### 4. Quarterly Report
**Scenario**: Generate Q1 2024 report
- Run report 3 times:
  - January 2024
  - February 2024
  - March 2024
- Export each as CSV
- Combine in spreadsheet for quarterly analysis

### 5. Year-End Summary
**Scenario**: Annual expense report for 2024
- Program: "All Programs"
- Time Frame: "Specific Year"
- Year: "2024"
- Category: "All Categories"
- Export CSV for records

---

## 🎨 Visual Elements

### Color Coding:
- **Category Progress Bars**: Emerald green (`#10b981`)
- **Program Progress Bars**: Blue (`#2563eb`)
- **Summary Cards**: Clean white with subtle shadows
- **Table Hover**: Light gray background

### Icons:
- 💵 **Total Expenses**: Dollar sign icon
- 📈 **Average Expense**: Trending up icon
- 📅 **Time Period**: Calendar icon
- 📊 **Report**: Bar chart icon
- 💾 **Export**: Download icon
- 🖨️ **Print**: File text icon
- 🔍 **Filter**: Filter icon

---

## 📱 Responsive Design

### Desktop (≥768px):
- Full sidebar navigation
- Multi-column layout for summary cards
- Wide table view
- All buttons visible

### Mobile (<768px):
- Collapsible sidebar
- Stacked summary cards
- Scrollable table
- Responsive filters

---

## 🔐 Access Control

### All Users:
- ✅ View expenses report
- ✅ Filter by program/time/category
- ✅ Export to CSV
- ✅ Print report

### Admin/SK Officials:
- ✅ All viewer permissions
- ✅ Access to all programs
- ✅ Can see admin-only programs

---

## 📊 Sample Reports

### Example 1: Monthly Report
```
Time Period: January 2024
Program: All Programs
Total Expenses: ₱15,450.00
Average Expense: ₱772.50
Expense Count: 20 expenses

Top Categories:
1. Food and Beverages: ₱5,200.00 (33.7%)
2. Supplies: ₱4,100.00 (26.5%)
3. Equipment: ₱3,800.00 (24.6%)
4. Venue: ₱2,350.00 (15.2%)
```

### Example 2: Program-Specific Report
```
Program: Community Clean-up
Time Period: All Time
Total Expenses: ₱8,750.00
Average Expense: ₱437.50
Expense Count: 20 expenses

Top Categories:
1. Supplies: ₱3,200.00 (36.6%)
2. Equipment: ₱2,800.00 (32.0%)
3. Food and Beverages: ₱1,950.00 (22.3%)
4. Transportation: ₱800.00 (9.1%)
```

---

## 🛠️ Technical Implementation

### File Location:
- **Page**: `/app/expenses-report/page.tsx`
- **Route**: `/expenses-report`

### Dependencies:
- React hooks: `useState`, `useEffect`, `useCallback`
- Next.js: `useRouter`
- UI Components: shadcn/ui (Button, Card, Select)
- Icons: lucide-react
- Database: Supabase via `/lib/db.ts`

### Data Flow:
1. Fetch expenses and programs from database
2. Apply filters (program, time, category)
3. Calculate statistics (total, average, count)
4. Group by category and program
5. Render visualizations and tables

### Export Logic:
```typescript
// CSV Export
const exportToCSV = () => {
  const headers = ["Date", "Program", "Description", "Category", "Amount", "Notes"]
  const rows = filteredExpenses.map(expense => [...])
  const csvContent = [headers, ...rows].join("\n")
  // Download as file
}
```

---

## 🔄 Future Enhancements

### Potential Features:
- [ ] Date range picker (custom start/end dates)
- [ ] Comparison view (compare two time periods)
- [ ] Budget vs. Actual tracking
- [ ] Expense trends chart (line graph)
- [ ] Pie chart visualization
- [ ] PDF export with charts
- [ ] Email report scheduling
- [ ] Expense forecasting
- [ ] Multi-currency support
- [ ] Expense approval workflow

---

## 📝 Notes

### Performance:
- Report loads all expenses then filters client-side
- For large datasets (>1000 expenses), consider server-side filtering
- CSV export handles large datasets efficiently

### Data Accuracy:
- Amounts are displayed with 2 decimal places
- Percentages are calculated to 1 decimal place
- Dates are formatted based on browser locale

### Browser Compatibility:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Print feature uses browser's native print dialog

---

## 🎯 Summary

The Expenses Report feature provides:
- ✅ Comprehensive expense analysis
- ✅ Flexible filtering options
- ✅ Visual breakdowns by category and program
- ✅ Export capabilities (CSV, Print)
- ✅ Real-time calculations
- ✅ Responsive design
- ✅ User-friendly interface

Perfect for:
- Monthly/yearly budget reviews
- Program-specific expense tracking
- Category spending analysis
- Financial reporting
- Audit preparation
- Stakeholder presentations
