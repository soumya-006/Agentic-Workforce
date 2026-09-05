import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface IngestionStatus {
  employees_total: number;
  employees_active: number;
  employees_resigned: number;
  skills_count: number;
  hiring_plans_count: number;
  rag_indexed_files: string[];
  rag_chunks_total: number;
  is_model_trained: boolean;
}

const API_BASE = 'http://localhost:8000/api';

const DataIngest: React.FC = () => {
  const [status, setStatus] = useState<IngestionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, { type: 'success' | 'error', text: string }>>({});

  const fetchStatus = async () => {
    try {
      const res = await axios.get<IngestionStatus>(`${API_BASE}/data/status`);
      setStatus(res.data);
    } catch (err) {
      console.error("Error fetching data status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    setMessages(prev => ({ ...prev, [type]: null as any }));

    const formData = new FormData();
    formData.append('file', file);

    let endpoint = '';
    if (type === 'employees') endpoint = '/upload/employees';
    else if (type === 'skills') endpoint = '/upload/skills';
    else if (type === 'hiring') endpoint = '/upload/hiring_plans';
    else if (type === 'policies') endpoint = '/upload/policies';

    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages(prev => ({ 
        ...prev, 
        [type]: { type: 'success', text: res.data.message || 'File uploaded successfully.' } 
      }));
      // Refresh database status counts
      await fetchStatus();
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Upload failed. Please check the file formatting.';
      setMessages(prev => ({ 
        ...prev, 
        [type]: { type: 'error', text: errMsg } 
      }));
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      // Clear file inputs
      event.target.value = '';
    }
  };

  const clearPolicies = async () => {
    if (!window.confirm("Are you sure you want to clear the indexed policy documents? This cannot be undone.")) return;
    try {
      await axios.post(`${API_BASE}/data/clear-policies`);
      alert("Policies cleared successfully.");
      await fetchStatus();
    } catch (err) {
      alert("Failed to clear policies.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
        <span className="text-gray-400 font-medium">Loading ingestion summary...</span>
      </div>
    );
  }

  const uploadSlots = [
    {
      id: 'employees',
      title: 'Employees Master Database',
      desc: 'Contains employee metrics, salary history, projects, satisfaction levels, and active/resignation statuses.',
      accept: '.csv',
      template: 'employees_template.csv'
    },
    {
      id: 'skills',
      title: 'Employee Skills Inventory',
      desc: 'Maps specific skill certifications and tool expertise ratings (1-5) to active employee IDs.',
      accept: '.csv',
      template: 'skills_template.csv'
    },
    {
      id: 'hiring',
      title: 'Hiring & Demand Plan',
      desc: 'Strategic quotas outlining roles required by department, target hire dates, and headcount quotas.',
      accept: '.csv',
      template: 'hiring_plans_template.csv'
    },
    {
      id: 'policies',
      title: 'HR Policies & Guidelines',
      desc: 'Upload handbook text documents (.txt) or PDF files (.pdf) to populate the RAG policy retrieval search.',
      accept: '.txt,.pdf',
      template: null
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Current Counts Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-darkBorder/40 flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Total Employees</p>
            <h4 className="text-xl font-bold font-mono text-white mt-1">{status?.employees_total || 0}</h4>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-darkBorder/40 flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Skill Links</p>
            <h4 className="text-xl font-bold font-mono text-white mt-1">{status?.skills_count || 0}</h4>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-darkBorder/40 flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Hiring Targets</p>
            <h4 className="text-xl font-bold font-mono text-white mt-1">{status?.hiring_plans_count || 0}</h4>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-darkBorder/40 flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">RAG Policy Chunks</p>
            <h4 className="text-xl font-bold font-mono text-white mt-1">{status?.rag_chunks_total || 0}</h4>
          </div>
        </div>
      </div>

      {/* Upload center */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {uploadSlots.map((slot) => {
          const isSlotUploading = uploading[slot.id];
          const message = messages[slot.id];
          return (
            <div key={slot.id} className="glass-panel rounded-2xl p-6 border border-darkBorder/50 flex flex-col justify-between hover:border-darkBorder transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-base text-white">{slot.title}</h3>
                  {slot.template && (
                    <a
                      href={`${API_BASE}/data/templates/${slot.template}`}
                      className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-all"
                      download
                    >
                      <Download className="w-3.5 h-3.5" /> Template CSV
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  {slot.desc}
                </p>
              </div>

              <div className="space-y-4">
                {/* Upload Zone */}
                <label className="relative border border-dashed border-darkBorder hover:border-brand-500/40 hover:bg-brand-500/[0.02] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
                  <input
                    type="file"
                    className="hidden"
                    accept={slot.accept}
                    onChange={(e) => handleFileUpload(e, slot.id)}
                    disabled={isSlotUploading}
                  />
                  {isSlotUploading ? (
                    <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  )}
                  <span className="text-xs font-semibold text-gray-300">
                    {isSlotUploading ? 'Ingesting records...' : 'Browse file to ingest'}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase">
                    Formats: {slot.accept}
                  </span>
                </label>

                {/* Upload Status Feedbacks */}
                {message && (
                  <div className={`p-3 rounded-lg border text-xs flex gap-2.5 items-start ${
                    message.type === 'success' 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/5 border-red-500/20 text-red-400'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RAG Indexed Document Management List */}
      <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-base text-white">Indexed Policy Knowledge Base</h3>
            <p className="text-xs text-gray-500 mt-1">
              Documents currently chunked and searched by the FAISS RAG system.
            </p>
          </div>
          {status && status.rag_indexed_files.length > 0 && (
            <button
              onClick={clearPolicies}
              className="text-xs text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/30 bg-red-500/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Index
            </button>
          )}
        </div>

        {status && status.rag_indexed_files.length > 0 ? (
          <div className="divide-y divide-darkBorder/50">
            {status.rag_indexed_files.map((file, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span>{file}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  Indexed
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-darkBorder/50 rounded-xl">
            No policy documents indexed yet. Upload handbooks or guidelines above.
          </div>
        )}
      </div>
    </div>
  );
};

export default DataIngest;
