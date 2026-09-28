import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { api } from '../utils/api';

export default function Maternal() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    patient_name: '',
    age: 28, systolic_bp: 140, diastolic_bp: 90,
    bs: 15, body_temp: 98, heart_rate: 102
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.patient_name.trim()) {
      setToast({ message: "Please enter the patient's name.", type: 'error' });
      return;
    }
    setLoading(true);
    setSaved(false);
    try {
      const json = await api.createMaternal(data);
      setResult(json);
      setSaved(true);
      setToast({ message: `Record saved for ${data.patient_name}`, type: 'success' });
    } catch (err) {
      setToast({ message: "Backend not reachable. Is uvicorn running?", type: 'error' });
    }
    setLoading(false);
  };

  const styles = (level) => {
    const l = level?.toLowerCase();
    if (l?.includes('high')) return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', icon: '⚠️' };
    if (l?.includes('mid') || l?.includes('moderate')) return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600', icon: '⚡' };
    return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600', icon: '✅' };
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">👤 Maternal Health Assessment</h1>
        <p className="text-xs sm:text-sm text-slate-600">Enter the mother's health information to get an AI-powered risk prediction.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Patient Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Patient Name *</label>
              <input type="text" placeholder="e.g., Grace Akello" value={data.patient_name} onChange={(e) => setData({...data, patient_name: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-600 mb-1">Age (years)</label><input type="number" value={data.age} onChange={(e) => setData({...data, age: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Blood Sugar (BS)</label><input type="number" step="0.1" value={data.bs} onChange={(e) => setData({...data, bs: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Systolic BP (mmHg)</label><input type="number" value={data.systolic_bp} onChange={(e) => setData({...data, systolic_bp: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Diastolic BP (mmHg)</label><input type="number" value={data.diastolic_bp} onChange={(e) => setData({...data, diastolic_bp: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Body Temp (°F)</label><input type="number" step="0.1" value={data.body_temp} onChange={(e) => setData({...data, body_temp: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Heart Rate (bpm)</label><input type="number" value={data.heart_rate} onChange={(e) => setData({...data, heart_rate: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-60">
              {loading ? "🔍 Analyzing..." : "🔍 Analyze & Save"}
            </button>
            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-2.5 rounded-lg flex items-center justify-between">
                <span>✅ Record saved for <strong>{data.patient_name}</strong></span>
                <button onClick={() => navigate('/records')} className="text-green-700 underline font-medium">View Records →</button>
              </div>
            )}
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">📈 Prediction Result</h2>
          {result ? (
            <div className={`p-4 rounded-lg border-2 ${styles(result.risk_level).border} ${styles(result.risk_level).bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{styles(result.risk_level).icon}</span>
                <h3 className={`text-2xl font-bold ${styles(result.risk_level).text}`}>{result.risk_level.toUpperCase()}</h3>
              </div>
              <p className="text-xs text-gray-700 mb-4">Assessment for <strong>{data.patient_name}</strong> detected a potential risk based on the entered indicators.</p>
              <div className="mb-3">
                <h4 className="font-semibold text-sm mb-1">Risk Factors Identified:</h4>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                  {result.risk_factors.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-semibold text-xs text-blue-900 mb-1">👨‍⚕️ Recommended Action</h4>
                <p className="text-xs text-blue-800">{result.recommended_action}</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Submit the form to see the prediction result.</div>
          )}
        </div>
      </div>
    </>
  );
}