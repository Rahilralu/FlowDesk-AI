import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { currentUserId } from '../api/axios';

const statusColor = {
  NEW: 'bg-gray-500/10 text-gray-400',
  QUEUED: 'bg-blue-500/10 text-blue-400',
  PROCESSING: 'bg-yellow-500/10 text-yellow-400',
  CLASSIFIED: 'bg-violet-500/10 text-violet-400',
  RESOLVED: 'bg-green-500/10 text-green-400',
  FAILED: 'bg-red-500/10 text-red-400',
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await api.get(`/requests/${id}`);
        setRequest(res.data.request);
        setNewStatus(res.data.request.status);
      } catch { navigate('/'); }
      finally { setLoading(false); }
    };
    fetchRequest();
  }, [id]);

  const updateStatus = async () => {
    setSaving(true);
    try {
      await api.patch(`/requests/${id}/status`, { status: newStatus });
      setRequest((r) => ({ ...r, status: newStatus }));
      showToast('Status updated');
    } catch { showToast('Failed to update status', 'error'); }
    finally { setSaving(false); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/requests/${id}/notes`, { body: note });
      setRequest((r) => ({
        ...r,
        internalNotes: [...(r.internalNotes || []), res.data.note],
      }));
      setNote('');
      showToast('Note added');
    } catch { showToast('Failed to add note', 'error'); }
    finally { setSaving(false); }
  };

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/requests/${id}/notes/${noteId}`);
      setRequest((r) => ({
        ...r,
        internalNotes: r.internalNotes.filter((n) => n.id !== noteId),
      }));
      showToast('Note deleted');
    } catch { showToast('Failed to delete note', 'error'); }
  };

  const deleteRequest = async () => {
    if (!confirm('Delete this request permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/requests/${id}`);
      navigate('/');
    } catch { showToast('Failed to delete request', 'error'); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const ai = request?.aiClassification;

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm shadow-lg text-white ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-violet-600'
        }`}>
          {toast.msg}
        </div>
      )}

      <header className="bg-[#1a1d27] border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-white font-semibold">Request Detail</h1>
            <p className="text-gray-500 text-xs font-mono">{request?.id}</p>
          </div>
        </div>
        <button
          onClick={deleteRequest}
          disabled={deleting}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Message */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[request?.status]}`}>{request?.status}</span>
              {request?.prioritySnapshot && (
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  request.prioritySnapshot === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  request.prioritySnapshot === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-green-500/10 text-green-400 border-green-500/20'
                }`}>{request.prioritySnapshot} Priority</span>
              )}
              {request?.categorySnapshot && (
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400">{request.categorySnapshot}</span>
              )}
            </div>
            <span className="text-gray-500 text-xs shrink-0">{timeAgo(request?.createdAt)}</span>
          </div>
          <p className="text-white text-base leading-relaxed">{request?.message}</p>
        </div>

        {/* Customer Info */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Info
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500 text-xs mb-1">Name</p><p className="text-white">{request?.customerName}</p></div>
            <div><p className="text-gray-500 text-xs mb-1">Source</p><p className="text-white">{request?.source}</p></div>
            {request?.customerEmail && <div><p className="text-gray-500 text-xs mb-1">Email</p><p className="text-white">{request.customerEmail}</p></div>}
            {request?.customerPhone && <div><p className="text-gray-500 text-xs mb-1">Phone</p><p className="text-white">{request.customerPhone}</p></div>}
          </div>
        </div>

        {/* AI Classification */}
        {ai && (
          <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-6">
            <h2 className="text-violet-400 font-medium mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Classification
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div><p className="text-gray-500 text-xs mb-1">Category</p><p className="text-white font-medium">{ai.category}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Priority</p><p className="text-white font-medium">{ai.priority}</p></div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Confidence</p>
                <p className="text-white font-medium mb-1">{Math.round(ai.confidence * 100)}%</p>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${ai.confidence * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="border-t border-violet-500/20 pt-4 space-y-3">
              <div>
                <p className="text-gray-500 text-xs mb-1">Summary</p>
                <p className="text-gray-200 text-sm leading-relaxed">{ai.summary}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Reason</p>
                <p className="text-gray-300 text-sm leading-relaxed">{ai.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Update Status */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Update Status</h2>
          <div className="flex gap-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 bg-[#0f1117] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
            >
              {['NEW', 'QUEUED', 'PROCESSING', 'CLASSIFIED', 'RESOLVED', 'FAILED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={updateStatus}
              disabled={saving || newStatus === request?.status}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Event Timeline */}
        {request?.requestEvents?.length > 0 && (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-medium mb-4">Event Timeline</h2>
            <div className="space-y-3">
              {request.requestEvents.map((e, i) => (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-violet-500 rounded-full mt-1.5 shrink-0" />
                    {i < request.requestEvents.length - 1 && <div className="w-px flex-1 bg-gray-700 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-white text-sm font-medium">{e.eventType.replace(/_/g, ' ')}</p>
                    {(e.oldValue || e.newValue) && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        {e.oldValue && `${e.oldValue} → `}{e.newValue}
                      </p>
                    )}
                    <p className="text-gray-600 text-xs mt-0.5">{timeAgo(e.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internal Notes */}
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4 flex items-center justify-between">
            Internal Notes
            <span className="text-gray-500 text-xs font-normal">{request?.internalNotes?.length || 0} notes</span>
          </h2>

          {request?.internalNotes?.length === 0 && (
            <p className="text-gray-500 text-sm mb-4">No notes yet.</p>
          )}

          <div className="space-y-3 mb-4">
            {request?.internalNotes?.map((n) => (
              <div key={n.id} className="bg-[#0f1117] rounded-lg p-4 border border-gray-800 group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(n.author?.name)}
                  </div>
                  <span className="text-gray-300 text-xs font-medium">{n.author?.name || 'Unknown'}</span>
                  <span className="text-gray-600 text-xs">{n.author?.email}</span>
                  <span className="text-gray-600 text-xs ml-auto">{timeAgo(n.createdAt)}</span>
                  {n.author?.id === currentUserId && (
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all ml-1"
                      title="Delete note"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{n.body}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note..."
              rows={3}
              className="flex-1 bg-[#0f1117] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 resize-none placeholder-gray-600"
            />
            <button
              onClick={addNote}
              disabled={saving || !note.trim()}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-end"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}