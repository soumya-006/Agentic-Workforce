import React, { useState } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Send, 
  RefreshCw, 
  FileText, 
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';

interface Source {
  filename: string;
  content: string;
  chunk_index: number;
  score: number;
}

interface QueryResponse {
  query: string;
  answer: string;
  sources: Source[];
}

const API_BASE = 'http://localhost:8000/api';

const PolicyRag: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<QueryResponse>(`${API_BASE}/rag/query`, { query });
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError("RAG Query failed. Check if backend is active and policy files have been uploaded.");
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "What is the policy on maternity leave and family care?",
    "Can you explain the requirements for code of conduct?",
    "What guidelines exist for travel expenses and reimbursements?",
    "What is the sick leave policy and documentation requirement?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Search and Answer Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40">
          <h3 className="font-bold text-base text-white mb-2">HR Policies Search</h3>
          <p className="text-xs text-gray-500 mb-6">
            Query employee handbooks, compliance checklists, and corporate guidelines in natural language.
          </p>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'What is our sick leave limit?')..."
              className="w-full bg-gray-950 border border-darkBorder focus:border-brand-500 focus:outline-none rounded-xl pl-4 pr-12 py-3.5 text-xs text-white placeholder-gray-500 transition-all duration-300 shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 p-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Quick recommendations */}
          <div className="mt-4 flex flex-wrap gap-2">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(q)}
                className="text-2xs text-gray-400 bg-gray-900 hover:bg-gray-800 border border-darkBorder/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
              >
                <Compass className="w-3 h-3 text-brand-400" />
                {q}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Answer display */}
        {result && (
          <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 space-y-4">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-4.5 h-4.5" />
              <span>Grounded Knowledge Answer</span>
            </div>
            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line border-l-2 border-brand-500 pl-4 py-1">
              {result.answer}
            </div>
          </div>
        )}
      </div>

      {/* Sourced RAG Context Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 flex flex-col h-[600px]">
        <div className="mb-6 flex items-center gap-2 border-b border-darkBorder/30 pb-4">
          <Info className="w-4.5 h-4.5 text-brand-400" />
          <div>
            <h3 className="font-bold text-sm text-white">Retrieved Context Sources</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Reference documents matched by cosine similarity</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {result && result.sources.length > 0 ? (
            result.sources.map((src, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-950 border border-darkBorder/40 space-y-2 text-2xs hover:border-brand-500/20 transition-all duration-300">
                <div className="flex justify-between items-center text-gray-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                    {src.filename} (Chunk {src.chunk_index})
                  </span>
                  <span className="font-mono text-brand-400 text-[10px]">
                    {(src.score * 100).toFixed(0)}% Match
                  </span>
                </div>
                <p className="text-gray-300 leading-normal italic bg-gray-900/50 p-2 rounded-lg border border-darkBorder/20">
                  "...{src.content}..."
                </p>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6">
              <Compass className="w-10 h-10 text-gray-700 mb-2 animate-spin" />
              <p className="text-xs">No query results active.</p>
              <p className="text-[10px] text-gray-600 mt-1">Submit a question to see source document mapping.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyRag;
