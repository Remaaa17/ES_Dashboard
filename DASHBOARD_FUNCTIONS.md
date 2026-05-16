# SmartOS Dashboard - Complete Functions Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Page-by-Page Functions](#page-by-page-functions)
4. [Data Analytics](#data-analytics)
5. [AI Integration](#ai-integration)
6. [Export Functions](#export-functions)
7. [Real-time Features](#real-time-features)

---

## Overview

SmartOS is a real-time Smart City IoT dashboard that monitors and analyzes data from ESP32 sensor nodes. It provides comprehensive analytics, AI-powered insights, and actionable recommendations for city operations.

### Technology Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **Charts**: Recharts
- **AI**: Google Gemini API
- **Icons**: Lucide React

---

## Core Features

### 1. Real-time Data Synchronization
- **Live Updates**: Subscribes to Supabase realtime channels for instant sensor data
- **Auto-refresh**: Dashboard updates automatically when new data arrives
- **Last Update Timestamp**: Shows exact time of last data sync
- **Connection Status**: Visual indicator showing system online/offline status

### 2. Multi-Sensor Support
The dashboard monitors 6 types of sensors:
- **RFID**: Security access control and authentication
- **IR1 & IR2**: Motion detection for traffic monitoring
- **LDR**: Light intensity for smart lighting control
- **Soil Moisture**: Irrigation management
- **Device Status**: System health monitoring

### 3. Dark/Light Mode
- Toggle between dark and light themes
- Persistent across sessions
- Optimized for both day and night viewing

### 4. Responsive Design
- Mobile-first approach
- Adapts to all screen sizes (mobile, tablet, desktop)
- Collapsible sidebar on smaller screens

---

## Page-by-Page Functions

### 🏠 Overview Page

**Purpose**: High-level system health dashboard

**Key Metrics**:
- **Security Score**: Total RFID scans for the day
- **Environment Index**: Average light level (LUX)
- **System Reliability**: Uptime percentage

**Visualizations**:
- **Multi-Sensor Activity Chart**: Combined real-time data from all sensors
  - Area chart showing sensor value trends
  - Bar overlay for quick value comparison
  - Last 40 readings displayed

**Intelligence Stream**:
- Live notification feed
- Critical alerts (waste overflow, security events)
- Scrollable history of system events
- Color-coded by severity (info, warning, error)

---

### 🛡️ RFID Security Page

**Purpose**: Access control monitoring and security analytics

**Key Metrics**:
1. **Total Scans**: Daily access attempts
2. **Authorized**: Successful entries
3. **Denied**: Blocked access attempts
4. **Peak Hour**: Busiest time of day
5. **Security Score**: Success rate percentage (Authorized/Total × 100)

**Analytics**:

**24-Hour Access Pattern**:
- Hourly distribution chart
- Identifies peak and off-peak periods
- Area chart with gradient fill
- Helps with capacity planning

**Time Period Distribution**:
- Pie chart showing access by time of day:
  - Morning (6-12)
  - Afternoon (12-18)
  - Evening (18-24)
  - Night (0-6)

**Top 3 Peak Hours**:
- Ranked busiest hours
- Shows scan count for each
- Visual progress bars
- Color-coded (1st: emerald, 2nd: blue, 3rd: purple)

**Recent Access Log**:
- Last 5 RFID authentications
- Shows: Time, Card UID, Location, Status
- Status badges: ✅ Authorized / ❌ Denied

**System Alerts**:
- No activity warnings
- Unauthorized access attempts
- High congestion alerts
- Unusual night activity notifications

**Calculated Insights**:
- Growth rate (first half vs second half of day)
- Security score trending
- Congestion predictions

---

### 💡 Smart Lighting Page

**Purpose**: Energy optimization and ambient light monitoring

**Key Metrics**:
1. **Ambient Light**: Average LUX reading
2. **Darkness Hours**: Daily dark period duration
3. **Energy Savings**: Potential reduction percentage
4. **Transitions**: Day/night switch count

**Analytics**:

**24-Hour Light Intensity**:
- Real-time ambient light levels
- Area chart with yellow gradient
- Shows natural light patterns
- Helps optimize street lighting schedules

**Day vs Night Distribution**:
- Pie chart showing daylight vs darkness percentage
- Visual representation of energy-saving opportunities

**Lighting Efficiency Score**:
- Radial gauge (0-100%)
- Measures system responsiveness to light changes
- Color-coded: Green (>70%), Amber (40-70%), Red (<40%)

**Light Level Comparison**:
- Bar chart comparing:
  - Day average
  - Night average
  - Overall average
- Helps identify anomalies

**Smart Lighting Recommendations**:
1. **Auto-Dimming**: Enable during darkness hours
2. **Motion Sensors**: Zone-based control integration
3. **Adaptive Schedule**: Adjust based on daily transitions

**System Insights**:
- Low ambient light warnings
- Sensor calibration alerts
- Seasonal adjustment recommendations
- Extended darkness optimization tips

**Calculations**:
- Potential savings = (darkness hours / 24) × 100
- Efficiency = min(100, (transitions / 10) × 100)
- Day/night averages based on 1500 LUX threshold

---

### 🌱 Soil & Irrigation Page

**Purpose**: Smart irrigation management and moisture monitoring

**Key Metrics**:
1. **Current Moisture**: Real-time soil moisture percentage
2. **Stability Score**: System consistency (100 - variability)
3. **Variability**: Fluctuation range (±%)
4. **Next Irrigation**: Days until watering needed

**Analytics**:

**Moisture Trend (30 Readings)**:
- Line chart with optimal zone indicators
- Reference lines at 30% (dry) and 70% (wet)
- Color-coded dots for each reading
- Shows moisture trajectory

**Moisture State Distribution**:
- Bar chart showing time spent in:
  - Dry (<30%): Red
  - Optimal (30-70%): Green
  - Wet (>70%): Blue

**Current Status Gauge**:
- Radial gauge showing current moisture
- Color changes based on level:
  - Red: <30% (Dry)
  - Green: 30-70% (Optimal)
  - Blue: >70% (Wet)

**Stacked Moisture Analysis**:
- Stacked area chart
- Shows dry/optimal/wet zones over time
- Helps identify irrigation patterns

**Smart Irrigation Recommendations**:

1. **Watering Status**:
   - Immediate irrigation (<30%)
   - Reduce watering (>70%)
   - Maintain schedule (30-70%)

2. **Trend Analysis**:
   - Increasing/Decreasing/Stable
   - Variability assessment
   - System stability evaluation

3. **Optimization**:
   - Days until next irrigation
   - Monitoring frequency recommendations
   - System status checks

**Irrigation Alerts**:
- Critical drought warnings (<20%)
- Low moisture alerts (<30%)
- Excessive moisture warnings (>80%)
- High variability notifications (>40%)
- Rapid moisture loss alerts

**Calculations**:
- Days until irrigation = (current - 30) / 5
- Stability score = 100 - variability
- Trend = last 10 readings comparison

---

### ℹ️ About Page

**Purpose**: Project information and technical details

**Content**:
- Project overview and mission
- Technology stack details
- Data pipeline architecture
- System capabilities

---

## Data Analytics

### Analytics Engine (`src/utils/analytics.js`)

The dashboard calculates comprehensive analytics from raw sensor data:

**RFID Analytics**:
- Hourly scan distribution (24-hour array)
- Total scan count
- Last 5 access logs
- Peak hour identification
- Authorized vs unauthorized ratio

**Motion Analytics**:
- IR1 event count
- IR2 event count
- Traffic pattern analysis

**Light Analytics**:
- Average LDR value
- 24-hour light history
- Darkness duration (hours)
- Day/night threshold crossings
- Day vs night distribution

**Soil Analytics**:
- Current moisture level
- Moisture status (Dry/Optimal/Wet)
- Variability range
- 30-reading history
- Dry/Optimal/Wet distribution

**System Analytics**:
- Uptime percentage
- Device status tracking
- Connection stability

### Mock Data Generation
When real data is unavailable (<50 readings), the system generates realistic mock data for testing and demonstration.

---

## AI Integration

### Google Gemini API Integration

**Purpose**: Provide contextual, predictive insights for each dashboard section

**How It Works**:
1. User clicks "AI Forecast" button
2. System sends current analytics + context to Gemini
3. AI analyzes data and provides recommendations
4. Response displayed in clean, readable format

**AI Prompts by Page**:

**Overview**:
- Strategic city health assessment
- Security, environmental, and technical status summary
- Preventive advice

**RFID**:
- Peak traffic predictions (next 24 hours)
- Security risk analysis
- Congestion forecasting

**Lighting**:
- Energy-saving schedule suggestions
- Optimal lighting times
- Seasonal adjustments

**Soil**:
- Next dry period prediction
- Irrigation timing recommendations
- Moisture trend analysis

**Features**:
- Context-aware prompts
- Professional, concise English
- Markdown-free responses
- Cached per tab for quick access

---

## Export Functions

### CSV Export

**What It Includes**:
- All key metrics from current view
- Section-organized data
- AI insights for active tab
- Timestamp

**Format**:
```csv
Section,Metric,Value
Security,RFID Scans,89
Motion,IR1 Count,100
...
AI,Insight (overview),"Strategic assessment..."
```

**Filename**: `smartcity_report_YYYY-MM-DDTHH-MM-SS.csv`

### PDF Export

**Enhanced Professional Design**:

**Page 1 - Overview**:
- Branded header with logo
- System status badge
- Metric cards with color-coded accents
- All key statistics

**Page 2 - AI Insights**:
- Highlighted insight section
- Clean typography
- Easy-to-read format

**Page 3 - Recommendations**:
- Numbered recommendation list
- Professional card layout
- Actionable items

**Design Features**:
- Color-coded sections (Indigo, Emerald, Amber, Rose)
- Rounded corners and modern cards
- Professional footer with page numbers
- Automatic pagination
- Accent bars on metric cards

**Filename**: `SmartOS_Report_YYYY-MM-DD.pdf`

---

## Real-time Features

### Supabase Integration

**Connection**:
- Automatic connection on app load
- Environment variable configuration
- Error handling and fallback

**Realtime Subscription**:
```javascript
supabase
  .channel('smart-city-realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sensor_data'
  }, handleNewData)
  .subscribe()
```

**Critical Alerts Processing**:
- Ultrasonic sensor: Waste bin overflow (>90%)
- RFID: Security access events
- Automatic notification generation

### Notification System

**Features**:
- Real-time alert feed
- Color-coded by type (info, warning, error)
- Timestamp for each notification
- Auto-limit to 10 most recent
- Dismissible (via UI component)

**Notification Types**:
- **Info**: General system events (RFID access)
- **Warning**: Attention needed (low moisture)
- **Error**: Critical issues (bin overflow)

---

## Custom Hooks

### `useSupabase`
- Initializes Supabase client
- Manages connection state
- Handles loading states

### `useSensorData`
- Fetches initial data
- Subscribes to realtime updates
- Processes new readings
- Maintains data history (last 600 readings)

### `useNotifications`
- Manages notification state
- Provides add/remove functions
- Auto-limits notification count

### `useAI`
- Handles Gemini API calls
- Manages loading states
- Caches insights per tab
- Error handling

---

## Configuration

### Environment Variables (`.env`)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### Constants (`src/config/constants.js`)

**Sensor Types**:
- RFID, IR1, IR2, LDR, SOIL, DEVICE_STATUS

**Thresholds**:
- Soil Dry: 30%
- Soil Wet: 70%
- LDR Darkness: 800 LUX
- LDR Threshold: 1500 LUX

**Chart Colors**:
- Blue, Indigo, Purple, Emerald, Rose, Amber, Yellow, Cyan

---

## Performance Optimizations

1. **useMemo**: Analytics calculated only when data changes
2. **Lazy Loading**: Components loaded on-demand
3. **Efficient Rendering**: Only active tab rendered
4. **Data Limiting**: Last 600 readings kept in memory
5. **Debounced Updates**: Prevents excessive re-renders

---

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast color schemes
- Readable font sizes
- Screen reader friendly

---

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design

---

## Future Enhancements

Potential features for future versions:
- Historical data comparison
- Custom date range selection
- User authentication and roles
- Multi-location support
- Email/SMS alerts
- Predictive maintenance scheduling
- Integration with city management systems

---

## Support & Documentation

For setup instructions, see:
- `README.md` - General overview
- `START_HERE.md` - Quick start guide
- `SUPABASE_SETUP_GUIDE.md` - Database configuration
- `NEW_PAGES_GUIDE.md` - Adding custom pages

---

**Last Updated**: May 2026  
**Version**: 2.0  
**Dashboard Type**: Smart City IoT Monitoring Platform
