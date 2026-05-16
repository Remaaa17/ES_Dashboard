# SmartOS AI Predictions - User Guide

## 🧠 Overview

The **AI Predictions** page is powered by SmartOS AI Core, an advanced artificial intelligence system designed specifically for smart city operations. It analyzes real-time sensor data and provides comprehensive operational insights.

---

## 🚀 How to Use

### 1. Navigate to AI Predictions
- Click **"AI Predictions"** in the sidebar (sparkle icon ✨)
- You'll see the AI Predictions dashboard

### 2. Generate AI Forecast
- Click the **"Generate AI Forecast"** button
- The system will analyze all current sensor data
- Wait 3-5 seconds for AI processing
- Results will appear in structured sections

### 3. Review AI Analysis
The AI provides comprehensive analysis across multiple sections:

---

## 📊 AI Analysis Sections

### 🎯 System Summary
**What it shows**: Overall city/system health assessment
- High-level status of all systems
- Critical issues requiring attention
- General operational state

### 📈 Realtime Analysis
**What it shows**: Detailed interpretation of current conditions
- Current sensor readings analysis
- Threshold violations
- Operational patterns
- Immediate concerns

### 🔮 Predictions
**What it shows**: Future forecasts (next 24 hours)
- Expected sensor value changes
- Predicted peak periods
- Anticipated issues
- Trend projections

### ⚠️ Anomalies Detected
**What it shows**: Unusual patterns or behaviors
- Abnormal sensor readings
- Suspicious activity
- Impossible value jumps
- Sensor malfunctions
- "None detected" if all normal

### 💡 Smart Lighting Insights
**What it shows**: Energy optimization analysis
- Current lighting efficiency
- Energy-saving opportunities
- Adaptive brightness recommendations
- Predicted darkness duration
- Estimated savings percentage

### 🛡️ Security Analysis
**What it shows**: RFID and access control insights
- Access pattern analysis
- Suspicious activity detection
- Peak hour predictions
- Congestion forecasts
- Security score assessment

### 💧 Irrigation Analysis
**What it shows**: Soil moisture and watering insights
- Current moisture status
- Next irrigation timing
- Drought risk assessment
- Watering optimization
- Moisture trend analysis

### 🚦 Traffic Analysis
**What it shows**: Movement and congestion insights
- Traffic density estimation
- Congestion predictions
- Peak period forecasts
- Flow optimization recommendations

### ⚡ Device Health
**What it shows**: System reliability analysis
- Uptime assessment
- Connection stability
- Sensor reliability
- Failure predictions
- Maintenance recommendations

### 📋 Recommendations
**What it shows**: Actionable operational advice
- Numbered list of specific actions
- Prioritized by importance
- Practical implementation steps
- Preventive measures

### 💰 Estimated Energy Savings
**What it shows**: Potential cost reduction
- Percentage or monetary value
- Based on lighting optimization
- Achievable through recommendations

### 🎚️ Risk Level
**What it shows**: Overall operational risk
- **LOW**: Normal conditions
- **MEDIUM**: Attention required soon
- **HIGH**: Immediate action recommended
- **CRITICAL**: Urgent intervention required

### 📊 Confidence
**What it shows**: AI prediction reliability
- Percentage (0-100%)
- Based on data quality and patterns
- Higher = more reliable predictions

---

## 🎨 Visual Features

### Color-Coded Risk Levels
- 🟢 **Green (Emerald)**: LOW risk
- 🟡 **Yellow**: MEDIUM risk
- 🟠 **Orange**: HIGH risk
- 🔴 **Red (Rose)**: CRITICAL risk

### Section Icons
- 🧠 Brain: System Summary
- 📊 Activity: Realtime Analysis
- 📈 Trending Up: Predictions
- ⚠️ Alert: Anomalies
- ☀️ Sun: Lighting
- 🛡️ Shield: Security
- 💧 Droplets: Irrigation
- ⚡ Zap: Device Health
- ✨ Sparkles: Recommendations

---

## 🔄 When to Generate New Forecasts

Generate a new AI forecast when:
- ✅ Significant sensor value changes occur
- ✅ New alerts or notifications appear
- ✅ You need updated predictions (every 1-2 hours)
- ✅ After implementing recommendations
- ✅ When investigating specific issues
- ✅ Before making operational decisions

---

## 💡 Best Practices

### 1. Regular Monitoring
- Generate forecasts every 1-2 hours during active operations
- More frequently during critical periods
- Before and after major system changes

### 2. Act on Recommendations
- Prioritize CRITICAL and HIGH risk items
- Implement recommendations in order
- Document actions taken
- Re-generate forecast after changes

### 3. Compare Predictions vs Reality
- Track prediction accuracy
- Note when forecasts were correct/incorrect
- Use insights to improve operations

### 4. Cross-Reference with Other Pages
- Check specific sensor pages for details
- Verify AI insights with raw data
- Use Overview page for quick status checks

### 5. Energy Optimization
- Focus on lighting recommendations
- Implement adaptive schedules
- Monitor savings estimates
- Adjust based on results

---

## 🔍 Understanding AI Logic

### Smart Lighting Rules
```
IF ambient light < 800 LUX:
  → Classified as DARK
  → Recommend increased lighting

IF ambient light > 1500 LUX:
  → Classified as DAYLIGHT
  → Recommend dimming/shutdown

IF low traffic + darkness:
  → Recommend adaptive dimming

IF high traffic + darkness:
  → Prioritize safety lighting
```

### Soil Moisture Rules
```
DRY: < 30%
  → Immediate irrigation needed

OPTIMAL: 30-70%
  → Maintain current schedule

WET: > 70%
  → Reduce watering
```

### Security Analysis
```
Analyzes:
- Access frequency patterns
- Denied attempt clusters
- Unusual time activity
- Repeated failures
- Congestion periods

Detects:
- Brute-force attempts
- Cloned card behavior
- Suspicious patterns
```

---

## 🛠️ Troubleshooting

### "No AI Analysis Generated Yet"
**Solution**: Click "Generate AI Forecast" button

### "Analyzing System Data..."
**Status**: AI is processing (wait 3-5 seconds)

### "Error: AI connection timeout"
**Causes**:
- No internet connection
- Gemini API key invalid
- API rate limit reached

**Solutions**:
1. Check internet connection
2. Verify `.env` file has valid `VITE_GEMINI_API_KEY`
3. Wait a few minutes if rate limited
4. Try again

### Incomplete or Strange Responses
**Causes**:
- Insufficient sensor data
- API response truncated
- Unusual data patterns

**Solutions**:
1. Wait for more sensor data to accumulate
2. Check that sensors are connected
3. Regenerate forecast
4. Check "View Raw AI Output" for details

---

## 📱 Mobile Usage

The AI Predictions page is fully responsive:
- All sections stack vertically on mobile
- Touch-friendly buttons
- Readable text sizes
- Scrollable content

---

## 🔐 Data Privacy

- All AI analysis happens via Google Gemini API
- Only aggregated sensor data is sent (no personal info)
- No data is stored by the AI service
- Responses are cached locally in browser only

---

## 🎯 Use Cases

### 1. Daily Operations Review
**When**: Start of shift
**Action**: Generate forecast to understand current status
**Focus**: System Summary, Risk Level, Recommendations

### 2. Energy Optimization
**When**: Planning lighting schedules
**Action**: Review Smart Lighting Insights
**Focus**: Energy Savings, Adaptive strategies

### 3. Security Monitoring
**When**: Investigating access patterns
**Action**: Check Security Analysis section
**Focus**: Anomalies, suspicious activity, peak hours

### 4. Irrigation Planning
**When**: Scheduling watering
**Action**: Review Irrigation Analysis
**Focus**: Next irrigation time, moisture trends

### 5. Preventive Maintenance
**When**: Weekly system checks
**Action**: Review Device Health and Predictions
**Focus**: Failure predictions, maintenance needs

### 6. Incident Investigation
**When**: After alerts or issues
**Action**: Generate forecast and check Anomalies
**Focus**: Root cause, related issues

---

## 📊 Example Interpretation

### Sample AI Response:

```
RISK LEVEL: MEDIUM
CONFIDENCE: 85%

SYSTEM SUMMARY:
City operations stable with minor irrigation attention needed.
Security systems performing optimally. Lighting efficiency at 78%.

ANOMALIES DETECTED:
Soil moisture dropping faster than expected (5% in 2 hours).
Possible sensor drift or increased evaporation.

RECOMMENDATIONS:
- Schedule irrigation within next 6 hours
- Monitor soil sensor for calibration issues
- Enable adaptive lighting for 12% energy savings
```

### How to Act:
1. ✅ Note MEDIUM risk - attention needed but not urgent
2. ✅ 85% confidence - predictions are reliable
3. ✅ Irrigation is priority (anomaly detected)
4. ✅ Schedule watering in next 6 hours
5. ✅ Check soil sensor calibration
6. ✅ Enable adaptive lighting (bonus optimization)

---

## 🚀 Advanced Features

### Raw AI Output
- Click "View Raw AI Output" at bottom of page
- See complete unprocessed AI response
- Useful for debugging or detailed analysis
- Shows exact text from Gemini API

### Confidence Scoring
- **Low (0-50%)**: Insufficient data, use caution
- **Medium (51-75%)**: Partial patterns, reasonable reliability
- **High (76-100%)**: Strong consistency, high reliability

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review `SMARTOS_AI_SYSTEM_PROMPT.md` for technical details
3. Check `DASHBOARD_FUNCTIONS.md` for general dashboard help
4. Verify `.env` configuration
5. Check browser console for errors

---

**Last Updated**: May 2026  
**AI Model**: Google Gemini 2.5 Flash  
**System**: SmartOS AI Core v2.0
