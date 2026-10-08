import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { getUser } from '../utils/auth';
import { api } from '../utils/api';

const HERO_IMAGES = [
  'https://media.istockphoto.com/id/2239201780/photo/joyful-black-mother-cradling-newborn-baby-in-hospital-bed-after-birth.jpg?s=1024x1024&w=is&k=20&c=jyehpIxnGrYvwhR4eU-ZEWwtFgpZLH10MI_75Ds0o9Y=',
  'https://www.bulamuhealthcare.org/wp-content/uploads/2023/06/MCH-1-scaled.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBTRg5yw9rDTcNo-Rr0364NBDr5aiJsWiv__aA3_lKPQ&s=10',
];

export default function DashboardHome() {
  const user = getUser();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [toast, setToast] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);

  const [searchType, setSearchType] = useState('Maternal');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const [maternalData, setMaternalData] = useState({
    age: 28, systolic_bp: 140, diastolic_bp: 90,
    bs: 15, body_temp: 37.0, heart_rate: 102
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

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((s) => (s + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchResults = searchTerm.trim()
    ? records
        .filter(r => r.type === searchType)
        .filter(r => {
          const q = searchTerm.toLowerCase();
          return r.name.toLowerCase().includes(q) ||
                 (r.patient_id && r.patient_id.toLowerCase().includes(q));
        })
        .slice(0, 8)
    : [];

  const handleSelectPatient = (record) => {
    setSearchTerm('');
    setSearchOpen(false);
    navigate(`/patient/${record.id}`);
  };

  const handleMaternalSubmit = async (e) => {
    e.preventDefault();
    setMaternalLoading(true);
    try {
      const bodyTempF = (maternalData.body_temp * 9 / 5) + 32;
      const payload = { ...maternalData, body_temp: bodyTempF };
      const data = await api.predictMaternal(payload);
      setMaternalResult(data);
      setToast({ message: "Test prediction only — not saved.", type: 'info' });
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
    setToast({ message: "Test prediction only — not saved.", type: 'info' });
    setNewbornLoading(false);
  };

  const getRiskStyles = (level) => {
    const l = level?.toLowerCase();
    if (l?.includes('high')) return { border: 'border-red-500 dark:border-red-500', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300', dot: 'bg-red-500' };
    if (l?.includes('mid') || l?.includes('moderate')) return { border: 'border-yellow-500 dark:border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' };
    return { border: 'border-green-500 dark:border-green-500', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300', dot: 'bg-green-500' };
  };

  const maternalCount = records.filter(r => r.type === 'Maternal').length;
  const newbornCount = records.filter(r => r.type === 'Newborn').length;
  const highRiskCount = records.filter(r => r.level.toLowerCase().includes('high')).length;

  const recentRecords = records.slice(0, 6);

  const last7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return days;
  };

  const weekly = last7Days().map(day => {
    const dayRecords = records.filter(r => r.date === day.date);
    return {
      ...day,
      low: dayRecords.filter(r => r.level.toLowerCase().includes('low')).length,
      moderate: dayRecords.filter(r => r.level.toLowerCase().includes('mod') || r.level.toLowerCase().includes('mid')).length,
      high: dayRecords.filter(r => r.level.toLowerCase().includes('high')).length,
      total: dayRecords.length,
    };
  });

  const maxWeekly = Math.max(...weekly.map(w => w.total), 1);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ============ TOP BAR ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div ref={searchRef} className="relative flex-1 max-w-lg">
          <div className="flex bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-transparent border-r border-gray-200 dark:border-slate-800 text-xs font-medium px-3 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="Maternal">👤 Maternal</option>
              <option value="Newborn">👶 Newborn</option>
            </select>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder={`Search ${searchType.toLowerCase()} by name or ID...`}
              className="flex-1 px-4 py-2.5 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />

            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setSearchOpen(false); }}
                className="px-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {searchOpen && searchTerm.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg z-30 overflow-hidden max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 dark:text-slate-400 text-center">
                  No {searchType.toLowerCase()} patients found for "{searchTerm}"
                </div>
              ) : (
                searchResults.map(r => {
                  const risk = getRiskStyles(r.level);
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelectPatient(r)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition border-b border-gray-100 dark:border-slate-800 last:border-0 flex items-center gap-3"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${r.type === 'Maternal' ? 'bg-red-100 dark:bg-red-950/50' : 'bg-green-100 dark:bg-green-950/50'}`}>
                        {r.type === 'Maternal' ? '👤' : '👶'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-white truncate">
                          {r.name}
                          {r.patient_id && (
                            <span className="ml-2 text-[10px] font-mono bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                              {r.patient_id}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {r.mother_name && r.mother_name !== 'N/A' ? `Mother: ${r.mother_name} • ` : ''}{r.date}
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${risk.badge}`}>
                        {r.level}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-center text-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">
            🔔
            {highRiskCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full pl-1 pr-4 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">{user?.name || 'Guest'}</div>
              <div className="text-[10px] text-gray-500 dark:text-slate-400">{user?.role || 'Healthcare Worker'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* HERO BANNER WITH CAROUSEL */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-48 sm:h-56 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-gray-100 dark:border-slate-800">
        <div className="absolute inset-0 flex items-center">
          <div className="flex-1 p-6 sm:p-10 z-10">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-full mb-3 border border-gray-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">System Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white leading-tight mb-2">
              Protecting Mothers &amp; Newborns
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg">
              AI-powered early warning for timely intervention, better outcomes and healthier futures.
            </p>
          </div>

          <div className="hidden md:block w-1/2 h-full relative overflow-hidden">
            {HERO_IMAGES.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Maternova"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === heroSlide ? 'opacity-100' : 'opacity-0'}`}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1400&auto=format&fit=crop&q=80'; }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 dark:from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Maternal Assessments", value: maternalCount, icon: "👤", iconBg: "bg-blue-100 dark:bg-blue-950/50", iconColor: "text-blue-600 dark:text-blue-400" },
          { label: "Newborn Assessments", value: newbornCount, icon: "👶", iconBg: "bg-blue-100 dark:bg-blue-950/50", iconColor: "text-blue-600 dark:text-blue-400" },
          { label: "High-Risk Alerts", value: highRiskCount, icon: "⚠️", iconBg: "bg-red-100 dark:bg-red-950/50", iconColor: "text-red-600 dark:text-red-400" },
          { label: "Recent Records", value: records.length, icon: "📋", iconBg: "bg-blue-100 dark:bg-blue-950/50", iconColor: "text-blue-600 dark:text-blue-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center text-lg ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">👤</span>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Maternal</h2>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">TEST</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Quick AI test — nothing is saved.</p>
          <form onSubmit={handleMaternalSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Age *', key: 'age', step: '1' },
                { label: 'BS *', key: 'bs', step: '0.1' },
                { label: 'Sys BP *', key: 'systolic_bp', step: '1' },
                { label: 'Dia BP *', key: 'diastolic_bp', step: '1' },
                { label: 'Temp °C *', key: 'body_temp', step: '0.1' },
                { label: 'HR *', key: 'heart_rate', step: '1' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] text-gray-500 dark:text-slate-400 mb-1">{f.label}</label>
                  <input type="number" step={f.step} value={maternalData[f.key]} onChange={(e) => setMaternalData({...maternalData, [f.key]: f.step === '0.1' ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={maternalLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium text-xs">
              {maternalLoading ? "🔍..." : "🔬 Test Maternal"}
            </button>
          </form>
          {maternalResult && (
            <div className={`mt-3 p-2.5 rounded-lg border ${getRiskStyles(maternalResult.risk_level).border} ${getRiskStyles(maternalResult.risk_level).bg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getRiskStyles(maternalResult.risk_level).dot}`}></span>
                <span className={`text-xs font-bold ${getRiskStyles(maternalResult.risk_level).text}`}>{maternalResult.risk_level.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">👶</span>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Newborn</h2>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">TEST</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Quick AI test — nothing is saved.</p>
          <form onSubmit={handleNewbornSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Weight kg *', key: 'birth_weight', step: '0.1' },
                { label: 'Temp °C *', key: 'temperature', step: '0.1' },
                { label: 'Resp Rate *', key: 'respiratory_rate', step: '1' },
                { label: 'O2 Sat % *', key: 'oxygen_saturation', step: '1' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] text-gray-500 dark:text-slate-400 mb-1">{f.label}</label>
                  <input type="number" step={f.step} value={newbornData[f.key]} onChange={(e) => setNewbornData({...newbornData, [f.key]: f.step === '0.1' ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-[10px] text-gray-500 dark:text-slate-400 mb-1">Feeding *</label>
                <select value={newbornData.feeding} onChange={(e) => setNewbornData({...newbornData, feeding: e.target.value})} className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white rounded-lg text-xs">
                  <option>Good feeding</option>
                  <option>Poor feeding</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={newbornLoading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium text-xs">
              {newbornLoading ? "🔍..." : "🔬 Test Newborn"}
            </button>
          </form>
          {newbornResult && (
            <div className={`mt-3 p-2.5 rounded-lg border ${getRiskStyles(newbornResult.risk_level).border} ${getRiskStyles(newbornResult.risk_level).bg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getRiskStyles(newbornResult.risk_level).dot}`}></span>
                <span className={`text-xs font-bold ${getRiskStyles(newbornResult.risk_level).text}`}>{newbornResult.risk_level.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">📊 Risk Overview</h2>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Last 7 days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px] mb-3 flex-wrap">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Low</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Mod</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> High</span>
          </div>
          <div className="relative h-32 flex items-end justify-around gap-1.5">
            {weekly.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse gap-0.5 h-28 justify-end">
                  {day.high > 0 && <div className="w-full bg-red-500 rounded-t" style={{ height: `${(day.high / maxWeekly) * 100}%` }} title={`${day.high} High`}></div>}
                  {day.moderate > 0 && <div className="w-full bg-yellow-500" style={{ height: `${(day.moderate / maxWeekly) * 100}%` }} title={`${day.moderate} Moderate`}></div>}
                  {day.low > 0 && <div className="w-full bg-green-500 rounded-b" style={{ height: `${(day.low / maxWeekly) * 100}%` }} title={`${day.low} Low`}></div>}
                  {day.total === 0 && <div className="w-full bg-gray-100 dark:bg-slate-800 rounded" style={{ height: '3px' }}></div>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-around text-[9px] text-gray-500 dark:text-slate-400 mt-2">
            {weekly.map((day, i) => <span key={i}>{day.label.split(' ')[1]}</span>)}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">📋 Recent</h2>
            <Link to="/records" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium">View All</Link>
          </div>
          <div className="space-y-1.5">
            {recentRecords.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-6">No assessments yet.</p>
            ) : recentRecords.slice(0, 6).map((r) => {
              const risk = getRiskStyles(r.level);
              return (
                <Link key={r.id} to={`/patient/${r.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded transition">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-800 dark:text-white truncate">
                      {r.name}
                      {r.patient_id && <span className="ml-1.5 text-[9px] font-mono text-gray-500 dark:text-slate-500">{r.patient_id}</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400">{r.date}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ml-2 ${risk.badge}`}>{r.level}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {highRiskCount > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">Active Alerts</p>
              <p className="text-xs text-red-800 dark:text-red-300">{highRiskCount} patient{highRiskCount > 1 ? 's' : ''} require immediate attention.</p>
            </div>
          </div>
          <Link to="/records" className="text-xs bg-white dark:bg-slate-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-900 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition font-medium whitespace-nowrap">
            View All Alerts →
          </Link>
        </div>
      )}
    </>
  );
}