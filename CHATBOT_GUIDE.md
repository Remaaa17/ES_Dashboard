# SmartOS AI Chat - User Guide

## 💬 Overview

The **AI Chat** page provides a conversational interface to interact with SmartOS AI Assistant. Ask questions in natural language and get intelligent responses about your smart city operations.

---

## 🚀 How to Use

### 1. Navigate to AI Chat
- Click **"AI Chat"** in the sidebar (💬 message icon)
- You'll see the chat interface with a welcome message

### 2. Ask Questions
- Type your question in the input box at the bottom
- Press **Enter** to send (or click the Send button)
- Use **Shift+Enter** for multi-line messages

### 3. Get AI Responses
- The AI analyzes your question with current sensor data
- Responses appear in structured format with:
  - Summary
  - Analysis
  - Detected Issues
  - Predictions
  - Recommendations
  - Risk Level
  - Confidence Score

---

## 💡 Quick Questions

Click any quick question button to instantly ask:
- "What's the current system status?"
- "Are there any anomalies detected?"
- "How can I optimize energy usage?"
- "What's the security risk level?"
- "When should I irrigate next?"
- "Analyze traffic patterns"

---

## 🎯 What You Can Ask

### System Status
- "What's the overall system health?"
- "Give me a status update"
- "How are all systems performing?"
- "Is everything running normally?"

### Anomaly Detection
- "Are there any anomalies?"
- "What problems do you detect?"
- "Is anything unusual happening?"
- "Show me system issues"

### Security (RFID)
- "What's the security status?"
- "Are there any unauthorized access attempts?"
- "When is peak access time?"
- "Analyze RFID patterns"
- "Is there suspicious activity?"

### Smart Lighting
- "How can I save energy?"
- "What's the current lighting status?"
- "Should I adjust street lights?"
- "Optimize lighting schedule"
- "How much energy can I save?"

### Irrigation (Soil)
- "When should I water the plants?"
- "What's the soil moisture level?"
- "Is irrigation needed?"
- "Predict next dry period"
- "Analyze moisture trends"

### Traffic
- "What's the traffic situation?"
- "Is there congestion?"
- "Analyze movement patterns"
- "Predict peak traffic times"

### Device Health
- "Are all sensors working?"
- "What's the system uptime?"
- "Are there any failing devices?"
- "Check device stability"

### Predictions
- "What will happen in the next 24 hours?"
- "Predict future risks"
- "What should I prepare for?"
- "Forecast system behavior"

### Optimization
- "How can I improve efficiency?"
- "Give me optimization recommendations"
- "What can I do better?"
- "Suggest improvements"

---

## 📊 Response Format

Every AI response includes:

### SUMMARY
Quick overview of the situation

### ANALYSIS
Detailed explanation of current conditions

### DETECTED ISSUES
List of problems found (or "None detected")

### PREDICTIONS
What to expect in the near future

### RECOMMENDATIONS
Actionable steps to take (numbered list)

### RISK LEVEL
- **LOW**: Normal conditions
- **MEDIUM**: Attention needed
- **HIGH**: Action required
- **CRITICAL**: Urgent intervention

### CONFIDENCE
Reliability of the analysis (0-100%)

---

## 🎨 Chat Features

### Message History
- All messages are saved in the current session
- Scroll up to review previous conversations
- Auto-scrolls to latest message

### Clear Chat
- Click "Clear Chat" button to start fresh
- Removes all messages except welcome message
- Useful for starting a new topic

### Quick Questions
- Pre-written questions for common tasks
- Click to auto-fill input box
- Appears when chat is empty

### Loading Indicator
- Animated dots show AI is thinking
- Appears while waiting for response
- Typically takes 2-5 seconds

---

## 💬 Conversation Tips

### Be Specific
❌ "Tell me about sensors"  
✅ "What's the current soil moisture level?"

### Ask Follow-ups
✅ "Why is the moisture dropping?"  
✅ "What caused that anomaly?"  
✅ "Explain that recommendation"

### Request Actions
✅ "Should I irrigate now?"  
✅ "Do I need to adjust lighting?"  
✅ "What should I do about the security alert?"

### Compare & Analyze
✅ "Compare today's traffic to yesterday"  
✅ "Analyze the last 24 hours"  
✅ "What changed since this morning?"

---

## 🔍 Example Conversations

### Example 1: System Check
**You**: What's the current system status?

**AI**:  
SUMMARY: All systems operational with minor irrigation attention needed.

ANALYSIS: RFID security showing 89 scans with 100% authorization rate. Lighting at 2704 LUX (daylight conditions). Soil moisture at 42% (optimal range). Traffic sensors detecting normal activity levels. System uptime at 100%.

DETECTED ISSUES: None detected

PREDICTIONS: Soil moisture will drop to 35% within 6 hours based on current evaporation rate.

RECOMMENDATIONS:
- Schedule irrigation for late afternoon
- Continue current lighting schedule
- Monitor soil moisture hourly

RISK LEVEL: LOW  
CONFIDENCE: 92%

---

### Example 2: Energy Optimization
**You**: How can I optimize energy usage?

**AI**:  
SUMMARY: Significant energy savings available through adaptive lighting.

ANALYSIS: Current lighting system operates at fixed schedule. With 3 hours of darkness and low traffic during night hours, adaptive dimming could reduce consumption by 12%.

DETECTED ISSUES: Inefficient lighting schedule detected

PREDICTIONS: Energy costs will remain elevated without schedule adjustment.

RECOMMENDATIONS:
- Enable adaptive dimming during 10 PM - 5 AM
- Integrate motion sensors for zone-based control
- Reduce brightness by 40% during low-traffic periods

RISK LEVEL: LOW  
CONFIDENCE: 88%

---

### Example 3: Security Alert
**You**: Are there any security issues?

**AI**:  
SUMMARY: Security systems stable with no threats detected.

ANALYSIS: 89 RFID scans recorded today, all authorized. Peak access at 9:00 AM with 15 scans. No denied attempts. No unusual night activity. Security score: 100%.

DETECTED ISSUES: None detected

PREDICTIONS: Normal access patterns expected to continue.

RECOMMENDATIONS:
- Maintain current security protocols
- Continue monitoring access logs
- Review peak hour capacity if scans exceed 20/hour

RISK LEVEL: LOW  
CONFIDENCE: 95%

---

## 🛠️ Troubleshooting

### AI Not Responding
**Causes**:
- No internet connection
- Invalid API key
- API rate limit reached

**Solutions**:
1. Check internet connection
2. Verify `.env` file has valid `VITE_GEMINI_API_KEY`
3. Wait a few minutes if rate limited
4. Refresh the page

### Slow Responses
**Normal**: 2-5 seconds per response  
**Slow**: >10 seconds

**Solutions**:
- Check internet speed
- Try shorter questions
- Refresh the page

### Unclear Responses
**Solutions**:
- Ask more specific questions
- Provide context in your question
- Ask follow-up questions for clarification

### Chat Not Clearing
**Solution**: Refresh the browser page

---

## 🔐 Privacy & Data

- All conversations happen via Google Gemini API
- Only aggregated sensor data is sent (no personal info)
- Chat history is stored locally in browser only
- No conversations are saved on servers
- Clearing chat removes all local history

---

## 📱 Mobile Usage

The chat interface is fully responsive:
- Touch-friendly message bubbles
- Scrollable message history
- Mobile-optimized input area
- Quick questions work on mobile

---

## 🎓 Best Practices

### 1. Start Broad, Then Narrow
1. "What's the system status?" (broad)
2. "Tell me more about the soil moisture" (narrow)
3. "Why is it dropping?" (specific)

### 2. Use Context
Instead of: "What's the status?"  
Say: "What's the RFID security status right now?"

### 3. Ask for Explanations
- "Why is that happening?"
- "Explain that anomaly"
- "What caused the spike?"

### 4. Request Comparisons
- "Compare to yesterday"
- "Is this normal?"
- "How does this compare to last week?"

### 5. Get Actionable Advice
- "What should I do?"
- "Give me specific steps"
- "How do I fix this?"

---

## 🚀 Advanced Usage

### Multi-Part Questions
"What's the soil moisture level, and when should I irrigate, and how much water is needed?"

### Conditional Questions
"If the moisture drops below 30%, what should I do?"

### Scenario Planning
"What happens if I don't irrigate for 2 days?"

### Optimization Queries
"Find the most energy-efficient lighting schedule for my traffic patterns"

---

## 🔄 When to Use Chat vs Predictions

### Use AI Chat When:
- ✅ You have specific questions
- ✅ You need conversational interaction
- ✅ You want to explore different topics
- ✅ You need quick answers
- ✅ You want to ask follow-ups

### Use AI Predictions When:
- ✅ You need comprehensive system analysis
- ✅ You want structured reports
- ✅ You need all domains analyzed at once
- ✅ You're doing routine system checks
- ✅ You need formal documentation

---

## 💡 Pro Tips

✅ **Save important responses** - Copy/paste critical recommendations  
✅ **Ask follow-ups** - Dig deeper into any topic  
✅ **Use quick questions** - Fast access to common queries  
✅ **Be conversational** - The AI understands natural language  
✅ **Request specifics** - Ask for numbers, percentages, timings  
✅ **Compare periods** - Ask about trends and changes  
✅ **Get explanations** - Don't hesitate to ask "why?"  

---

## 📞 Need More Help?

- **Full Dashboard Guide**: `DASHBOARD_FUNCTIONS.md`
- **AI Predictions Guide**: `AI_PREDICTIONS_GUIDE.md`
- **System Prompt**: `SMARTOS_AI_SYSTEM_PROMPT.md`
- **Quick Start**: `AI_QUICK_START.md`

---

**Ready to chat?** Navigate to AI Chat and start asking questions! 💬🚀
