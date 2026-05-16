import { useState } from 'react';
import { GEMINI_API_KEY } from '../config/constants';

export const useChatAI = () => {
  const [isChatLoading, setIsChatLoading] = useState(false);

  const buildChatPrompt = (userQuestion, analytics) => {
    return `
REALTIME SENSOR DATA:

RFID:
- Total Scans: ${analytics.rfidCount || 0}
- Authorized: ${analytics.rfidLast5?.filter(l => l.access_granted === true).length || 0}
- Denied: ${analytics.rfidLast5?.filter(l => l.access_granted === false).length || 0}
- Peak Hour: ${analytics.rfidHourly?.sort((a,b) => b.count - a.count)[0]?.hour || 'N/A'}

LIGHTING:
- Current LUX: ${analytics.avgLdr || 0}
- Average LUX: ${analytics.avgLdr || 0}
- Darkness Hours: ${analytics.darknessDuration || 0}
- Transitions: ${analytics.thresholdCrossings || 0}
- Status: ${analytics.avgLdr < 800 ? 'DARK' : analytics.avgLdr > 1500 ? 'DAYLIGHT' : 'TWILIGHT'}

SOIL:
- Current Moisture: ${analytics.lastSoilVal || 0}%
- Status: ${analytics.moistureStatus || 'Unknown'}
- Variability: ±${analytics.moistureVariability || 0}%
- Stability Score: ${Math.max(0, 100 - (analytics.moistureVariability || 0))}%

TRAFFIC:
- IR1 Events: ${analytics.ir1Count || 0}
- IR2 Events: ${analytics.ir2Count || 0}
- Total Motion: ${(analytics.ir1Count || 0) + (analytics.ir2Count || 0)}

DEVICE STATUS:
- Uptime: ${analytics.uptime || 0}%
- Device Stability: ${analytics.uptime > 95 ? 'Stable' : analytics.uptime > 80 ? 'Moderate' : 'Unstable'}
- Connection Health: ${analytics.uptime > 95 ? 'Excellent' : analytics.uptime > 80 ? 'Good' : 'Poor'}

USER QUESTION:
"${userQuestion}"

Analyze the realtime SmartOS IoT system data and respond intelligently as an advanced Smart City AI assistant.`;
  };

  const sendChatMessage = async (userQuestion, analytics) => {
    setIsChatLoading(true);

    const systemPrompt = `You are SmartOS AI Assistant for Smart City Operations.

RESPONSE RULES:
1. Keep responses SHORT and CLEAR (max 150 words)
2. Use simple, direct language
3. Focus on the most important information
4. Use bullet points for lists
5. Avoid technical jargon unless necessary
6. Get straight to the point
7. No markdown formatting

OUTPUT FORMAT (keep each section brief):

SUMMARY:
[1-2 sentences max]

ANALYSIS:
[2-3 key points only]

DETECTED ISSUES:
[List only critical issues, or "None"]

PREDICTIONS:
[1-2 sentences max]

RECOMMENDATIONS:
- [max 3 short recommendations]

RISK LEVEL: LOW / MEDIUM / HIGH / CRITICAL
CONFIDENCE: [%]

IMPORTANT: Be concise. Users want quick, actionable answers.`;

    try {
      const userPrompt = buildChatPrompt(userQuestion, analytics);

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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Chat AI API Error:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const text =
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I apologize, but I could not generate a response. Please try again.';
      
      // Clean up markdown
      const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
      
      return cleanText;
    } catch (err) {
      console.error('Chat AI Error:', err);
      return 'Error: Unable to connect to AI service. Please check your connection and try again.';
    } finally {
      setIsChatLoading(false);
    }
  };

  return { sendChatMessage, isChatLoading };
};
