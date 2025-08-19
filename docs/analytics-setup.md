# Analytics Setup and Usage

This document explains how to set up and use the analytics functionality in the Malinta Connect application.

## Overview

The analytics system provides real-time insights into barangay operations including:
- **Overview Statistics**: Total counts and month-over-month changes for key metrics
- **Certificate Analytics**: Distribution by type and status
- **Appointment Analytics**: Distribution by type and status  
- **Blotter Analytics**: Distribution by type and status

## Firebase Database Structure

Analytics data is sourced from existing Firebase Realtime Database nodes:

```
residents/          # Resident data for counting
certificates/       # Certificate requests and statuses
appointments/       # Appointment bookings and types
blotter/           # Incident reports and statuses
```

## Server Actions

All Firebase operations are handled through server actions in `app/actions/analytics.ts`:

- `getAllAnalytics()` - Retrieve all analytics data at once
- `getOverviewStats()` - Get overview statistics with counts and changes
- `getCertificateStats()` - Get certificate distribution and status data
- `getAppointmentStats()` - Get appointment distribution and status data
- `getBlotterStats()` - Get blotter report distribution and status data

## Features

### Real-time Data
- Fetches live data from Firebase Realtime Database
- Automatically calculates percentages and distributions
- Updates when underlying data changes

### Time Range Filtering
- **Last 7 days** - Recent activity overview
- **Last 30 days** - Monthly trends (default)
- **Last 90 days** - Quarterly analysis
- **Last year** - Annual comparison

### Interactive Controls
- **Refresh Button**: Manual data refresh with loading states
- **Time Range Selector**: Filter data by different time periods
- **Error Handling**: Graceful fallbacks and retry mechanisms

### Loading States
- Initial loading spinner when fetching data
- Refresh button loading state during updates
- Error states with retry functionality

## Data Sources

### Overview Statistics
- **Total Residents**: Count from `residents/` node
- **Certificate Requests**: Count from `certificates/` node
- **Appointments**: Count from `appointments/` node
- **Blotter Reports**: Count from `blotter/` node

### Certificate Analytics
- **Types**: Barangay Clearance, Residency, Indigency, etc.
- **Statuses**: Processing, Ready, Needs Info, etc.
- **Calculations**: Automatic percentage calculations based on totals

### Appointment Analytics
- **Types**: Consultations, Dispute Resolution, Business Permits, etc.
- **Statuses**: Confirmed, Pending, Cancelled, etc.
- **Real-time**: Updates as appointments are created/modified

### Blotter Analytics
- **Types**: Noise Complaints, Property Damage, Disputes, etc.
- **Statuses**: Under Investigation, Resolved, Needs Info, etc.
- **Trends**: Incident type distribution and resolution rates

## Implementation Details

### Data Processing
- **Aggregation**: Counts and groups data by type and status
- **Percentage Calculation**: Automatic percentage computation for visualizations
- **Error Handling**: Graceful fallbacks for missing or corrupted data

### Performance Optimization
- **Parallel Fetching**: Uses Promise.all for concurrent data retrieval
- **Caching**: Leverages Next.js revalidation for optimal performance
- **Efficient Queries**: Minimal Firebase reads with strategic data fetching

### UI Components
- **Progress Bars**: Visual representation of percentages
- **Trend Indicators**: Up/down arrows with color coding
- **Responsive Grid**: Adapts to different screen sizes
- **Loading States**: Professional loading animations

## Usage

### Accessing Analytics
Navigate to `/admin/analytics` to view the analytics dashboard.

### Refreshing Data
- Click the **Refresh** button to manually update analytics
- Data automatically loads when changing time ranges
- Loading states provide visual feedback during operations

### Interpreting Data
- **Green arrows**: Positive trends (increases)
- **Red arrows**: Negative trends (decreases)
- **Progress bars**: Visual representation of distributions
- **Percentages**: Calculated automatically from raw counts

## Customization

### Adding New Metrics
1. Update the TypeScript interfaces in `app/actions/analytics.ts`
2. Add new data source functions
3. Update the overview statistics array
4. Add corresponding UI components

### Modifying Calculations
- Edit the helper functions for custom calculations
- Modify percentage computation logic
- Add new aggregation methods as needed

### Styling Changes
- Update the progress bar colors and styles
- Modify the trend indicator appearance
- Customize loading animations and states

## Error Handling

### Common Issues
1. **No data available**: Shows appropriate empty state messages
2. **Firebase connection errors**: Displays error messages with retry options
3. **Missing data nodes**: Gracefully handles undefined data structures

### Debug Mode
- Check browser console for detailed error logs
- Verify Firebase database structure and permissions
- Ensure all required data nodes exist

## Dependencies

- Firebase Realtime Database
- Next.js server actions
- React hooks for state management
- Toast notifications system
- UI components from the design system
- Lucide React icons

## Future Enhancements

### Planned Features
- **Export Functionality**: PDF/Excel report generation
- **Advanced Filtering**: Date range pickers and custom filters
- **Real-time Updates**: WebSocket integration for live data
- **Custom Dashboards**: Configurable widget layouts
- **Historical Trends**: Time-series analysis and forecasting

### Performance Improvements
- **Data Caching**: Redis integration for faster queries
- **Background Processing**: Scheduled analytics updates
- **Optimized Queries**: Firebase query optimization
- **Lazy Loading**: Progressive data loading for large datasets

