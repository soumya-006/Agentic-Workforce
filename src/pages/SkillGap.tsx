import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  UserPlus, 
  Award, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface SkillItem {
  skill: string;
  avg_proficiency: number;
  count: number;
}

interface HiringItem {
  id: number;
  department: string;
  role: string;
  target_date: string;
  positions_needed: number;
  status: string;
}

interface SkillsSummaryResponse {
  skills: SkillItem[];
  hiring_plans: HiringItem[];
}

const API_BASE = 'http://localhost:8000/api';

const SkillGap: React.FC = () => {
  const [data, setData] = useState<SkillsSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkillsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<SkillsSummaryResponse>(`${API_BASE}/skills/summary`);
      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch skills directory. Ensure backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
        <span className="text-gray-400 font-medium">Analyzing skills and hiring gaps...</span>
      </div>
    );
  }

  if (error || !data || data.skills.length === 0) {
    return (
      <div className="glass-panel border border-dashed border-darkBorder rounded-2xl p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-10">
        <UserPlus className="w-14 h-14 text-yellow-500/80 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-white mb-2">No Skills Cataloged</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-md">
          To map organization gaps, please navigate to the <b>Data Ingestion Hub</b> and import your Employee Skills inventory CSV (`skills.csv`).
        </p>
        <button 
          onClick={fetchSkillsData}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-brand-600/10"
        >
          Check and Refresh Data
        </button>
      </div>
    );
  }

  // Calculate gaps: group skills by their average proficiency
  const highProficiency = data.skills.filter(s => s.avg_proficiency >= 4.0);
  const coreCompetencies = data.skills.filter(s => s.avg_proficiency >= 3.0 && s.avg_proficiency < 4.0);
  const skillDeficits = data.skills.filter(s => s.avg_proficiency < 3.0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Skill distributions charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Competencies rating bar chart */}
        <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-white tracking-wide">Average Skill Proficiencies (1-5 Scale)</h4>
            <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-300 font-semibold px-2 py-1 rounded">Ranked</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.skills.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="skill" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} domain={[0, 5]} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }} />
                <Bar dataKey="avg_proficiency" fill="#0e90eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Health breakdown card */}
        <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 space-y-6">
          <h4 className="text-sm font-bold text-white tracking-wide">Workforce Skill Health</h4>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Strong Areas (Rating &gt;= 4.0)</span>
                <span className="text-2xs text-gray-400 mt-1 block">
                  {highProficiency.length > 0 
                    ? highProficiency.map(s => s.skill).join(', ') 
                    : 'No strong areas mapped yet.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
              <TrendingUp className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Core Competencies (3.0 - 4.0)</span>
                <span className="text-2xs text-gray-400 mt-1 block">
                  {coreCompetencies.length > 0 
                    ? coreCompetencies.map(s => s.skill).join(', ') 
                    : 'No core competencies mapped yet.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Deficit Gaps (&lt; 3.0)</span>
                <span className="text-2xs text-gray-400 mt-1 block">
                  {skillDeficits.length > 0 
                    ? skillDeficits.map(s => s.skill).join(', ') 
                    : 'All skills have proficient averages.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hiring Targets and Quotas */}
      <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-base text-white">Active Recruiting Pipeline Requirements</h3>
            <p className="text-xs text-gray-500 mt-1">
              Positions requested by department leads and talent acquisition planners.
            </p>
          </div>
          <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-300 font-semibold px-2 py-1 rounded">
            Target Placements
          </span>
        </div>

        {data.hiring_plans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-darkBorder/50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role Needed</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4 text-center">Positions Needed</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/30 text-xs">
                {data.hiring_plans.map((plan, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/10 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">{plan.department}</td>
                    <td className="py-4 px-4 text-gray-300">{plan.role}</td>
                    <td className="py-4 px-4 font-mono text-gray-400">{plan.target_date}</td>
                    <td className="py-4 px-4 text-center font-bold font-mono text-brand-400">{plan.positions_needed}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                        plan.status === 'Filled' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : plan.status === 'Cancelled'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-darkBorder/50 rounded-xl flex flex-col items-center justify-center gap-2">
            <FolderOpen className="w-8 h-8 text-gray-600" />
            <span>No pending hiring plan templates found. Upload plans to trace recruitment target quotas.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGap;
