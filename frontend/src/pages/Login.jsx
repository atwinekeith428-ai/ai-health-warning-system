import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HERO_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQM7UUpMQoCHLMhWQw-x5BYvXnQG3DMKAjiWxvBpxfUWeiGQWtgQDBcru3&s=10',
  'https://esaro.unfpa.org/sites/default/files/news/2date26-date9/WhatsApp%20Image%202026-09-28%20at%2010.24.54%20AM.jpeg',
  'https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2021/06/GettyImages-694024327_header-1024x575.jpg?w=1155&h=1528',
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setImageIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

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
    <div className="relative min-h-screen overflow-hidden bg-slate-900">

      {/* FULL-SCREEN CAROUSEL BACKGROUND */}
      {HERO_IMAGES.map((img, i) => (
        <img
          key={i}
          src={img}
          alt="Maternova"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === imageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-blue-900/60"></div>

      {/* FLOATING CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Top bar: Logo */}
        <div className="p-6 lg:p-8 flex items-center gap-3">
          <img
            src="/maternova-logo.png"
            alt="Maternova"
            className="w-12 h-12 lg:w-14 lg:h-14 object-contain drop-shadow-lg"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="text-white">
            <div className="text-lg lg:text-xl font-bold tracking-tight leading-tight">Maternova</div>
            <div className="text-[10px] uppercase tracking-widest text-blue-200/80">AI Health Monitoring</div>
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 pb-8">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: Hero text */}
            <div className="hidden lg:block text-white">
              <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-5 tracking-tight">
                Protecting Mothers &amp; Newborns
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed mb-8 max-w-lg">
                AI-powered early warning for timely intervention, better outcomes and healthier futures.
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-lg">
                {[
                  { icon: '👤', label: 'Maternal\nAssessments' },
                  { icon: '👶', label: 'Newborn\nAssessments' },
                  { icon: '🧠', label: 'AI-Powered\nPredictions' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="text-[10px] text-blue-100/80 uppercase tracking-wider leading-tight whitespace-pre-line">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Glass login card */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 lg:p-10">

                <div className="lg:hidden text-center mb-6">
                  <img
                    src="/maternova-logo.png"
                    alt="Maternova"
                    className="w-20 h-20 object-contain mx-auto mb-2"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>

                <div className="mb-7">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">
                    Welcome back 👋
                  </h2>
                  <p className="text-sm text-blue-100/70">
                    Sign in to access your healthcare dashboard.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-400/40 text-red-100 text-sm p-3 rounded-xl mb-5 flex items-start gap-2 backdrop-blur-sm">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-blue-100/80 mb-2 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@hospital.com"
                      autoComplete="email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 rounded-xl text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-blue-100/80 uppercase tracking-wider">
                        Password
                      </label>
                      <button type="button" className="text-[11px] text-blue-200 hover:text-white hover:underline font-medium">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 rounded-xl text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/70 hover:text-white text-sm"
                        tabIndex={-1}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded text-blue-500 bg-white/10 border-white/20 focus:ring-blue-500" />
                    <label htmlFor="remember" className="text-xs text-blue-100/80">Remember me on this device</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3.5 rounded-xl transition font-semibold text-sm shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50"
                  >
                    Sign In →
                  </button>
                </form>

                <div className="flex items-center justify-center gap-6 text-[10px] text-blue-200/60 uppercase tracking-wider mt-7 pt-6 border-t border-white/10">
                  <span className="flex items-center gap-1.5">🔒 Encrypted</span>
                  <span className="flex items-center gap-1.5">🛡️ HIPAA-ready</span>
                  <span className="flex items-center gap-1.5">✓ Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}