import React, { useState, useEffect } from 'react';
import {
  BarChart2, Users,
  Brain, Clock, PieChart, Activity, Download
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getVconfTeacherContribution } from '../../services/vconf.service';
import { useAuth } from '../../context/AuthContext';

function KPICard({ title, value, trend, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
    </div>
  );
}

function VconfAnalytics() {
  const { user } = useAuth();
  const [engagementData, setEngagementData] = useState([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchContribution = async () => {
      if (user && user.role === 'teacher') {
        try {
          const contrib = await getVconfTeacherContribution(user._id || user.id);

          if (contrib && contrib.length > 0) {
            setEngagementData(contrib);
          } else {
            // Graceful empty state so the graph doesn't crash
            setEngagementData([{ subject: 'No Data', attendance: 0, interaction: 0 }]);
          }
        } catch (e) {
          console.error("Failed loading analytics", e);
        }
      }
      setLoading(false);
    };
    fetchContribution();
  }, [user]);

  const avgAttendance = engagementData.length > 0 && engagementData[0].subject !== 'No Data'
    ? (engagementData.reduce((acc, curr) => acc + (curr.attendance || 0), 0) / engagementData.length).toFixed(1)
    : 0;

  const interactionScoreTotal = engagementData.length > 0 && engagementData[0].subject !== 'No Data'
    ? (engagementData.reduce((acc, curr) => acc + (curr.interaction || 0), 0) / engagementData.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classroom Intelligence</h1>
          <p className="text-slate-500">AI-driven insights on student performance and engagement.</p>
        </div>
        <div className="flex space-x-2">
          <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Last 7 Days</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors">
            <Download className="mr-2" size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Avg. Engagement"
          value={`${interactionScoreTotal}/100`}
          trend=""
          icon={Activity}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <KPICard
          title="Avg. Attendance"
          value={`${avgAttendance}%`}
          trend=""
          icon={Users}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <KPICard
          title="Sessions Tracked"
          value={engagementData.length > 0 && engagementData[0].subject !== 'No Data' ? engagementData.length.toString() : "0"}
          trend=""
          icon={Brain}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <KPICard
          title="Processing Status"
          value={engagementData[0]?.subject === 'No Data' ? "Awaiting Data" : "Live"}
          trend=""
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Engagement Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center">
            <BarChart2 size={18} className="mr-2 text-indigo-600" />
            Engagement vs Attendance by Subject
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="attendance" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Attendance %" />
                <Bar dataKey="interaction" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Interaction Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center">
            <PieChart size={18} className="mr-2 text-purple-600" />
            Topic Focus Distribution
          </h3>
          <div className="flex-1 flex items-center justify-center text-slate-400 italic">
            Insufficient live class data to generate pie chart.
          </div>
        </div>

      </div>

      {/* AI Sentiment & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white relative flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="font-bold text-lg mb-4 flex items-center z-10">
            <Brain size={20} className="mr-2" />
            AI Teaching Assistant Recommendations
          </h3>
          <p className="text-indigo-200 italic z-10 text-center max-w-lg">
            {engagementData[0]?.subject === 'No Data'
              ? "Waiting for sufficient live classroom data to generate dynamic AI recommendations."
              : "Backend MOM parsing engine requires more aggregate data to form confident actionable suggestions for this period."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="font-bold text-slate-800 mb-2">Student Sentiment</h3>
          <p className="text-slate-400 text-sm italic text-center px-4">Not enough vocal data to gauge general sentiment across these sessions.</p>
        </div>
      </div>
    </div>
  );
}

export default VconfAnalytics;
