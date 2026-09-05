import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, 
  Brain, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Gauge
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

interface EmployeeRisk {
  employee_id: str;
  name: string;
  department: string;
  role: string;
  satisfaction_level: number;
  performance_rating: number;
  average_monthly_hours: number;
  time_spend_company: number;
  predicted_attrition_risk: number;
  predicted_attrition: number;
}

interface TrainingResult {
  message: string;
  accuracy: number;
  f1_score: number;
  features_used: string[];
  feature_importances: Record<string, number>;
}

const API_BASE = 'http://localhost:8000/api';

const AttritionRisk: React.FC = () => {
  const [isTrained, setIsTrained] = useState<boolean>(false);
  const [highRiskEmps, setHighRiskEmps] = useState<EmployeeRisk[]>([]);
  const [trainingMetrics, setTrainingMetrics] = useState<Partial<TrainingResult> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [training, setTraining] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  const fetchStatusAndData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusRes = await axios.get(`${API_BASE}/data/status`);
      setIsTrained(statusRes.data.is_model_trained);
      
      if (statusRes.data.is_model_trained) {
        const riskRes = await axios.get<EmployeeRisk[]>(`${API_BASE}/ml/high-risk-employees`);
        setHighRiskEmps(riskRes.data);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch ML data. Check if backend is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndData();
  }, []);

  const trainModel = async () => {
    setTraining(true);
    setError(null);
    try {
      const res = await axios.post<TrainingResult>(`${API_BASE}/ml/train-attrition`);
      setTrainingMetrics(res.data);
      setIsTrained(true);
      
      // Fetch updated risk predictions
      const riskRes = await axios.get<EmployeeRisk[]>(`${API_BASE}/ml/high-risk-employees`);
      setHighRiskEmps(riskRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Model training failed. Ensure database has enough active/resigned records.");
    } finally {
      setTraining(false);
    }
  };

  const getRiskBadgeColor = (risk: number) => {
    if (risk >= 0.7) return 'bg-red-500/10 border-red-500/30 text-red-400';
    if (risk >= 0.4) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  };

  const filteredEmployees = highRiskEmps.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...Array.from(new Set(highRiskEmps.map(e => e.department)))];

  // Convert feature importance to chart array
  const featureChartData = trainingMetrics?.feature_importances 
    ? Object.entries(trainingMetrics.feature_importances).map(([k, v]) => ({
        name: k.replace('_num', '').replace('_encoded', '').replace('_', ' '),
        value: v * 100
      })).sort((a, b) => b.value - a.value)
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
        <span className="text-gray-400 font-medium">Loading predictive intelligence models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Model status bar */}
      <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-xl border ${isTrained ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">XGBoost Attrition Predictor Status</h3>
            <p className="text-xs text-gray-500 mt-1">
              {isTrained 
                ? 'Supervised learning model is trained and active. High risk cohorts updated.' 
                : 'Model has not been trained on ingested records yet. Feed database history.'}
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={trainModel}
            disabled={training}
            className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-brand-600/10 disabled:opacity-50"
          >
            {training ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Gauge className="w-4 h-4" />
            )}
            {isTrained ? 'Re-Train XGBoost Model' : 'Train XGBoost Model'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Model Performance metrics */}
      {trainingMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 flex flex-col justify-between">
            <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Model Accuracy</h4>
            <h2 className="text-4xl font-bold font-mono text-white mt-4">
              {(trainingMetrics.accuracy! * 100).toFixed(1)}%
            </h2>
            <p className="text-[10px] text-gray-500 mt-4 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Out-of-fold generalization score
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 flex flex-col justify-between">
            <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Model F1-Score</h4>
            <h2 className="text-4xl font-bold font-mono text-white mt-4">
              {(trainingMetrics.f1_score! * 100).toFixed(1)}%
            </h2>
            <p className="text-[10px] text-gray-500 mt-4 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Balanced precision and recall indicator
            </p>
          </div>

          {/* Feature Importance visualizer */}
          <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 md:col-span-1">
            <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Top Attrition Risk Drivers</h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureChartData.slice(0, 4)} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={9} tickLine={false} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={9} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Predictive High-Risk Active Employees list */}
      {isTrained ? (
        <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white">Individual Attrition Risk Forecasts</h3>
              <p className="text-xs text-gray-500 mt-1">
                Active employees ranked by mathematical flight probability.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-950 border border-darkBorder focus:border-brand-500 focus:outline-none rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 transition-all duration-300 w-full md:w-56"
              />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-gray-950 border border-darkBorder focus:border-brand-500 focus:outline-none rounded-xl px-4 py-2 text-xs text-white transition-all duration-300"
              >
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-darkBorder/50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Emp ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-center">Satisfaction</th>
                  <th className="py-3.5 px-4 text-center">Avg Hours/Mo</th>
                  <th className="py-3.5 px-4 text-right">Flight Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/30 text-xs">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/10 transition-colors">
                      <td className="py-4 px-4 font-mono font-semibold text-gray-400">{emp.employee_id}</td>
                      <td className="py-4 px-4 font-semibold text-white">{emp.name}</td>
                      <td className="py-4 px-4 text-gray-300">{emp.department}</td>
                      <td className="py-4 px-4 text-gray-400">{emp.role}</td>
                      <td className="py-4 px-4 text-center font-mono font-medium">
                        {(emp.satisfaction_level * 100).toFixed(0)}%
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-gray-300">
                        {emp.average_monthly_hours} hrs
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold font-mono ${getRiskBadgeColor(emp.predicted_attrition_risk)}`}>
                          {(emp.predicted_attrition_risk * 100).toFixed(0)}% Risk
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500 font-medium">
                      No high-risk employees match the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel border border-dashed border-darkBorder rounded-2xl p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-10">
          <ShieldAlert className="w-14 h-14 text-yellow-500/80 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-2">XGBoost Predictor Offline</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md">
            Before predicting flight risks, the platform must train the XGBoost classifier. Please click the <b>Train XGBoost Model</b> button above.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttritionRisk;
