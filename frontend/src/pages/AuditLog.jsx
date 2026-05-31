import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const formatEventLabel = (eventType) => eventType.replace(/_/g, ' ');

export default function AuditLog() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/events', { params: { limit: 100 } });
      setEvents(res.data.events);
    } catch (err) {
      console.error('Audit log fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <main className="flex-1 overflow-auto">
        <header className="bg-[#1a1d27] border-b border-gray-800 px-6 py-4 sticky top-0 z-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-white font-semibold text-2xl">Audit Log</h1>
              <p className="text-gray-400 text-sm">Timeline of request events and system actions.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center rounded-lg border border-gray-700 bg-[#11141d] px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Recent events</h2>
                <p className="text-gray-500 text-sm">{events.length} events loaded</p>
              </div>
              <button
                onClick={fetchEvents}
                className="text-sm text-violet-400 hover:text-white transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#15181f] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="py-20 text-center text-gray-500">No audit events found.</div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-[#0f1117] border border-gray-800 rounded-2xl p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-white font-medium">{formatEventLabel(event.eventType)}</p>
                        <p className="text-gray-400 text-sm mt-1">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right text-gray-400 text-sm">
                        <p>Request {event.requestId.slice(-8)}</p>
                        {event.actor?.name && <p>By {event.actor.name}</p>}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {event.oldValue && (
                        <div className="bg-[#12151a] rounded-xl p-3">
                          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Old Value</p>
                          <p className="text-white text-sm mt-2 truncate">{event.oldValue}</p>
                        </div>
                      )}
                      {event.newValue && (
                        <div className="bg-[#12151a] rounded-xl p-3">
                          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">New Value</p>
                          <p className="text-white text-sm mt-2 truncate">{event.newValue}</p>
                        </div>
                      )}
                      {event.metadata && (
                        <div className="bg-[#12151a] rounded-xl p-3 sm:col-span-2">
                          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Metadata</p>
                          <p className="text-white text-sm mt-2 break-words">{event.metadata}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}