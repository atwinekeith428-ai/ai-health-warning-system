import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import { getUser } from '../utils/auth';
import { api } from '../utils/api';

export default function DashboardHome() {
  const user = getUser();
  const [records, setRecords] = useState([]);
  const [toast, setToast] = useState(null);

  const [maternalData, setMaternalData] = useState({
    age: 28, systolic_bp: 140, diastolic_bp: 90,
    bs: 15, body_temp: 98, heart_rate: 102
  });
  const [maternalResult, setMaternalResult] = useState(null);
  const [maternalLoading, setMaternalLoading] = useState(false);

  const [newbornData, setNewbornData] = useState({
    birth_weight: 2.4, temperature: 36.1, respiratory_rate: 68,
    oxygen_saturation: 88, feeding: "Poor feeding"
  });
  const [newbornResult, setNewbornResult] = useState(null);
  const [newbornLoading, setNewbornLoading] = useState(false);

  useEffect(() => {
    api.getAllRecords().then(setRecords).catch(() => setRecords([]));
  }, []);

  const handleMaternalSubmit = async (e) => {
    e.preventDefault();
    setMaternalLoading(true);
    try {
      const data = await api.predictMaternal(maternalData);
      setMaternalResult(data);
      setToast({ message: "Test prediction only — not saved to records.", type: 'info' });
    } catch {
      setToast({ message: "Backend not reachable. Is uvicorn running?", type: 'error' });
    }
    setMaternalLoading(false);
  };

  const handleNewbornSubmit = (e) => {
    e.preventDefault();
    setNewbornLoading(true);
    const factors = [];
    if (newbornData.birth_weight < 2.5) factors.push(`Low birth weight (${newbornData.birth_weight} kg)`);
    if (newbornData.temperature < 36.5) factors.push(`Low temperature (${newbornData.temperature}°C)`);
    if (newbornData.respiratory_rate > 60) factors.push(`Increased respiratory rate (${newbornData.respiratory_rate} breaths/min)`);
    if (newbornData.oxygen_saturation < 90) factors.push(`Low oxygen saturation (${newbornData.oxygen_saturation}%)`);
    if (newbornData.feeding === "Poor feeding") factors.push("Poor feeding observation");

    let level = "Low";
    if (factors.length >= 3) level = "High";
    else if (factors.length > 0) level = "Moderate";

    setNewbornResult({
      risk_level: level,
      risk_factors: factors,
      recommended_action: level === "Low" ? "Routine newborn care." : "Monitor closely, provide supportive care, and consult a neonatologist."
    });
    setToast({ message: "Test prediction only — not saved to records.", type: 'info' });
    setNewbornLoading(false);
  };

  const getRiskStyles = (level) => {
    const l = level?.toLowerCase();
    if (l?.includes('high')) return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', icon: '⚠️', badge: 'bg-red-100 text-red-700' };
    if (l?.includes('mid') || l?.includes('moderate')) return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600', icon: '⚡', badge: 'bg-yellow-100 text-yellow-700' };
    return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600', icon: '✅', badge: 'bg-green-100 text-green-700' };
  };

  const maternalCount = records.filter(r => r.type === 'Maternal').length;
  const newbornCount = records.filter(r => r.type === 'Newborn').length;
  const highRiskCount = records.filter(r => r.level.toLowerCase().includes('high')).length;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Welcome to the AI Health Monitoring System</h1>
          <p className="text-xs sm:text-sm text-slate-600">Early Detection. Better decisions. Healthier mothers and babies.</p>
        </div>
        <div className="text-xs sm:text-sm text-slate-600 sm:text-right">
          <div className="font-semibold">Welcome, {user?.name || 'Guest'}</div>
          <div className="text-xs">{user?.role || 'Healthcare Worker'}</div>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-48 sm:h-56 lg:h-64">
        <img
          src="https://media.istockphoto.com/id/2239201780/photo/joyful-black-mother-cradling-newborn-baby-in-hospital-bed-after-birth.jpg?s=1024x1024&w=is&k=20&c=jyehpIxnGrYvwhR4eU-ZEWwtFgpZLH10MI_75Ds0o9Y="
          alt="Mother and baby"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1400&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent flex items-center">
          <div className="p-6 sm:p-8 lg:p-10 max-w-lg">
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-2">
              Protecting Mothers & Newborns
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm">
              Machine learning analyzes key health indicators to provide early warnings for potential risks.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <p className="text-sm text-blue-900 font-semibold">Quick Testing Mode</p>
          <p className="text-xs text-blue-800">
            These forms are for <strong>testing the AI model</strong> only — nothing is saved here.
            To save real patient records, go to <Link to="/maternal" className="underline font-medium">Maternal Assessment</Link> or <Link to="/newborn" className="underline font-medium">Newborn Assessment</Link>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {[
          { label: "Maternal Assessments", value: maternalCount, icon: "👤", color: "bg-red-100 text-red-600" },
          { label: "Newborn Assessments", value: newbornCount, icon: "👶", color: "bg-blue-100 text-blue-600" },
          { label: "High Risk Alerts", value: highRiskCount, icon: "🛡️", color: "bg-green-100 text-green-600" },
          { label: "Recent Records", value: records.length, icon: "📋", color: "bg-purple-100 text-purple-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 lg:gap-4">
            <div className={`p-2 lg:p-3 rounded-full text-lg lg:text-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl lg:text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-gray-400">Total assessments</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2 flex-wrap">
            👤 Maternal Health Assessment
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">TEST</span>
          </h2>
          <p className="text-xs text-gray-500 mb-4">Try the AI with different values. Nothing is saved here.</p>
          <form onSubmit={handleMaternalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-600 mb-1">Age (years)</label><input type="number" value={maternalData.age} onChange={(e) => setMaternalData({...maternalData, age: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Blood Sugar (BS)</label><input type="number" step="0.1" value={maternalData.bs} onChange={(e) => setMaternalData({...maternalData, bs: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Systolic BP (mmHg)</label><input type="number" value={maternalData.systolic_bp} onChange={(e) => setMaternalData({...maternalData, systolic_bp: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Diastolic BP (mmHg)</label><input type="number" value={maternalData.diastolic_bp} onChange={(e) => setMaternalData({...maternalData, diastolic_bp: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Body Temp (°F)</label><input type="number" step="0.1" value={maternalData.body_temp} onChange={(e) => setMaternalData({...maternalData, body_temp: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Heart Rate (bpm)</label><input type="number" value={maternalData.heart_rate} onChange={(e) => setMaternalData({...maternalData, heart_rate: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <button type="submit" disabled={maternalLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              {maternalLoading ? "🔍 Analyzing..." : "🔍 Test Maternal Risk"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📈 Test Result</h2>
          {maternalResult ? (
            <div className={`p-4 rounded-lg border-2 ${getRiskStyles(maternalResult.risk_level).border} ${getRiskStyles(maternalResult.risk_level).bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{getRiskStyles(maternalResult.risk_level).icon}</span>
                <h3 className={`text-2xl font-bold ${getRiskStyles(maternalResult.risk_level).text}`}>{maternalResult.risk_level.toUpperCase()}</h3>
              </div>
              <p className="text-xs text-gray-700 mb-4">Test result — based on entered values.</p>
              <div className="mb-3">
                <h4 className="font-semibold text-sm mb-1">Risk Factors Identified:</h4>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                  {maternalResult.risk_factors.map((factor, i) => <li key={i}>{factor}</li>)}
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-semibold text-xs text-blue-900 mb-1">👨‍⚕️ Recommended Action</h4>
                <p className="text-xs text-blue-800">{maternalResult.recommended_action}</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Submit the test form to see the AI result.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2 flex-wrap">
            👶 Newborn Health Assessment
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">TEST</span>
          </h2>
          <p className="text-xs text-gray-500 mb-4">Try the AI with different values. Nothing is saved here.</p>
          <form onSubmit={handleNewbornSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-600 mb-1">Birth Weight (kg)</label><input type="number" step="0.1" value={newbornData.birth_weight} onChange={(e) => setNewbornData({...newbornData, birth_weight: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Temperature (°C)</label><input type="number" step="0.1" value={newbornData.temperature} onChange={(e) => setNewbornData({...newbornData, temperature: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Respiratory Rate (breaths/min)</label><input type="number" value={newbornData.respiratory_rate} onChange={(e) => setNewbornData({...newbornData, respiratory_rate: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Oxygen Saturation (%)</label><input type="number" value={newbornData.oxygen_saturation} onChange={(e) => setNewbornData({...newbornData, oxygen_saturation: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Feeding Observation</label>
                <select value={newbornData.feeding} onChange={(e) => setNewbornData({...newbornData, feeding: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                  <option>Good feeding</option>
                  <option>Poor feeding</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={newbornLoading} className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium text-sm">
              {newbornLoading ? "🔍 Analyzing..." : "🔍 Test Newborn Risk"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📈 Test Result</h2>
          {newbornResult ? (
            <div className={`p-4 rounded-lg border-2 ${getRiskStyles(newbornResult.risk_level).border} ${getRiskStyles(newbornResult.risk_level).bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{getRiskStyles(newbornResult.risk_level).icon}</span>
                <h3 className={`text-2xl font-bold ${getRiskStyles(newbornResult.risk_level).text}`}>{newbornResult.risk_level.toUpperCase()} RISK</h3>
              </div>
              <p className="text-xs text-gray-700 mb-4">Test result — based on entered values.</p>
              <div className="mb-3">
                <h4 className="font-semibold text-sm mb-1">Risk Factors Identified:</h4>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                  {newbornResult.risk_factors.map((factor, i) => <li key={i}>{factor}</li>)}
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-semibold text-xs text-blue-900 mb-1">👨‍⚕️ Recommended Action</h4>
                <p className="text-xs text-blue-800">{newbornResult.recommended_action}</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Submit the test form to see the AI result.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">📋 Recent Records</h2>
            <Link to="/records" className="text-xs text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Name / ID</th>
                  <th className="pb-2 font-medium">Risk Level</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-400 text-xs">No records yet. Submit an assessment to see data here.</td></tr>
                ) : records.slice(0, 6).map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 cursor-pointer">
                    <td className="py-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${r.type === 'Maternal' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{r.type}</span>
                    </td>
                    <td className="py-2">
                      <Link to={`/patient/${r.id}`} className="text-blue-600 hover:underline font-medium">{r.name}</Link>
                    </td>
                    <td className="py-2"><span className={`text-xs px-2 py-1 rounded font-medium ${getRiskStyles(r.level).badge}`}>{r.level}</span></td>
                    <td className="py-2 text-slate-500 text-xs">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">⚙️ System Overview</h2>
          <div className="space-y-3">
            {[
              { icon: "📥", label: "Input Health Data", color: "bg-blue-100 text-blue-600" },
              { icon: "🔍", label: "Preprocessing & Validation", color: "bg-purple-100 text-purple-600" },
              { icon: "🧠", label: "ML Model Prediction", color: "bg-green-100 text-green-600" },
              { icon: "🎯", label: "Risk Classification", color: "bg-yellow-100 text-yellow-600" },
              { icon: "🚨", label: "Alert & Action", color: "bg-red-100 text-red-600" },
            ].map((step, i, arr) => (
              <div key={i}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-lg ${step.color}`}>{step.icon}</div>
                  <span className="text-sm text-slate-700">{step.label}</span>
                </div>
                {i < arr.length - 1 && <div className="ml-5 mt-1 mb-1 text-gray-300 text-xs">↓</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}