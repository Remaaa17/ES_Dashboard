import { useState } from 'react';
import { GEMINI_API_KEY } from '../config/constants';

export const useAI = (addNotification) => {
  const [aiInsight, setAiInsight] = useState({});
  const [isAiLoading, setIsAiLoading] = useState(false);

  const buildSmartOSPrompt = (activeTab, context) => {
    // Build comprehensive data context
    const dataContext = `
Realtime SmartOS Sensor Data:

RFID:
- Total Scans: ${context.rfidCount || 0}
- Authorized: ${context.rfidLast5?.filter(l => l.access_granted === true).length || 0}
- Denied: ${context.rfidLast5?.filter(l => l.access_granted === false).length || 0}
- Peak Hour: ${context.rfidHourly?.sort((a,b) => b.count - a.count)[0]?.hour || 'N/A'}
- Recent Activity: ${context.rfidCount > 0 ? 'Active' : 'No activity'}

LIGHTING:
- Current LUX: ${context.avgLdr || 0}
- Darkness Hours: ${context.darknessDuration || 0}
- Transitions: ${context.thresholdCrossings || 0}
- Status: ${context.avgLdr < 800 ? 'DARK' : context.avgLdr > 1500 ? 'DAYLIGHT' : 'TWILIGHT'}

SOIL:
- Current Moisture: ${context.lastSoilVal || 0}%
- Status: ${context.moistureStatus || 'Unknown'}
- Variability: ±${context.moistureVariability || 0}%
- Stability Score: ${Math.max(0, 100 - (context.moistureVariability || 0))}%

TRAFFIC:
- IR1 Events: ${context.ir1Count || 0}
- IR2 Events: ${context.ir2Count || 0}
- Total Motion: ${(context.ir1Count || 0) + (context.ir2Count || 0)}

DEVICE STATUS:
- Uptime: ${context.uptime || 0}%
- Connection: ${context.uptime > 95 ? 'Stable' : context.uptime > 80 ? 'Moderate' : 'Unstable'}

THRESHOLDS:
- Soil Dry: 30%
- Soil Wet: 70%
- Darkness: 800 LUX
- Daylight: 1500 LUX
`;

    const userRequests = {
      overview: "Provide a comprehensive system health assessment covering all sensors and predict any operational risks for the next 24 hours.",
      rfid: "Analyze security patterns, predict peak access times, and identify any suspicious activity or congestion risks.",
      lighting: "Analyze lighting conditions, predict energy optimization opportunities, and recommend adaptive lighting strategies.",
      soil: "Analyze irrigation status, predict next watering time, and recommend moisture management strategies.",
      motion: "Analyze traffic patterns, predict congestion, and recommend traffic management strategies.",
      waste: "Analyze waste bin levels and predict collection schedule optimization.",
      system: "Analyze system health, predict potential failures, and recommend preventive maintenance.",
      predictions: "Provide comprehensive predictive analysis for all systems including failure risks and optimization opportunities."
    };

    return `${dataContext}

USER REQUEST:
"${userRequests[activeTab] || 'Analyze current system status and provide operational insights.'}"

Analyze all available data and generate a complete SmartOS AI operational response.`;
  };

  const getAiPrediction = async (activeTab, context) => {
    setIsAiLoading(true);

    const systemPrompt = `You are SmartOS AI Core, an advanced AI Operating System for Smart Cities.

Your role: Conversational AI Assistant, Predictive Analytics Engine, Smart Lighting Intelligence, Anomaly Detection, and Smart City Operations Analyst.

RESPONSE RULES:
1. Respond professionally and concisely
2. Focus on actionable insights
3. Prioritize public safety
4. Use operational engineering language
5. Avoid markdown formatting
6. Never hallucinate unavailable data
7. Clearly mention uncertainty if data is insufficient

OUTPUT FORMAT:

SYSTEM SUMMARY:
[overall city/system assessment]

REALTIME ANALYSIS:
[detailed interpretation]

PREDICTIONS:
[list future forecasts]

ANOMALIES DETECTED:
[list anomalies or "none detected"]

SMART LIGHTING INSIGHTS:
[lighting optimization analysis]

SECURITY ANALYSIS:
[RFID and access analysis]

IRRIGATION ANALYSIS:
[soil and watering analysis]

TRAFFIC ANALYSIS:
[IR sensor movement analysis]

DEVICE HEALTH:
[system reliability analysis]

RECOMMENDATIONS:
- recommendation 1
- recommendation 2
- recommendation 3

ESTIMATED ENERGY SAVINGS:
[value]

RISK LEVEL:
LOW / MEDIUM / HIGH / CRITICAL

CONFIDENCE:
[value %]`;

    try {
      const userPrompt = buildSmartOSPrompt(activeTab, context);

      console.log('Sending AI request...', { activeTab, context });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
          }),
        }
      );

      console.log('AI Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI API Error:', errorData);
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('AI Result:', result);

      const text =
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Failed to extract prediction. Please check console for details.';
      
      // Clean up any remaining markdown
      const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
      
      setAiInsight((prev) => ({ ...prev, [activeTab]: cleanText }));
      
      if (addNotification) {
        addNotification('AI forecast generated successfully', 'info');
      }
    } catch (err) {
      console.error('AI Error:', err);
      const errorMessage = `AI Error: ${err.message || 'Connection timeout'}`;
      setAiInsight((prev) => ({ ...prev, [activeTab]: errorMessage }));
      if (addNotification) {
        addNotification('Error: AI connection failed. Check console for details.', 'error');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return { aiInsight, isAiLoading, getAiPrediction };
};
