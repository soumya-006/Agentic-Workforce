import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  BrainCircuit, 
  Send, 
  RefreshCw, 
  Bot, 
  User, 
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  FileText
} from 'lucide-react';

interface AgentStep {
  agent_name: string;
  thought: string;
  action: string | null;
  output: string | null;
}

interface Message {
  sender: 'user' | 'orchestrator';
  text: string;
  steps: AgentStep[];
}

const API_BASE = 'http://localhost:8000/api';

const AgentChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'orchestrator',
      text: "Hello! I am your AI HR Intelligence Orchestrator. I coordinate a multi-agent team (Analytics, Attrition, Skills, Forecasting, and Report Generator) to analyze workforce metrics or index company policies. Ask me a question, or type 'generate_full' to run a full organizational audit.",
      steps: []
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText, steps: [] }]);
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE}/agent/chat`, { message: userText });
      const newMsg: Message = {
        sender: 'orchestrator',
        text: res.data.response,
        steps: res.data.steps || []
      };
      setMessages(prev => {
        const next = [...prev, newMsg];
        setActiveMessageIndex(next.length - 1);
        return next;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Chat failed. Ensure backend server is active and Groq API key is set.");
    } finally {
      setLoading(false);
    }
  };

  const currentSteps = messages[activeMessageIndex]?.steps || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[650px] animate-fade-in">
      {/* Conversational interface */}
      <div className="lg:col-span-2 flex flex-col justify-between glass-panel rounded-2xl border border-darkBorder/40 h-full overflow-hidden">
        {/* Chat log header */}
        <div className="px-6 py-4 border-b border-darkBorder/30 bg-gray-950/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-400" />
            <span className="text-sm font-bold text-white">HR Orchestrator Chat Console</span>
          </div>
          {loading && (
            <span className="text-2xs text-brand-400 flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Specialist Agents Working...
            </span>
          )}
        </div>

        {/* Message scrolling area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const isActive = idx === activeMessageIndex;
            return (
              <div 
                key={idx} 
                onClick={() => !isUser && msg.steps.length > 0 && setActiveMessageIndex(idx)}
                className={`flex gap-4 p-4 rounded-2xl max-w-[85%] transition-all ${
                  isUser 
                    ? 'ml-auto bg-brand-600/10 border border-brand-500/20 text-gray-200' 
                    : `mr-auto bg-gray-900 border ${isActive ? 'border-brand-500/30 ring-1 ring-brand-500/20 shadow-md shadow-brand-500/5' : 'border-darkBorder/50'} text-gray-300 cursor-pointer hover:border-darkBorder`
                }`}
              >
                <div className={`p-2 rounded-xl h-fit border ${
                  isUser 
                    ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' 
                    : 'bg-gray-950 border-darkBorder/50 text-gray-400'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-2">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {!isUser && msg.steps.length > 0 && (
                    <div className="pt-2 flex items-center gap-2 border-t border-darkBorder/30">
                      <span className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3 h-3 animate-pulse" /> {msg.steps.length} Agent Steps Logged
                      </span>
                      <span className="text-3xs text-gray-500 italic">(Click message to view agent trace)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input prompt bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-darkBorder/30 bg-gray-950/20 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query multi-agents (e.g. 'Show our engineering gaps' or 'generate_full')..."
            className="flex-1 bg-gray-950 border border-darkBorder focus:border-brand-500 focus:outline-none rounded-xl px-4 py-3.5 text-xs text-white placeholder-gray-500 transition-all duration-300"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </form>
      </div>

      {/* Multi-Agent Trace side panel */}
      <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 flex flex-col h-full overflow-hidden">
        <div className="border-b border-darkBorder/30 pb-4 mb-6 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-brand-400" />
          <div>
            <h3 className="font-bold text-sm text-white">Agent Execution Trace</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Real-time LangGraph specialist communication logs</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {currentSteps.length > 0 ? (
            currentSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-950 border border-darkBorder/40 space-y-2 hover:border-brand-500/20 transition-all duration-300">
                <div className="flex items-center gap-2 text-2xs text-brand-400 font-bold border-b border-darkBorder/20 pb-2">
                  <Terminal className="w-3.5 h-3.5 text-gray-500" />
                  <span>{step.agent_name}</span>
                  {step.action && (
                    <span className="ml-auto text-[9px] bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      {step.action}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1.5 text-3xs leading-relaxed">
                  <div>
                    <span className="text-gray-500 font-semibold block uppercase">Internal Thought:</span>
                    <span className="text-gray-300 italic block">"{step.thought}"</span>
                  </div>
                  
                  {step.output && step.output !== "Compiled Executive Brief Report." && (
                    <div>
                      <span className="text-gray-500 font-semibold block uppercase">Specialist Response:</span>
                      <span className="text-gray-400 block whitespace-pre-wrap mt-0.5 border-t border-darkBorder/10 pt-1.5">
                        {step.output.length > 250 ? `${step.output.substring(0, 250)}...` : step.output}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6">
              <Layers className="w-10 h-10 text-gray-700 mb-2" />
              <p className="text-xs">No active agent log traces.</p>
              <p className="text-[10px] text-gray-600 mt-1">Select an orchestrator reply to examine specialist thought logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
