import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Trash2, Bot, User, Zap, Shield, Droplets, Sun } from 'lucide-react';

const ChatbotPage = ({ analytics, isDarkMode, onSendMessage, isChatLoading }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: 'Hello! I am SmartOS AI Assistant. I can help you understand sensor readings, detect anomalies, predict operational risks, and optimize your smart city systems. Ask me anything about your IoT infrastructure!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Call AI
    const response = await onSendMessage(inputMessage, analytics);
    
    if (response) {
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        text: 'Chat cleared. How can I help you with your smart city operations?',
        timestamp: new Date()
      }
    ]);
  };

  const quickQuestions = [
    { text: "What's the current system status?", icon: Zap },
    { text: "Are there any anomalies detected?", icon: Shield },
    { text: "How can I optimize energy usage?", icon: Sun },
    { text: "When should I irrigate next?", icon: Droplets },
  ];

  return (
    <div className="h-screen flex flex-col">
      
      {/* Compact Header */}
      <div className={`px-8 py-4 border-b flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              SmartOS AI Assistant
            </h2>
            <p className="text-xs text-slate-500">Conversational AI for Smart City Operations</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isDarkMode 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex gap-6 p-6 min-h-0">
        
        {/* Sidebar - Quick Questions */}
        <div className={`w-80 flex-shrink-0 rounded-3xl border p-6 ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-blue-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">Quick Questions</h3>
          </div>
          
          <div className="space-y-3">
            {quickQuestions.map((question, i) => (
              <button
                key={i}
                onClick={() => setInputMessage(question.text)}
                disabled={isChatLoading}
                className={`w-full p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] group ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-white/5 hover:bg-slate-800 hover:border-blue-500/30' 
                    : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    isDarkMode 
                      ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20' 
                      : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                  }`}>
                    <question.icon size={16} />
                  </div>
                  <span className="text-sm font-medium leading-relaxed">{question.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Messages Container */}
          <div className={`flex-1 rounded-3xl border p-6 overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-500' 
                      : 'bg-gradient-to-br from-cyan-600 to-blue-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User size={20} className="text-white" />
                    ) : (
                      <Bot size={20} className="text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[85%] p-5 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? isDarkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-200 border border-white/5'
                          : 'bg-slate-50 text-slate-900 border border-slate-200'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isChatLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-slate-800 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={`mt-4 rounded-3xl border p-4 ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about sensors, anomalies, predictions, or optimizations..."
                disabled={isChatLoading}
                className={`flex-1 p-4 rounded-2xl border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800 border-white/5 text-slate-200 placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isChatLoading}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Send size={20} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 px-2">
              Press <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Enter</kbd> to send • <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
