import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  UserPlus, 
  BrainCircuit, 
  MessageSquare, 
  ShieldAlert, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import DataIngest from './pages/DataIngest';
import AttritionRisk from './pages/AttritionRisk';
import SkillGap from './pages/SkillGap';
import PolicyRag from './pages/PolicyRag';
import AgentChat from './pages/AgentChat';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'HR Executive Dashboard', icon: LayoutDashboard },
    { id: 'ingest', label: 'Data Ingestion Hub', icon: UploadCloud },
    { id: 'attrition', label: 'Attrition Risk Analyst', icon: ShieldAlert },
    { id: 'skills', label: 'Skill Gap & Resource Planning', icon: UserPlus },
    { id: 'rag', label: 'HR Policy Q&A (RAG)', icon: BookOpen },
    { id: 'chat', label: 'Agentic Intelligence Chat', icon: BrainCircuit },
  ];

  return (
    <div className="flex min-h-screen bg-darkBg text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 glass-panel border-r border-darkBorder flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-darkBorder flex items-center gap-3">
            <div className="bg-brand-500/20 p-2.5 rounded-xl border border-brand-500/30">
              <Sparkles className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-brand-400 bg-clip-text text-transparent">
                HR Workforce AI
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                Workforce Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/20 to-brand-500/5 text-brand-300 border-l-4 border-brand-500 shadow-lg shadow-brand-500/5'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/25 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-darkBorder bg-gray-950/20">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-400">System Connected</span>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 font-mono">
            Orchestrator v1.0.0 (Groq LLM)
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-b from-gray-950 via-darkBg to-gray-950">
        <header className="px-10 py-5 border-b border-darkBorder/40 bg-darkBg/30 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white capitalize">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Decision support and predictive HR analytics panel.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs bg-gray-900 border border-darkBorder px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-gray-400">Target Model:</span>
              <span className="text-brand-400 font-mono font-bold">XGBoost Classify</span>
            </div>
            <div className="text-xs bg-gray-900 border border-darkBorder px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-gray-400">Forecaster:</span>
              <span className="text-brand-400 font-mono font-bold">Holt-Winters / Prophet</span>
            </div>
          </div>
        </header>

        <section className="p-10 flex-1 min-w-0">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'ingest' && <DataIngest />}
          {activeTab === 'attrition' && <AttritionRisk />}
          {activeTab === 'skills' && <SkillGap />}
          {activeTab === 'rag' && <PolicyRag />}
          {activeTab === 'chat' && <AgentChat />}
        </section>
      </main>
    </div>
  );
}

export default App;
