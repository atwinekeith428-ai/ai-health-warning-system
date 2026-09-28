import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Maternal from './pages/Maternal';
import Newborn from './pages/Newborn';
import Records from './pages/Records';
import PatientDetail from './pages/PatientDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { isAuthenticated } from './utils/auth';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/maternal" element={<RequireAuth><Maternal /></RequireAuth>} />
        <Route path="/newborn" element={<RequireAuth><Newborn /></RequireAuth>} />
        <Route path="/records" element={<RequireAuth><Records /></RequireAuth>} />
        <Route path="/patient/:id" element={<RequireAuth><PatientDetail /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;