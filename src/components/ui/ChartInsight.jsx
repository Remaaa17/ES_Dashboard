import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { GEMINI_API_KEY } from '../../config/constants';

const ChartInsight = ({ chartId, prompt, isDarkMode }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    if (insight) { setOpen(o => !o); return; }
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
              parts: [{ text: `You are SmartOS AI. Give a 2-sentence max insight. First sentence: what the data shows. Second sentence: one action to take. No markdown. No bullets. No intro phrases like "The chart shows" or "Based on the data". Just facts and action.` }]
            }
          })
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No insight available.';
      setInsight(text.replace(/\*\*/g, '').replace(/\*/g, '').trim());
    } catch {
      setInsight('Failed to generate insight. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={generate}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          isDarkMode
            ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20'
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
        }`}
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Sparkles size={13} />
        )}
        {loading ? 'Analyzing...' : insight ? (open ? 'Hide Insight' : 'Show Insight') : 'Generate Insight'}
        {insight && !loading && (open ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </button>

      {open && insight && (
        <div className={`mt-3 p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-300 ${
          isDarkMode
            ? 'bg-indigo-500/5 border-indigo-500/15 text-slate-300'
            : 'bg-indigo-50 border-indigo-200 text-slate-700'
        }`}>
          <div className="flex items-start gap-2">
            <Sparkles size={13} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p>{insight}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartInsight;
