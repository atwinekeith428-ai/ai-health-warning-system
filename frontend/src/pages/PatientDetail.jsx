import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import { api } from '../utils/api';

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
    if (l?.includes('high')) return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', icon: '⚠️', badge: 'bg-red-100 text-red-700' };
    if (l?.includes('mid') || l?.includes('moderate')) return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600', icon: '⚡', badge: 'bg-yellow-100 text-yellow-700' };
    return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600', icon: '✅', badge: 'bg-green-100 text-green-700' };
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  if (!record) {
    return (
      <>
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Patient Not Found</h1>
        </header>
        <div className="bg-white p-12 rounded-xl text-center">
          <p className="text-gray-500 mb-4">This patient record doesn't exist or was deleted.</p>
          <Link to="/records" className="text-blue-600 hover:underline font-medium">← Back to Records</Link>
        </div>
      </>
    );
  }

  const st = styles(record.level);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button onClick={() => navigate('/records')} className="text-sm text-blue-600 hover:underline mb-4 font-medium">
        ← Back to Records
      </button>

      <div className={`bg-white rounded-xl shadow-sm border-l-4 ${st.border} mb-8 overflow-hidden`}>
        <div className={`${st.bg} p-6`}>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`text-4xl sm:text-5xl p-3 sm:p-4 rounded-full bg-white ${st.text}`}>
                {record.type === 'Maternal' ? '👤' : '👶'}
              </div>
              <div className="min-w-0">
                {editing ? (
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="text-xl sm:text-2xl font-bold p-2 border border-blue-400 rounded-lg bg-white w-full" autoFocus />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 break-words">{record.name}</h1>
                )}
                <p className="text-sm text-slate-600 mt-1">
                  <span className={`text-xs px-2 py-1 rounded font-medium mr-2 ${record.type === 'Maternal' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{record.type}</span>
                  {record.mother_name && record.mother_name !== 'N/A' && (
                    <span>Mother: <strong>{record.mother_name}</strong></span>
                  )}
                </p>
              </div>
            </div>
            <div className="sm:text-right">
              <span className={`inline-block text-xs px-3 py-1.5 rounded font-semibold ${st.badge}`}>{record.level} Risk</span>
              <p className="text-xs text-gray-500 mt-2">Last assessment: {record.date}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            {editing ? (
              <>
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">💾 Save Changes</button>
                <button onClick={() => { setEditing(false); setEditName(record.name); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">✏️ Edit Patient Info</button>
                <button onClick={handleDelete} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100">🗑️ Delete Record</button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">📊 Vitals ({record.date})</h2>
              {record.vitals && Object.keys(record.vitals).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(record.vitals).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No detailed vitals saved.</p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">🧠 AI Analysis</h2>
              {record.risk_factors && record.risk_factors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Risk Factors Identified:</h3>
                  <ul className="space-y-1">
                    {record.risk_factors.map((f, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className={st.text}>•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {record.recommended_action && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">👨‍⚕️ Recommended Action</h3>
                  <p className="text-sm text-blue-800">{record.recommended_action}</p>
                </div>
              )}
            </div>
          </div>

          {editing && (
            <div className="mt-6">
              <label className="block text-xs text-gray-600 mb-1 font-medium">Clinical Notes</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows="3" placeholder="Add any clinical notes about this patient..." className="w-full p-3 border border-gray-300 rounded-lg text-sm" />
            </div>
          )}

          {!editing && record.notes && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">📝 Clinical Notes</h3>
              <p className="text-sm text-yellow-800">{record.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">📜 Assessment History ({allRecords.length})</h2>
        {allRecords.length <= 1 ? (
          <p className="text-sm text-gray-500">No other assessments found for this patient.</p>
        ) : (
          <div className="space-y-3">
            {allRecords.map((h) => (
              <Link key={h.id} to={`/patient/${h.id}`} className={`block p-4 rounded-lg border-2 ${h.id === parseInt(id) ? 'border-blue-400 bg-blue-50' : `${styles(h.level).border} ${styles(h.level).bg}`} hover:shadow-md transition`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{h.date}</span>
                    {h.id === parseInt(id) && <span className="ml-2 text-xs text-blue-600 font-medium">(current)</span>}
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