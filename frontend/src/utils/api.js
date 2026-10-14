// Detect if the app is running as an installed PWA
const isStandalone = 
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

// Detect if running on a real localhost dev server
const isDevLocalhost = 
  window.location.hostname === 'localhost' && 
  !isStandalone;

// Local dev → use local backend
// Anything else (deployed OR installed PWA) → use live Render backend
const API_BASE = isDevLocalhost
  ? 'http://127.0.0.1:8000'
  : 'https://ai-health-backend-1ebp.onrender.com';

console.log('🔗 API Base URL:', API_BASE, '| standalone:', isStandalone);

export const api = {
  async getAllRecords() {
    const res = await fetch(`${API_BASE}/api/records`);
    if (!res.ok) throw new Error('Failed to fetch records');
    return res.json();
  },

  async getRecord(id) {
    const res = await fetch(`${API_BASE}/api/records/${id}`);
    if (!res.ok) throw new Error('Record not found');
    return res.json();
  },

  async createMaternal(data) {
    const res = await fetch(`${API_BASE}/api/records/maternal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save maternal record');
    return res.json();
  },

  async createNewborn(data) {
    const res = await fetch(`${API_BASE}/api/records/newborn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save newborn record');
    return res.json();
  },

  async updateRecord(id, data) {
    const res = await fetch(`${API_BASE}/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update record');
    return res.json();
  },

  async deleteRecord(id) {
    const res = await fetch(`${API_BASE}/api/records/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete record');
    return res.json();
  },

  async deleteAllRecords() {
    const res = await fetch(`${API_BASE}/api/records`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete all records');
    return res.json();
  },

  async predictMaternal(data) {
    const res = await fetch(`${API_BASE}/api/predict/maternal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Prediction failed');
    return res.json();
  },
};