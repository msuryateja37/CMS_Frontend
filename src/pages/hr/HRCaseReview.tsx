import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import { useAuthStore } from '../../store/auth.store';

const HRCaseReview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await casesService.getCases({ 
        take: 200, 
        provinceId: user.province?.id,
        hrFlow: 'true'
      });
      setCases(res.data ?? []);
    } catch {
      setError('Failed to load incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const handleHrPickup = async (id: string) => {
    setActioningId(id);
    setError(null);
    try {
      const updated = await casesService.hrPickupCase(id);
      setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch (err) {
      setError('Failed to pick up incident.');
    } finally {
      setActioningId(null);
    }
  };

  const handleHrUpdateStatus = async (id: string, hrStatus: string) => {
    setActioningId(id);
    setError(null);
    try {
      const updated = await casesService.hrUpdateStatus(id, hrStatus);
      setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch (err) {
      setError('Failed to update HR status.');
    } finally {
      setActioningId(null);
    }
  };

  const handleClose = async (id: string) => {
    setClosingId(id);
    try {
      await casesService.closeCase(id);
      setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'CLOSED' } : c)));
    } catch {
      setError('Could not close this incident.');
    } finally {
      setClosingId(null);
    }
  };

  const statusPill = (status: string) => {
    const s = status.toUpperCase();
    const cls =
      s === 'CLOSED' || s === 'COMPLETED'
        ? 'bg-green-50 text-green-700 border border-green-200'
        : s === 'ESCALATED_TO_ADMIN'
        ? 'bg-red-50 text-red-700 border border-red-200'
        : s === 'POOL'
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'bg-amber-50 text-amber-700 border border-amber-200';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
        {s.replace(/_/g, ' ').toLowerCase()}
      </span>
    );
  };

  const hrStatusPill = (status: string | undefined) => {
    const s = (status || 'HR_UNASSIGNED').toUpperCase();
    const cls =
      s === 'HR_APPROVED'
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : s === 'HR_UNDER_REVIEW'
        ? 'bg-amber-50 text-amber-700 border border-amber-200'
        : s === 'HR_ASSIGNED'
        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
        : 'bg-gray-100 text-gray-500 border border-gray-200';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
        {s.replace(/_/g, ' ').toLowerCase()}
      </span>
    );
  };

  return (
    <DashboardLayout
      title="HR – Incidents for Review"
      description="Review the reported health incidents and process documentation and insurance."
      breadcrumbs={[{ label: 'HR' }, { label: 'Incidents for Review' }]}
    >
      {loading && <div className="py-16 text-center text-sm text-gray-400">Loading incidents…</div>}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-4">{error}</div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-400">No incidents to review.</div>
      )}

      {!loading && cases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Incident</th>
                <th className="text-left font-semibold px-5 py-3">Category</th>
                <th className="text-left font-semibold px-5 py-3">Province</th>
                <th className="text-left font-semibold px-5 py-3">OHS Status</th>
                <th className="text-left font-semibold px-5 py-3">HR Status</th>
                <th className="text-right font-semibold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const isClosed = ['CLOSED', 'COMPLETED'].includes(c.status?.toUpperCase());
                const hrStatus = c.hrStatus || 'HR_UNASSIGNED';
                const isHrAssignedToMe = c.hrAssignedTo?.id === user?.id;

                return (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-800">{c.incidentNumber}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[280px]">{c.description}</div>
                    </td>
                    <td className="px-5 py-3 capitalize">{c.category}</td>
                    <td className="px-5 py-3">{c.building?.province?.name ?? '—'}</td>
                    <td className="px-5 py-3">{statusPill(c.status)}</td>
                    <td className="px-5 py-3">{hrStatusPill(c.hrStatus)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/incidents/${c.id}`)}
                          className="px-4 py-1.5 rounded-lg font-semibold text-xs border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          View Details
                        </button>
                        
                        {hrStatus === 'HR_UNASSIGNED' && (
                          <button
                            onClick={() => handleHrPickup(c.id)}
                            disabled={actioningId === c.id}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                          >
                            {actioningId === c.id ? 'Assigning...' : 'Self-Assign'}
                          </button>
                        )}

                        {hrStatus === 'HR_ASSIGNED' && isHrAssignedToMe && (
                          <button
                            onClick={() => handleHrUpdateStatus(c.id, 'HR_UNDER_REVIEW')}
                            disabled={actioningId === c.id}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                          >
                            {actioningId === c.id ? 'Updating...' : 'Start Review'}
                          </button>
                        )}

                        {hrStatus === 'HR_UNDER_REVIEW' && isHrAssignedToMe && (
                          <button
                            onClick={() => handleHrUpdateStatus(c.id, 'HR_APPROVED')}
                            disabled={actioningId === c.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                          >
                            {actioningId === c.id ? 'Approving...' : 'Approve Document'}
                          </button>
                        )}

                        {hrStatus === 'HR_APPROVED' && (
                          <button
                            onClick={() => handleClose(c.id)}
                            disabled={isClosed || closingId === c.id}
                            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                          >
                            {isClosed ? 'Closed' : closingId === c.id ? 'Closing…' : 'Close Incident'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HRCaseReview;
