import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';

const CasePool: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await casesService.getCases({ status: 'POOL' });
      setCases(res.data ?? []);
    } catch {
      setError('Failed to load the pool. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePickup = async (id: string) => {
    setPickingId(id);
    try {
      await casesService.pickupCase(id);
      // Removed from the pool once picked up.
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Could not pick up this case (it may have been escalated or taken).');
    } finally {
      setPickingId(null);
    }
  };

  const dueLabel = (c: Case) => {
    const raw = (c as unknown as { pickupDueAt?: string }).pickupDueAt;
    if (!raw) return '—';
    const due = new Date(raw).getTime();
    const days = Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000));
    if (days < 0) return 'Overdue';
    return `${days} day${days === 1 ? '' : 's'} left`;
  };

  return (
    <DashboardLayout
      title="Case Pool"
      description="Safety / environment / other cases awaiting pickup in your province. Pick one up within 3 days or it escalates to the administrator."
      breadcrumbs={[
        { label: 'OHS Dashboard', path: '/ohs/dashboard' },
        { label: 'Case Pool' },
      ]}
    >
      {loading && (
        <div className="py-16 text-center text-sm text-gray-400">Loading pool…</div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-4">{error}</div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-400">The pool is empty — nothing waiting for pickup.</div>
      )}

      {!loading && cases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Case</th>
                <th className="text-left font-semibold px-5 py-3">Category</th>
                <th className="text-left font-semibold px-5 py-3">Severity</th>
                <th className="text-left font-semibold px-5 py-3">Province</th>
                <th className="text-left font-semibold px-5 py-3">Pickup SLA</th>
                <th className="text-right font-semibold px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-800">
                      {c.incidentNumber}
                    </span>
                    <div className="text-xs text-gray-400 truncate max-w-[280px]">{c.description}</div>
                  </td>
                  <td className="px-5 py-3 capitalize">{c.category}</td>
                  <td className="px-5 py-3 capitalize">{c.severity ?? c.severityLevel ?? '—'}</td>
                  <td className="px-5 py-3">{c.building?.province?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={dueLabel(c) === 'Overdue' ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      {dueLabel(c)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/ohs/cases/${c.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-light-gold text-brown text-xs font-bold rounded-lg hover:bg-gold/10 transition-colors active:scale-[0.98]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handlePickup(c.id)}
                        disabled={pickingId === c.id}
                        className="bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors active:scale-[0.98]"
                      >
                        {pickingId === c.id ? 'Picking up…' : 'Pick Up'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CasePool;
