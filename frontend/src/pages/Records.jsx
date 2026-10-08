import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import { api } from '../utils/api';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getAllRecords();
      setRecords(data);
    } catch (err) {
      setToast({ message: "Failed to load records. Is the backend running?", type: 'error' });
    }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete record for "${name}"?`)) return;
    try {
      await api.deleteRecord(id);
      setRecords(records.filter(r => r.id !== id));
      setToast({ message: `Record deleted: ${name}`, type: 'success' });
    } catch {
      setToast({ message: "Failed to delete record.", type: 'error' });
    }
  };

  const handleEdit = (e, record) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(record.id);
    setEditName(record.name);
    setEditLevel(record.level);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setToast({ message: "Name cannot be empty.", type: 'error' });
      return;
    }
    try {
      await api.updateRecord(editing, { name: editName.trim(), level: editLevel });
      setRecords(records.map(r => r.id === editing ? { ...r, name: editName.trim(), level: editLevel } : r));
      setEditing(null);
      setToast({ message: "Record updated.", type: 'success' });
    } catch {
      setToast({ message: "Failed to update.", type: 'error' });
    }
  };

  const clearAll = async () => {
    if (!confirm("⚠️ Delete ALL records? This cannot be undone.")) return;
    try {
      await api.deleteAllRecords();
      setRecords([]);
      setToast({ message: "All records cleared.", type: 'info' });
    } catch {
      setToast({ message: "Failed to clear records.", type: 'error' });
    }
  };

  const getBadge = (level) => {
    const l = level?.toLowerCase();
    if (l?.includes('high')) return 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300';
    if (l?.includes('mid') || l?.includes('moderate')) return 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300';
    return 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300';
  };

  const filtered = records
    .filter(r => filter === 'All' ? true : r.type === filter)
    .filter(r => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) ||
             (r.patient_id && r.patient_id.toLowerCase().includes(q)) ||
             (r.mother_name && r.mother_name.toLowerCase().includes(q)) ||
             r.level.toLowerCase().includes(q);
    });

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">📋 All Patient Records</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Click a patient name to view their full assessment.</p>
        </div>
        <button onClick={clearAll} className="text-xs bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-950/60 transition font-medium self-start sm:self-auto">
          🗑️ Clear All Records
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {['All', 'Maternal', 'Newborn'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              {f} {f === 'All' ? `(${records.length})` : f === 'Maternal' ? `(${records.filter(r => r.type === 'Maternal').length})` : `(${records.filter(r => r.type === 'Newborn').length})`}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input type="text" placeholder="🔍 Search by name, patient ID, mother, or risk..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg text-sm" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-950/50">
              <tr className="text-left text-xs text-gray-500 dark:text-slate-400">
                <th className="p-4 font-medium">Patient ID</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Patient Name</th>
                <th className="p-4 font-medium">Risk Level</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400 dark:text-slate-500">Loading records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400 dark:text-slate-500">No records found. {search ? 'Try a different search.' : 'Submit an assessment to get started.'}</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition">
                  <td className="p-4">
                    <span className="text-xs font-mono bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-1 rounded">
                      {r.patient_id || '—'}
                    </span>
                  </td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded font-medium ${r.type === 'Maternal' ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400'}`}>{r.type}</span></td>
                  <td className="p-4">
                    {editing === r.id ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-1.5 border border-blue-400 dark:border-blue-500 rounded text-sm dark:bg-slate-800 dark:text-white" autoFocus />
                    ) : (
                      <Link to={`/patient/${r.id}`} className="block group">
                        <div className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">{r.name}</div>
                        {r.mother_name && r.mother_name !== 'N/A' && (
                          <div className="text-xs text-gray-500 dark:text-slate-500">Mother: {r.mother_name}</div>
                        )}
                      </Link>
                    )}
                  </td>
                  <td className="p-4">
                    {editing === r.id ? (
                      <select value={editLevel} onChange={(e) => setEditLevel(e.target.value)} className="p-1.5 border border-blue-400 dark:border-blue-500 rounded text-xs dark:bg-slate-800 dark:text-white">
                        <option>Low</option>
                        <option>Moderate</option>
                        <option>Mid</option>
                        <option>High</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getBadge(r.level)}`}>{r.level}</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">{r.date}</td>
                  <td className="p-4 text-right">
                    {editing === r.id ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={handleSaveEdit} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-medium">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 font-medium">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button onClick={(e) => handleEdit(e, r)} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 font-medium">✏️ Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id, r.name); }} className="text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-950/60 font-medium">🗑️</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {records.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-4">Showing {filtered.length} of {records.length} total records.</p>
      )}
    </>
  );
}