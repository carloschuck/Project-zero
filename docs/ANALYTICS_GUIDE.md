# Analytics & Reports - Feature Guide

## 🎉 New Analytics Features

The Analytics page has been **completely redesigned** with comprehensive metrics, turnaround time tracking, and staff performance analysis.

---

## 📊 Key Metrics Dashboard

### 1. **Total Requests**
- Total number of requests in the selected time period
- Filterable by date range

### 2. **Resolution Rate**
- Percentage of requests that have been resolved or closed
- Formula: `(Resolved + Closed) / Total × 100`

### 3. **Average Turnaround** ⭐ NEW
- Average time from request creation to resolution
- Calculated from `resolved_at` timestamp
- Shows number of resolved tickets used in calculation

### 4. **Active Requests**
- Sum of Open + In Progress requests
- Helps identify current workload

---

## ⏱️ Turnaround Time Analysis ⭐ NEW

### Comprehensive Time Metrics

The system now tracks and displays detailed turnaround statistics:

#### **Average Turnaround**
- Mean time to resolve requests
- Calculated from `created_at` to `resolved_at`

#### **Median Turnaround**
- Middle value of all turnaround times
- Better represents typical resolution time (not affected by outliers)

#### **Fastest Resolution**
- Minimum turnaround time achieved
- Shows best-case scenario

#### **Slowest Resolution**
- Maximum turnaround time
- Identifies areas for improvement

### Time Format
- **Hours**: For resolutions under 24 hours (e.g., "18h")
- **Days + Hours**: For longer resolutions (e.g., "3d 5h")
- **Days**: For multi-day resolutions (e.g., "5d")

---

## 🎯 Turnaround by Priority ⭐ NEW

Tracks average resolution time for each priority level:

| Priority | Description | Target Time |
|----------|-------------|-------------|
| **Urgent** | Critical issues | Fastest resolution |
| **High** | Important issues | Quick resolution |
| **Medium** | Normal issues | Standard resolution |
| **Low** | Minor issues | Can take longer |

**Insights:**
- Identify if high-priority requests are being resolved faster
- Spot potential SLA violations
- Optimize priority handling

---

## 📈 Turnaround by Category ⭐ NEW

Shows average turnaround time for each request category:

- Identifies which categories take longest to resolve
- Helps allocate resources to slow categories
- Reveals process bottlenecks

**Example Use Cases:**
- "IT Support" category averages 2.5 days
- "Events" category averages 5.8 days → needs more resources
- "Facilities" category averages 1.2 days → performing well

---

## ⚡ Response Metrics ⭐ NEW

### 1. **Average Time to Assignment**
- How quickly new requests are assigned to staff
- Calculated from `created_at` to first assignment
- Lower is better for faster response

### 2. **Active Backlog**
- Current number of Open + In Progress requests
- Helps monitor workload trends
- Alert when backlog is growing

### 3. **Completion Rate**
- Number of requests resolved in selected period
- Tracks team productivity

---

## 👥 Staff Performance ⭐ NEW

Comprehensive performance tracking for each staff member:

### Metrics Tracked:

| Metric | Description |
|--------|-------------|
| **Total** | Total requests assigned |
| **Resolved** | Successfully completed requests |
| **Active** | Currently open/in-progress |
| **Success Rate** | Resolution rate percentage |
| **Avg. Turnaround** | Average time to resolve |

### Performance Indicators:

**Success Rate Color Coding:**
- 🟢 **Green (75%+)**: Excellent performance
- 🟡 **Yellow (50-74%)**: Good performance
- 🔴 **Red (<50%)**: Needs improvement

### Use Cases:
- Identify top performers
- Distribute workload evenly
- Provide targeted training
- Recognize high achievers
- Optimize team assignments

---

## 📅 Date Range Filtering

Filter all analytics by time period:

- **All Time**: Complete historical data
- **Today**: Current day only
- **This Week**: Monday to today
- **This Month**: 1st of month to today
- **Last Month**: Full previous month
- **This Year**: January 1st to today
- **Custom Range**: Select specific start and end dates

All metrics automatically recalculate for selected period.

---

## 📊 Visual Analytics

### Status Distribution
- **Open**: Yellow progress bar
- **In Progress**: Blue progress bar
- **Resolved**: Green progress bar
- **Closed**: Gray progress bar

Shows percentage and count for each status.

### Priority Distribution
- **Urgent**: Red (highest priority)
- **High**: Orange
- **Medium**: Yellow
- **Low**: Green

Visualizes request priority breakdown.

### Category Distribution
- Top 6 categories by volume
- Shows count and percentage
- Color-coded progress bars

---

## 📥 Export Reports ⭐ ENHANCED

Export comprehensive CSV reports with:

### Request Data:
- Request Number
- Subject
- Status
- Priority
- Category
- Created At
- **Resolved At** ⭐ NEW
- **Turnaround (hours)** ⭐ NEW
- Assigned To

### Summary Statistics:
- Total Requests
- Resolved Requests
- Resolution Rate
- **Average Turnaround** ⭐ NEW
- **Median Turnaround** ⭐ NEW
- **Min Turnaround** ⭐ NEW
- **Max Turnaround** ⭐ NEW

**File Format:**
```
analytics_report_[TIME_PERIOD]_[DATE].csv
Example: analytics_report_THIS_MONTH_2025-10-03.csv
```

---

## 🔍 How Turnaround Time is Calculated

### Database Tracking:

1. **Request Created**: `created_at` timestamp is set
2. **Request Resolved**: When status changes to "resolved" or "closed":
   - `resolved_at` timestamp is automatically set
   - Only set once (first time resolved)
3. **Turnaround Calculation**: `resolved_at - created_at`

### Formula:
```javascript
turnaroundTime = differenceInHours(resolved_at, created_at)
```

### What's Included:
- ✅ Time from submission to resolution
- ✅ Includes weekends and off-hours
- ✅ Measured in hours (converted to days for display)
- ✅ Only calculated for resolved/closed tickets

### What's NOT Included:
- ❌ Draft or abandoned requests
- ❌ Requests without `resolved_at` timestamp
- ❌ Requests that were reopened (uses first resolution)

---

## 💡 Best Practices

### For Admins:

1. **Monitor Turnaround Times**
   - Check weekly/monthly trends
   - Set target turnaround times per category
   - Alert when averages increase

2. **Balance Staff Workload**
   - Review staff performance metrics
   - Redistribute if some staff overloaded
   - Recognize top performers

3. **Optimize Categories**
   - Identify slow categories
   - Add resources or improve processes
   - Set category-specific SLAs

4. **Use Date Filters**
   - Compare month-over-month
   - Identify seasonal trends
   - Track improvement initiatives

### For Reporting:

1. **Export Regular Reports**
   - Weekly for management
   - Monthly for stakeholders
   - Quarterly for planning

2. **Track KPIs**
   - Resolution rate goal: >85%
   - Average turnaround: <48 hours
   - Time to assignment: <4 hours
   - Staff success rate: >75%

3. **Identify Trends**
   - Growing backlog = need more staff
   - Slow turnaround = process issues
   - Low resolution rate = training needed

---

## 🎯 Key Performance Indicators (KPIs)

### Organizational Goals:

| KPI | Target | Status |
|-----|--------|--------|
| Resolution Rate | >85% | 🎯 Track on dashboard |
| Avg. Turnaround | <2 days | ⏱️ Monitor trends |
| Time to Assignment | <4 hours | ⚡ Optimize workflow |
| Active Backlog | <20 requests | 📊 Manage workload |

### Individual Goals:

| KPI | Target | Status |
|-----|--------|--------|
| Staff Success Rate | >75% | 👤 Track performance |
| Staff Avg. Turnaround | <3 days | ⏱️ Coaching opportunity |
| Staff Active Load | <10 requests | 📋 Balance assignments |

---

## 📱 Responsive Design

All analytics are fully responsive:
- 📱 **Mobile**: Stacked cards, vertical layout
- 📱 **Tablet**: 2-column grid
- 💻 **Desktop**: 3-4 column grid with full tables

---

## 🔄 Real-Time Updates

Analytics update automatically when:
- ✅ New requests are created
- ✅ Status changes occur
- ✅ Requests are assigned
- ✅ Requests are resolved
- ✅ Date range filter changes

No page refresh needed!

---

## 📊 Future Enhancements (Roadmap)

### Coming Soon:
- 📈 **Time Series Charts**: Line graphs showing trends over time
- 📉 **Trend Arrows**: Up/down indicators vs. previous period
- 🕐 **Peak Times Analysis**: Busiest hours/days for submissions
- 📧 **SLA Tracking**: Set targets and track compliance
- ⭐ **Satisfaction Scores**: Track user feedback
- 🎯 **Goal Setting**: Set and track team goals
- 📅 **Scheduled Reports**: Auto-email weekly/monthly reports
- 🔔 **Anomaly Detection**: Alert on unusual patterns

### Advanced Features:
- 🤖 **Predictive Analytics**: Forecast future workload
- 🧠 **AI Insights**: Automated suggestions for improvement
- 📊 **Custom Dashboards**: Build your own views
- 🔗 **API Access**: Export data programmatically

---

## 🛠️ Technical Details

### Database Changes:
- ✅ `resolved_at` timestamp properly tracked
- ✅ Set automatically when status → resolved/closed
- ✅ Indexed for fast queries

### Performance:
- ✅ Loads up to 10,000 requests efficiently
- ✅ Client-side filtering for instant updates
- ✅ Optimized calculations

### Calculations:
- ✅ All times in hours, converted for display
- ✅ Median uses sorted array middle value
- ✅ Averages calculated from filtered datasets
- ✅ Percentages rounded to whole numbers

---

## 🎓 Training Resources

### For New Admins:
1. Start with "All Time" view to see full picture
2. Use "This Month" for current performance
3. Check "Last Month" for monthly comparisons
4. Export reports for leadership meetings

### For Managers:
1. Review staff performance weekly
2. Monitor turnaround by category
3. Track backlog growth
4. Set realistic targets based on data

### For Executives:
1. Focus on resolution rate and turnaround
2. Compare month-over-month trends
3. Review exported summary statistics
4. Use data for resource planning

---

## 🎉 Summary

The enhanced Analytics page now provides:

✅ **Turnaround Time Tracking** - Complete metrics (avg, median, min, max)  
✅ **Category Analysis** - Resolution time by category  
✅ **Priority Tracking** - Turnaround by priority level  
✅ **Staff Performance** - Individual metrics and success rates  
✅ **Response Metrics** - Time to assignment, backlog tracking  
✅ **Enhanced Exports** - Comprehensive CSV with all new data  
✅ **Visual Analytics** - Beautiful charts and progress bars  
✅ **Date Filtering** - Flexible time period selection  

**Result:** Data-driven decisions, improved performance, and better resource allocation! 🚀

---

**Happy Analyzing! 📊**

