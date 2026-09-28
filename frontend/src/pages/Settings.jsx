import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';

const DEFAULT_THRESHOLDS = {
  bp_systolic: 140,
  bp_diastolic: 90,
  heart_rate: 100,
  bs: 11,
  temp: 100.4,
  age_high: 40,
  age_low: 17,
};

export default function Settings() {
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('thresholds');
    if (stored) {
      try { setThresholds({ ...DEFAULT_THRESHOLDS, ...JSON.parse(stored) }); } catch {}
    }
    const u = localStorage.getItem('authUser');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleChange = (key, val) => {
    setThresholds(prev => ({ ...prev, [key]: val === '' ? '' : Number(val) }));
  };

  const save = () => {
    localStorage.setItem('thresholds', JSON.stringify(thresholds));
    setToast({ message: "✅ Settings saved successfully.", type: 'success' });
  };

  const reset = () => {
    if (!confirm("Reset all thresholds to clinical defaults?")) return;
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.setItem('thresholds', JSON.stringify(DEFAULT_THRESHOLDS));
    setToast({ message: "Thresholds reset to defaults.", type: 'info' });
  };

  const exportData = () => {
    const records = localStorage.getItem('healthRecords') || '[]';
    const blob = new Blob([records], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-records-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: "📥 Records exported.", type: 'success' });
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error("Invalid format");
        if (!confirm(`Import ${parsed.length} records? This will replace existing records.`)) return;
        localStorage.setItem('healthRecords', JSON.stringify(parsed));
        setToast({ message: `✅ Imported ${parsed.length} records.`, type: 'success' });
      } catch {
        setToast({ message: "❌ Invalid file. Please upload a valid export.", type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearAll = () => {
    if (!confirm("⚠️ DELETE ALL records? This cannot be undone.")) return;
    localStorage.removeItem('healthRecords');
    setToast({ message: "All records deleted.", type: 'info' });
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    window.location.href = '/login';
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Settings</h1>
        <p className="text-sm text-slate-600">Configure clinical thresholds, manage data, and account preferences.</p>
      </header>

      {/* User Profile */}
      {user && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 max-w-3xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">👤 User Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">Role: {user.role}</p>
            </div>
            <button onClick={logout} className="ml-auto text-xs bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 font-medium">
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Clinical Thresholds */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 max-w-3xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">🎯 Clinical Thresholds</h2>
            <p className="text-xs text-gray-500 mt-1">Values above these limits trigger risk warnings on the dashboard.</p>
          </div>
          <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-700 underline">Reset defaults</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Systolic BP (mmHg)</label>
            <input type="number" value={thresholds.bp_systolic} onChange={(e) => handleChange('bp_systolic', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Diastolic BP (mmHg)</label>
            <input type="number" value={thresholds.bp_diastolic} onChange={(e) => handleChange('bp_diastolic', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
            <input type="number" value={thresholds.heart_rate} onChange={(e) => handleChange('heart_rate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Blood Sugar (mmol/L)</label>
            <input type="number" step="0.1" value={thresholds.bs} onChange={(e) => handleChange('bs', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Body Temp (°F)</label>
            <input type="number" step="0.1" value={thresholds.temp} onChange={(e) => handleChange('temp', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">High Age Threshold (years)</label>
            <input type="number" value={thresholds.age_high} onChange={(e) => handleChange('age_high', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Young Age Threshold (years)</label>
            <input type="number" value={thresholds.age_low} onChange={(e) => handleChange('age_low', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <button onClick={save} className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
          💾 Save Settings
        </button>
      </div>

      {/* Data Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 max-w-3xl">
        <h2 className="text-lg font-bold text-slate-800 mb-1">💾 Data Management</h2>
        <p className="text-xs text-gray-500 mb-4">Export, import, or clear your stored patient records.</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportData} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
            📥 Export Records (JSON)
          </button>
          <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer">
            📤 Import Records
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
          <button onClick={clearAll} className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 ml-auto">
            🗑️ Delete All Records
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
        <h2 className="text-lg font-bold text-slate-800 mb-3">ℹ️ About This System</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Version</p>
            <p className="font-medium text-slate-800">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-500">AI Model</p>
            <p className="font-medium text-slate-800">Random Forest Classifier</p>
          </div>
          <div>
            <p className="text-gray-500">Model Accuracy</p>
            <p className="font-medium text-slate-800">81.28%</p>
          </div>
          <div>
            <p className="text-gray-500">Dataset</p>
            <p className="font-medium text-slate-800">Maternal Health Risk (UCI)</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
          ⚠️ This system is for educational and decision-support purposes. Always consult a licensed medical professional for clinical decisions.
        </p>
      </div>
    </>
  );
}