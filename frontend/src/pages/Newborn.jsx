import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { api } from '../utils/api';

export default function Newborn() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    baby_name: '',
    mother_name: '',
    birth_weight: 2.4, temperature: 36.1, respiratory_rate: 68,
    oxygen_saturation: 88, feeding: "Poor feeding"
  });
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.baby_name.trim()) {
      setToast({ message: "Please enter the baby's name.", type: 'error' });
      return;
    }
    setSaved(false);
    try {
      const json = await api.createNewborn(data);
      setResult(json);
      setSaved(true);
      setToast({ message: `Record saved for ${data.baby_name}`, type: 'success' });
    } catch (err) {
      setToast({ message: "Backend not reachable. Is uvicorn running?", type: 'error' });
    }
  };

  const styles = (level) => {
    const l = level?.toLowerCase();
    if (l?.includes('high')) return { border: 'border-red-500 dark:border-red-500', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', icon: '⚠️' };
    if (l?.includes('mid') || l?.includes('moderate')) return { border: 'border-yellow-500 dark:border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-600 dark:text-yellow-400', icon: '⚡' };
    return { border: 'border-green-500 dark:border-green-500', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', icon: '✅' };
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">👶 Newborn Health Assessment</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Enter the newborn's health information to get a risk prediction.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Newborn Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1 font-medium">Baby's Name *</label>
                <input type="text" placeholder="e.g., Baby John" value={data.baby_name} onChange={(e) => setData({...data, baby_name: e.target.value})} className="w-full p-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Mother's Name</label>
                <input type="text" placeholder="e.g., Grace Akello" value={data.mother_name} onChange={(e) => setData({...data, mother_name: e.target.value})} className="w-full p-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm" />
              </div>
              <div><label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Birth Weight (kg)</label><input type="number" step="0.1" value={data.birth_weight} onChange={(e) => setData({...data, birth_weight: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Temperature (°C)</label><input type="number" step="0.1" value={data.temperature} onChange={(e) => setData({...data, temperature: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Respiratory Rate (breaths/min)</label><input type="number" value={data.respiratory_rate} onChange={(e) => setData({...data, respiratory_rate: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Oxygen Saturation (%)</label><input type="number" value={data.oxygen_saturation} onChange={(e) => setData({...data, oxygen_saturation: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm" /></div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Feeding Observation</label>
                <select value={data.feeding} onChange={(e) => setData({...data, feeding: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm">
                  <option>Good feeding</option>
                  <option>Poor feeding</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium text-sm">
              🔍 Analyze & Save
            </button>
            {saved && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 text-xs p-2.5 rounded-lg flex items-center justify-between">
                <span>✅ Record saved for <strong>{data.baby_name}</strong></span>
                <button onClick={() => navigate('/records')} className="text-green-700 dark:text-green-300 underline font-medium">View Records →</button>
              </div>
            )}
          </form>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">📈 Prediction Result</h2>
          {result ? (
            <div className={`p-4 rounded-lg border-2 ${styles(result.risk_level).border} ${styles(result.risk_level).bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{styles(result.risk_level).icon}</span>
                <h3 className={`text-2xl font-bold ${styles(result.risk_level).text}`}>{result.risk_level.toUpperCase()} RISK</h3>
              </div>
              <p className="text-xs text-gray-700 dark:text-slate-300 mb-4">Assessment for <strong>{data.baby_name}</strong> shows signs that require closer monitoring.</p>
              <div className="mb-3">
                <h4 className="font-semibold text-sm mb-1 text-slate-800 dark:text-white">Risk Factors Identified:</h4>
                <ul className="list-disc list-inside text-xs text-gray-700 dark:text-slate-300 space-y-1">
                  {result.risk_factors.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded border border-blue-200 dark:border-blue-900">
                <h4 className="font-semibold text-xs text-blue-900 dark:text-blue-200 mb-1">👨‍⚕️ Recommended Action</h4>
                <p className="text-xs text-blue-800 dark:text-blue-300">{result.recommended_action}</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">Submit the form to see the prediction result.</div>
          )}
        </div>
      </div>
    </>
  );
}