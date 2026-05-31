import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { clearAccessToken, currentUserRole } from '../api/axios';
import { useSocket } from '../hooks/useSocket';

const priorityColor = {
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  LOW: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const statusColor = {
  NEW: 'bg-gray-500/10 text-gray-400',
  QUEUED: 'bg-blue-500/10 text-blue-400',
  PROCESSING: 'bg-yellow-500/10 text-yellow-400',
  CLASSIFIED: 'bg-violet-500/10 text-violet-400',
  RESOLVED: 'bg-green-500/10 text-green-400',
  FAILED: 'bg-red-500/10 text-red-400',
};

const Toast = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 z-50 bg-violet-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm">
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    <span className="text-sm">{message}</span>
    <button onClick={onClose} className="ml-2 text-white/70 hover:text-white">✕</button>
  </div>
);

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;
      const res = await api.get('/requests', { params });
      setRequests(res.data.requests);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {}
    finally { setLoading(false); }
  }, [status, priority, category, page]);

  const fetchStats = useCallback(async () => {
    try {
      const [all, high, processing, resolved, failed] = await Promise.all([
        api.get('/requests', { params: { limit: 1 } }),
        api.get('/requests', { params: { priority: 'HIGH', limit: 1 } }),
        api.get('/requests', { params: { status: 'PROCESSING', limit: 1 } }),
        api.get('/requests', { params: { status: 'RESOLVED', limit: 1 } }),
        api.get('/requests', { params: { status: 'FAILED', limit: 1 } }),
      ]);
      setStats({
        total: all.data.total,
        high: high.data.total,
        processing: processing.data.total,
        resolved: resolved.data.total,
        failed: failed.data.total,
      });
    } catch {}
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleClassified = useCallback((data) => {
    showToast(`New request classified: ${data.category} / ${data.priority}`);
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats, showToast]);

  const handleFailed = useCallback(() => {
    showToast('Classification failed for a request');
    fetchRequests();
  }, [fetchRequests, showToast]);

  useSocket(handleClassified, handleFailed);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const setPage = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    clearAccessToken();
    navigate('/login');
  };

  const statCards = [
    { label: 'Total Requests', value: stats.total, color: 'violet' },
    { label: 'High Priority', value: stats.high, color: 'red' },
    { label: 'In Progress', value: stats.processing, color: 'yellow' },
    { label: 'Resolved', value: stats.resolved, color: 'green' },
    { label: 'Failed', value: stats.failed, color: 'red' },
  ];

  const colorMap = {
    violet: 'text-violet-400 bg-violet-500/10',
    red: 'text-red-400 bg-red-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    green: 'text-green-400 bg-green-500/10',
  };

  const navItems = [
    { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: !status },
    { label: 'All Requests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', count: stats.total },
    { label: 'High Priority', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9', count: stats.high },
    { label: 'Failed', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', count: stats.failed },
    ...(currentUserRole === 'ADMIN' ? [{ label: 'Audit Log', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static z-30 w-64 h-full min-h-screen bg-[#1a1d27] border-r border-gray-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-white">FlowDesk AI</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-3">Main</p>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === 'All Requests') setFilter('status', '');
                else if (item.label === 'High Priority') setFilter('priority', 'HIGH');
                else if (item.label === 'Failed') setFilter('status', 'FAILED');
                else if (item.label === 'Audit Log') navigate('/audit-log');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${item.active ? 'bg-violet-600/20 text-violet-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </div>
              {item.count !== undefined && (
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{item.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-[#1a1d27] border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-semibold">Dashboard</h1>
              <p className="text-gray-400 text-xs">Monitor and manage customer requests in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full border ${
              currentUserRole === 'ADMIN'
                ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {currentUserRole === 'ADMIN' ? 'Admin' : 'Agent'}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400 hidden sm:block">Live</span>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="bg-[#1a1d27] border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${colorMap[s.color].split(' ')[0]}`}>{s.value ?? '—'}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-4">
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'status', options: ['', 'NEW', 'QUEUED', 'PROCESSING', 'CLASSIFIED', 'RESOLVED', 'FAILED'], label: 'Status' },
                { key: 'priority', options: ['', 'LOW', 'MEDIUM', 'HIGH'], label: 'Priority' },
                { key: 'category', options: ['', 'support', 'sales', 'urgent', 'spam', 'other'], label: 'Category' },
              ].map((f) => (
                <select
                  key={f.key}
                  value={f.key === 'status' ? status : f.key === 'priority' ? priority : category}
                  onChange={(e) => setFilter(f.key, e.target.value)}
                  className="bg-[#0f1117] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                >
                  <option value="">All {f.label}</option>
                  {f.options.filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              <button
                onClick={() => setSearchParams({})}
                className="text-gray-400 hover:text-white text-sm px-3 py-2 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">{total} requests found</p>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No requests found</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/requests/${r.id}`)}
                  className="bg-[#1a1d27] border border-gray-800 hover:border-violet-500/40 rounded-xl p-5 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-gray-500 text-xs font-mono">{r.id.slice(-8)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor[r.prioritySnapshot] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {r.prioritySnapshot || 'Unclassified'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>
                          {r.status}
                        </span>
                        {r.categorySnapshot && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                            {r.categorySnapshot}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium truncate">{r.message}</p>
                      <p className="text-gray-400 text-xs mt-1">Customer: {r.customerName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-gray-500 text-xs">{timeAgo(r.createdAt)}</p>
                      {r.aiClassification?.confidence && (
                        <div className="mt-2">
                          <p className="text-gray-500 text-xs mb-1">{Math.round(r.aiClassification.confidence * 100)}% confidence</p>
                          <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-400 rounded-full"
                              style={{ width: `${r.aiClassification.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-600">{r.source}</span>
                    {r.customerEmail && <span className="text-xs text-gray-600">{r.customerEmail}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}