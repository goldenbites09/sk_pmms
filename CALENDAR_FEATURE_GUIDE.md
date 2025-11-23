# Program Calendar Feature Guide

## 📅 Overview

A new **Calendar View** has been added to the Programs page, allowing SK Officials and Viewers to visualize all programs in a calendar format alongside the existing grid view.

---

## ✨ Features

### 1. **Dual View System**
- **Calendar View**: Interactive calendar showing all programs by date
- **Grid View**: Traditional card-based layout (existing view)
- Toggle between views using tabs at the top

### 2. **Calendar Functionality**
- **Interactive Calendar**: Click on any date to see programs scheduled for that day
- **Month Navigation**: Use arrow buttons to navigate between months
- **Visual Indicators**: 
  - Dots appear on dates with scheduled programs
  - Selected date is highlighted in teal
  - Dates with programs show a border highlight
- **Program Count**: Shows number of programs per date (with "+X" indicator if more than 3)

### 3. **Program Details Panel**
- **Right-side panel** displays programs for the selected date
- Shows:
  - Program name
  - Description
  - Time and location
  - Budget amount
  - Status badge (Active, Planning, Completed)
- **Click to view full details** - links to program detail page

### 4. **Program Summary**
- Bottom section shows statistics:
  - Total number of programs
  - Count of Active programs
  - Count of Planning programs
  - Count of Completed programs

### 5. **Responsive Design**
- Works on mobile, tablet, and desktop
- Calendar adjusts layout for smaller screens
- Touch-friendly on mobile devices

---

## 🎯 User Roles & Access

### **SK Officials**
- ✅ View all programs in calendar
- ✅ View all programs in grid
- ✅ Create new programs
- ✅ Add participants to programs
- ✅ View program details

### **Viewers**
- ✅ View all programs in calendar
- ✅ View all programs in grid
- ✅ View program details
- ❌ Cannot create programs
- ❌ Cannot modify programs

### **Regular Users**
- ✅ View programs they can join
- ✅ Join active programs
- ✅ View calendar and grid views
- ✅ See registration status

---

## 📁 Files Added/Modified

### New Files
```
components/program-calendar.tsx
```
- New component for calendar view
- Handles date selection and program filtering
- Displays program details for selected date

### Modified Files
```
app/programs/page.tsx
```
- Added Tabs component for view switching
- Integrated ProgramCalendar component
- Added calendar and grid icons
- Maintained all existing functionality

---

## 🎨 UI Components Used

- **Tabs**: Switch between Calendar and Grid views
- **Calendar**: Interactive month/date selector
- **Card**: Display program information
- **Badge**: Show program status
- **Button**: Navigation and actions
- **Icons**: CalendarDays, Grid3x3 for tab indicators

---

## 🔍 How to Use

### Viewing Programs in Calendar
1. Navigate to the **Programs** page
2. Click the **Calendar View** tab
3. The calendar displays the current month
4. Click any date to see programs scheduled for that day
5. Programs appear in the right panel

### Navigating Months
1. Use the **← →** buttons to move between months
2. Calendar updates to show programs in the selected month

### Viewing Program Details
1. Click on any program in the calendar or grid view
2. You'll be taken to the program's detail page
3. From there, you can join, view participants, expenses, etc.

### Switching Views
1. Click **Calendar View** tab to see calendar
2. Click **Grid View** tab to see card layout
3. Your selected filters apply to both views

---

## 🔧 Technical Details

### Component Structure
```
ProgramCalendar Component
├── Calendar Grid (7 columns × 6 rows)
├── Month Navigation (Previous/Next buttons)
├── Programs List (for selected date)
├── Program Summary (statistics)
└── Legend (visual indicators)
```

### Data Flow
1. Programs data passed from parent component
2. Calendar filters programs by date
3. Selected date updates program list
4. All filters (status, month, year, search) apply to calendar data

### Styling
- TailwindCSS for all styling
- Responsive breakpoints for mobile/tablet/desktop
- Color-coded status badges
- Hover effects for interactivity

---

## 📊 Program Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Active | Green | #10b981 |
| Planning | Blue | #3b82f6 |
| Completed | Gray | #6b7280 |

---

## 🚀 Future Enhancements

Potential improvements for the calendar feature:

1. **Drag & Drop**: Move programs to different dates
2. **Program Creation**: Create programs directly from calendar
3. **Color Coding**: Different colors for different program types
4. **Week View**: Show week-by-week view
5. **Export**: Export calendar as iCal or PDF
6. **Reminders**: Set reminders for upcoming programs
7. **Recurring Programs**: Support for repeating programs
8. **Time Slots**: Show multiple programs on same day in time slots
9. **Filtering**: Filter calendar by program type/category
10. **Print**: Print calendar view

---

## 🐛 Troubleshooting

### Calendar Not Showing Programs
- Check that programs have valid dates
- Ensure you're viewing the correct month
- Try refreshing the page

### Dates Not Highlighting
- Make sure programs have dates in YYYY-MM-DD format
- Check browser console for any errors

### Performance Issues
- If you have 100+ programs, consider pagination
- Calendar may slow down with very large datasets

---

## 📝 Notes

- Calendar view respects all existing filters (status, month, year, search)
- Both calendar and grid views show the same filtered data
- Program registration status is maintained across both views
- Mobile users can swipe to navigate months (future enhancement)

---

*Last Updated: 2025-11-23*
*Feature Version: 1.0*
