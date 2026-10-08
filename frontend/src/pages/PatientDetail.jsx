import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import { api } from '../utils/api';

const toCelsius = (f) => {
  const n = parseFloat(f);
  if (isNaN(n)) return f;
  return Math.round(((n - 32) * 5 / 9) * 10) / 10;
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const rec = await api.getRecord(id);
      setRecord(rec);
      setEditName(rec.name);
      setEditNotes(rec.notes || '');

      const all = await api.getAllRecords();
      setAllRecords(all.filter(r => r.name === rec.name && r.type === rec.type));
    } catch {
      setRecord(null);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setToast({ message: "Name cannot be empty.", type: 'error' });
      return;
    }
    try {
      await api.updateRecord(id, { name: editName.trim(), notes: editNotes });
      setToast({ message: "Patient info updated.", type: 'success' });
      setEditing(false);
      load();
    } catch {
      setToast({ message: "Update failed.", type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete record for "${record.name}"?`)) return;
    try {
      await api.deleteRecord(id);
      navigate('/records');
    } catch {
      setToast({ message: "Delete failed.", type: 'error' });
    }
  };

  const styles = (level) => {
    const l = level?.toLowerCase();
    if (l?.includes('high')) return { border: 'border-red-500 dark:border-red-500', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300' };
    if (l?.includes('mid') || l?.includes('moderate')) return { border: 'border-yellow-500 dark:border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300' };
    return { border: 'border-green-500 dark:border-green-500', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300' };
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-slate-400">Loading...</div>;

  if (!record) {
    return (
      <>
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Patient Not Found</h1>
        </header>
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl text-center">
          <p className="text-gray-500 dark:text-slate-400 mb-4">This patient record doesn't exist or was deleted.</p>
          <Link to="/records" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">← Back to Records</Link>
        </div>
      </>
    );
  }

  const st = styles(record.level);

  const displayVitals = record.vitals ? { ...record.vitals } : {};
  if (displayVitals.body_temp !== undefined) {
    displayVitals.body_temp = `${toCelsius(displayVitals.body_temp)}°C`;
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button onClick={() => navigate('/records')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 font-medium">
        ← Back to Records
      </button>

      <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border-l-4 ${st.border} mb-8 overflow-hidden transition-colors`}>
        <div className={`${st.bg} p-6`}>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`text-4xl sm:text-5xl p-3 sm:p-4 rounded-full bg-white dark:bg-slate-800 ${st.text}`}>
                {record.type === 'Maternal' ? '👤' : '👶'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {record.patient_id && (
                    <span className="text-xs font-mono bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-gray-200 dark:border-slate-700">
                      {record.patient_id}
                    </span>
                  )}
                </div>
                {editing ? (
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="text-xl sm:text-2xl font-bold p-2 border border-blue-400 dark:border-blue-500 rounded-lg bg-white dark:bg-slate-800 dark:text-white w-full" autoFocus />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white break-words">{record.name}</h1>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <span className={`text-xs px-2 py-1 rounded font-medium mr-2 ${record.type === 'Maternal' ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'}`}>{record.type}</span>
                  {record.mother_name && record.mother_name !== 'N/A' && (
                    <span>Mother: <strong>{record.mother_name}</strong></span>
                  )}
                </p>
              </div>
            </div>
            <div className="sm:text-right">
              <span className={`inline-block text-xs px-3 py-1.5 rounded font-semibold ${st.badge}`}>{record.level} Risk</span>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Last assessment: {record.date}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            {editing ? (
              <>
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">💾 Save Changes</button>
                <button onClick={() => { setEditing(false); setEditName(record.name); }} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700">✏️ Edit Patient Info</button>
                <button onClick={handleDelete} className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/60">🗑️ Delete Record</button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">📊 Vitals ({record.date})</h2>
              {Object.keys(displayVitals).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(displayVitals).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                      <span className="text-sm text-gray-600 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-white">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400 italic">No detailed vitals saved.</p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">🧠 AI Analysis</h2>
              {record.risk_factors && record.risk_factors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Risk Factors Identified:</h3>
                  <ul className="space-y-1">
                    {record.risk_factors.map((f, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-slate-300 flex gap-2">
                        <span className={st.text}>•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {record.recommended_action && (
                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">👨‍⚕️ Recommended Action</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{record.recommended_action}</p>
                </div>
              )}
            </div>
          </div>

          {editing && (
            <div className="mt-6">
              <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1 font-medium">Clinical Notes</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows="3" placeholder="Add any clinical notes about this patient..." className="w-full p-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm" />
            </div>
          )}

          {!editing && record.notes && (
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">📝 Clinical Notes</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">{record.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">📜 Assessment History ({allRecords.length})</h2>
        {allRecords.length <= 1 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">No other assessments found for this patient.</p>
        ) : (
          <div className="space-y-3">
            {allRecords.map((h) => (
              <Link key={h.id} to={`/patient/${h.id}`} className={`block p-4 rounded-lg border-2 ${h.id === parseInt(id) ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30' : `${styles(h.level).border} ${styles(h.level).bg}`} hover:shadow-md transition`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{h.date}</span>
                    {h.patient_id && <span className="ml-2 text-xs font-mono text-gray-500 dark:text-slate-400">{h.patient_id}</span>}
                    {h.id === parseInt(id) && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">(current)</span>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${styles(h.level).badge}`}>{h.level} Risk</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}