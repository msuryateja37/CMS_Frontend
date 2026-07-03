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
  const [closingId, setClosingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await casesService.getCases({ take: 200, provinceId: user.province?.id });
      setCases(res.data ?? []);
    } catch {
      setError('Failed to load cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const handleClose = async (id: string) => {
    setClosingId(id);
    try {
      await casesService.closeCase(id);
      setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'CLOSED' } : c)));
    } catch {
      setError('Could not close this case.');
    } finally {
      setClosingId(null);
    }
  };

  const statusPill = (status: string) => {
    const s = status.toUpperCase();
    const cls =
      s === 'CLOSED' || s === 'COMPLETED'
        ? 'bg-green-50 text-green-700'
        : s === 'ESCALATED_TO_ADMIN'
        ? 'bg-red-50 text-red-700'
        : s === 'POOL'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-amber-50 text-amber-700';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
        {s.replace(/_/g, ' ').toLowerCase()}
      </span>
    );
  };

  return (
    <DashboardLayout
      title="HR – Cases for Review"
      description="Review the reported cases and close them when resolved."
      breadcrumbs={[{ label: 'HR' }, { label: 'Cases for Review' }]}
    >
      {loading && <div className="py-16 text-center text-sm text-gray-400">Loading cases…</div>}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-4">{error}</div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-400">No cases to review.</div>
      )}

      {!loading && cases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Case</th>
                <th className="text-left font-semibold px-5 py-3">Category</th>
                <th className="text-left font-semibold px-5 py-3">Province</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
                <th className="text-right font-semibold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const isClosed = ['CLOSED', 'COMPLETED'].includes(c.status?.toUpperCase());
                return (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-800">{c.incidentNumber}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[280px]">{c.description}</div>
                    </td>
                    <td className="px-5 py-3 capitalize">{c.category}</td>
                    <td className="px-5 py-3">{c.building?.province?.name ?? '—'}</td>
                    <td className="px-5 py-3">{statusPill(c.status)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/incidents/${c.id}`)}
                          className="px-4 py-1.5 rounded-lg font-semibold text-xs border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleClose(c.id)}
                          disabled={isClosed || closingId === c.id}
                          className="bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                        >
                          {isClosed ? 'Closed' : closingId === c.id ? 'Closing…' : 'Close'}
                        </button>
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
