import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Reports() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('healthRecords');
    if (stored) setRecords(JSON.parse(stored));
  }, []);

  const total = records.length;
  const maternal = records.filter(r => r.type === 'Maternal').length;
  const newborn = records.filter(r => r.type === 'Newborn').length;
  const high = records.filter(r => r.level.toLowerCase().includes('high')).length;
  const moderate = records.filter(r => r.level.toLowerCase().includes('mod') || r.level.toLowerCase().includes('mid')).length;
  const low = records.filter(r => r.level.toLowerCase().includes('low')).length;

  const pct = (n) => total === 0 ? 0 : Math.round((n / total) * 100);

  // --- Weekly activity: last 7 days ---
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        day: d.getDate(),
      });
    }
    return days;
  };

  const weekly = getLast7Days().map(day => ({
    ...day,
    count: records.filter(r => r.date === day.date).length,
  }));

  const maxWeekly = Math.max(...weekly.map(w => w.count), 1);

  // --- Top high-risk patients (unique by name, most recent first) ---
  const highRiskPatients = records
    .filter(r => r.level.toLowerCase().includes('high'))
    .slice(0, 5);

  // --- Recent activity (last 5 records) ---
  const recentActivity = records.slice(0, 5);

  // --- Bar Chart Component ---
  const Bar = ({ label, value, color }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="font-semibold text-slate-800">{value} ({pct(value)}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div className={`h-3 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct(value)}%` }}></div>
      </div>
    </div>
  );

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">📊 Reports & Analytics</h1>
        <p className="text-sm text-slate-600">Statistical overview of all assessments and patient activity.</p>
      </header>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Assessments</p>
          <p className="text-4xl font-bold text-slate-800 mt-2">{total}</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Maternal / Newborn</p>
          <p className="text-4xl font-bold text-slate-800 mt-2">{maternal} <span className="text-gray-300">/</span> {newborn}</p>
          <p className="text-xs text-gray-400 mt-1">Split</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">High Risk Rate</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{pct(high)}%</p>
          <p className="text-xs text-gray-400 mt-1">{high} patients</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active Alerts</p>
          <p className="text-4xl font-bold text-orange-500 mt-2">{high + moderate}</p>
          <p className="text-xs text-gray-400 mt-1">Need attention</p>
        </div>
      </div>

      {/* Weekly Activity + Risk Distribution */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Weekly Activity Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">📈 Weekly Activity</h2>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {weekly.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-semibold text-slate-700">{day.count}</div>
                <div
                  className={`w-full rounded-t-lg transition-all ${day.count > 0 ? 'bg-blue-500' : 'bg-gray-100'}`}
                  style={{ height: `${Math.max((day.count / maxWeekly) * 100, 4)}%` }}
                  title={`${day.count} assessments on ${day.date}`}
                />
                <div className="text-xs text-gray-500 text-center">
                  <div className="font-medium">{day.label}</div>
                  <div className="text-gray-400">{day.day}</div>
                </div>
              </div>
            ))}
          </div>
          {total === 0 && (
            <p className="text-xs text-gray-400 text-center mt-2">No activity yet. Submit an assessment to see data here.</p>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">🎯 Risk Distribution</h2>
          <Bar label="High Risk" value={high} color="bg-red-500" />
          <Bar label="Moderate Risk" value={moderate} color="bg-yellow-500" />
          <Bar label="Low Risk" value={low} color="bg-green-500" />
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              💡 {high > 0
                ? `${high} high-risk patient${high > 1 ? 's' : ''} require immediate attention.`
                : 'No high-risk patients currently flagged. Good work!'}
            </p>
          </div>
        </div>
      </div>

      {/* High-Risk Patients + Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* High-Risk Patients */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">⚠️ High-Risk Patients</h2>
            <Link to="/records" className="text-xs text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          {highRiskPatients.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-sm text-gray-500">No high-risk patients currently.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {highRiskPatients.map((p) => (
                <Link
                  key={p.id}
                  to={`/patient/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50/50 transition border border-transparent hover:border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${p.type === 'Maternal' ? 'bg-red-100' : 'bg-green-100'}`}>
                      {p.type === 'Maternal' ? '👤' : '👶'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.type} • {p.date}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">High</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">🕒 Recent Activity</h2>
            <Link to="/records" className="text-xs text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm text-gray-500">No assessments yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((r) => {
                const l = r.level.toLowerCase();
                const dot = l.includes('high') ? 'bg-red-500' : l.includes('mod') || l.includes('mid') ? 'bg-yellow-500' : 'bg-green-500';
                return (
                  <Link key={r.id} to={`/patient/${r.id}`} className="flex items-start gap-3 hover:bg-gray-50 -m-2 p-2 rounded-lg transition">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800">
                        <strong>{r.name}</strong> assessed as <span className="font-medium">{r.level} risk</span>
                      </p>
                      <p className="text-xs text-gray-500">{r.type} • {r.date}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}