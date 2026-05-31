import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequestDetail from './pages/RequestDetail';
import AuditLog from './pages/AuditLog';
import api, { setAccessToken, getAccessToken, setCurrentUserId } from './api/axios';

const BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.accessToken);
        const decoded = jwtDecode(res.data.accessToken);
        setCurrentUserId(decoded.id);
        setIsAuth(true);
      } catch {
        setIsAuth(false);
      } finally {
        setChecking(false);
      }
    };
    tryRefresh();
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const ProtectedRoute = ({ children }) => (isAuth || getAccessToken()) ? children : <Navigate to="/login" />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/requests/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />
        <Route path="/audit-log" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}