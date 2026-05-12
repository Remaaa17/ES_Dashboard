import { useState } from 'react';
import { GEMINI_API_KEY } from '../config/constants';

export const useAI = (addNotification) => {
  const [aiInsight, setAiInsight] = useState({});
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getAiPrediction = async (activeTab, context) => {
    setIsAiLoading(true);

    const tabPrompts = {
      overview: "Provide a strategic assessment of the current smart city health. Summarize security, environmental, and technical status in 3 bullet points with preventive advice.",
      rfid: `Analyze RFID data: ${context.rfidCount} scans. Predict peak traffic and potential security risks for the next 24 hours.`,
      motion: `Predict traffic patterns based on IR1 (${context.ir1Count}) and IR2 (${context.ir2Count}) activity. Is congestion expected?`,
      light: `Based on ${context.avgLdr} LUX, suggest a smart energy-saving street lighting schedule for the next night.`,
      waste: `Bin is at ${context.binLevel}%. Predict time until full and advise on truck route optimization.`,
      soil: `Moisture is ${context.lastSoilVal}% (${context.moistureStatus}). Predict next dry period based on ${context.moistureVariability}% variability.`,
      system: `Evaluate system stability (Uptime: ${context.uptime}%). Predict ESP32 node failure probability based on data volume.`,
      predictions: "Analyze the professional failure risk report provided. Give a high-level summary of the Remaining Useful Life (RUL) and the criticality of current performance drifts in English."
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: tabPrompts[activeTab] }] }],
            systemInstruction: {
              parts: [{
                text: "You are an expert Smart City Data Analyst. Use professional, concise English. Focus on predictions and preventive solutions. Remove any markdown symbols like asterisks from your response."
              }]
            }
          })
        }
      );

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to extract prediction.";
      setAiInsight((prev) => ({ ...prev, [activeTab]: text }));
    } catch (err) {
      if (addNotification) addNotification("Error: AI connection timeout", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  return { aiInsight, isAiLoading, getAiPrediction };
};
