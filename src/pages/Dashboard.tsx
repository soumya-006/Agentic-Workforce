import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  TrendingDown, 
  Smile, 
  Award,
  AlertTriangle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface AnalyticsSummary {
  total_employees: number;
  active_employees: number;
  resigned_employees: number;
  overall_attrition_rate: number;
  avg_satisfaction: number;
  avg_performance: number;
  headcount_by_dept: Array<{ department: string; count: number }>;
  attrition_by_dept: Array<{ department: string; attrition_rate: number; total_count: number; resigned_count: number }>;
}

interface ForecastPoint {
  date: string;
  headcount: number;
  headcount_lower?: number;
  headcount_upper?: number;
}

interface ForecastResponse {
  history: Array<{ date: string; headcount: number }>;
  forecast: Array<ForecastPoint>;
  using_prophet: boolean;
}

const API_BASE = 'http://localhost:8000/api';

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summaryRes = await axios.get<AnalyticsSummary>(`${API_BASE}/analytics/summary`);
      setAnalytics(summaryRes.data);
      
      const forecastRes = await axios.get<ForecastResponse>(`${API_BASE}/ml/forecast`);
      setForecast(forecastRes.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch dashboard data. Make sure the FastAPI backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
        <span className="text-gray-400 font-medium">Aggregating workforce metrics...</span>
      </div>
    );
  }

  if (error || !analytics || analytics.total_employees === 0) {
    return (
      <div className="glass-panel border border-dashed border-darkBorder rounded-2xl p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-10">
        <AlertTriangle className="w-14 h-14 text-yellow-500/80 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-white mb-2">No Workforce Data Available</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-md">
          To unlock the predictive HR dashboard, please navigate to the <b>Data Ingestion Hub</b> and import your Employee, Skills, and Hiring Plan databases.
        </p>
        <button 
          onClick={fetchDashboardData}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-brand-600/10"
        >
          Check and Refresh Data
        </button>
      </div>
    );
  }

  // Structure forecast chart data
  const chartData = [
    ...(forecast?.history || []).map(p => ({
      date: p.date.substring(0, 7), // YYYY-MM
      type: 'history',
      Headcount: p.headcount
    })),
    ...(forecast?.forecast || []).map(p => ({
      date: p.date.substring(0, 7),
      type: 'forecast',
      Headcount: p.headcount,
      Lower: p.headcount_lower,
      Upper: p.headcount_upper
    }))
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/20 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Active Staff Size</p>
              <h3 className="text-3xl font-bold text-white mt-2 font-mono">{analytics.active_employees}</h3>
            </div>
            <div className="bg-brand-500/10 p-3 rounded-xl border border-brand-500/20">
              <Users className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-4">
            Out of {analytics.total_employees} historical records
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/20 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Overall Attrition</p>
              <h3 className="text-3xl font-bold text-white mt-2 font-mono">{analytics.overall_attrition_rate}%</h3>
            </div>
            <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-4">
            Total of {analytics.resigned_employees} resignations recorded
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Avg Satisfaction</p>
              <h3 className="text-3xl font-bold text-white mt-2 font-mono">{(analytics.avg_satisfaction * 100).toFixed(0)}%</h3>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <Smile className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-4">
            Measured across current active workforce
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Avg Performance</p>
              <h3 className="text-3xl font-bold text-white mt-2 font-mono">{analytics.avg_performance} / 5</h3>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-4">
            Based on recent manager reviews
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Headcount by Department */}
        <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-white tracking-wide">Active Headcount by Department</h4>
            <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-300 font-semibold px-2 py-1 rounded">Real-Time</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.headcount_by_dept} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="department" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="count" fill="#0e90eb" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attrition by Department */}
        <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-white tracking-wide">Historical Attrition Rate (%) by Department</h4>
            <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 font-semibold px-2 py-1 rounded">KPI</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.attrition_by_dept} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="department" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="attrition_rate" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Time-Series Forecast Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Workforce Headcount Forecasting (12-Month Horizon)</h4>
            <p className="text-xs text-gray-500 mt-1">
              Model source: {forecast?.using_prophet ? "Prophet (Time-Series)" : "Holt-Winters Exponential Smoothing"}
            </p>
          </div>
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 animate-soft-pulse">
            <TrendingUp className="w-3.5 h-3.5" /> AI Projection
          </span>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0e90eb" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0e90eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area 
                name="History" 
                type="monotone" 
                dataKey="Headcount" 
                stroke="#0e90eb" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorHistory)" 
                connectNulls
              />
              <Area 
                name="AI Prediction" 
                type="monotone" 
                dataKey="Headcount" 
                stroke="#8b5cf6" 
                strokeWidth={2.5}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorForecast)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
