// Use environment variable in production, fall back to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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