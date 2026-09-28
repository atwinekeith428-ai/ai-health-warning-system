import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 4) {
      setError('Invalid credentials.');
      return;
    }
    const namePart = email.split('@')[0];
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    localStorage.setItem('authUser', JSON.stringify({
      email,
      name: displayName,
      role: 'Healthcare Worker',
      loginTime: new Date().toISOString(),
    }));

    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 text-white">
        <div className="text-8xl mb-6">❤️</div>
        <h1 className="text-4xl font-bold text-center leading-tight mb-3">
          AI-Based Early<br />Warning System
        </h1>
        <p className="text-blue-200 text-center max-w-md">
          Detecting Health Risks in Expectant Mothers and Newborn Babies
        </p>
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-1">👤</div>
            <p className="text-xs text-blue-200">Maternal<br />Assessments</p>
          </div>
          <div>
            <div className="text-3xl mb-1">👶</div>
            <p className="text-xs text-blue-200">Newborn<br />Assessments</p>
          </div>
          <div>
            <div className="text-3xl mb-1">🧠</div>
            <p className="text-xs text-blue-200">AI-Powered<br />Predictions</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <div className="text-5xl">❤️</div>
            <h1 className="text-xl font-bold text-slate-800 mt-2">AI Health Warning System</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back 👋</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to access the dashboard.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Sign In →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}