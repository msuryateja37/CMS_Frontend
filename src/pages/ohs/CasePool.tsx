import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import { useAuthStore } from '../../store/auth.store';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';

const hrStatusLabel: Record<string, string> = {
  HR_UNASSIGNED: 'Unassigned',
  HR_ASSIGNED: 'Assigned',
  HR_UNDER_REVIEW: 'Under Review',
  HR_APPROVED: 'Approved',
};

interface PoolCase extends Case {
  hrStatus?: string;
  hrAssignedTo?: { name: string };
}

const CasePool: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [cases, setCases] = useState<PoolCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isNational = user?.role?.name?.toUpperCase()?.replace(/_/g, ' ') === 'OHS NATIONAL OFFICE';
      // Include both NEW, UNASSIGNED and REFERRED_TO_OHS_AND_HR (health parallel flow) unassigned cases
      const filters: Record<string, string> = {
        status: 'NEW,UNASSIGNED,REFERRED_TO_OHS_AND_HR',
        unassignedOnly: 'true',
      };
      if (!isNational && user?.province?.id) {
        filters.provinceId = user.province.id;
      }
      const res = await casesService.getCases(filters);
      const rawCases = (res.data ?? []) as PoolCase[];
      
      const filtered = rawCases.filter(c => {
        const cat = c.category?.toLowerCase();
        if (cat === 'health') {
          return c.status === 'REFERRED_TO_OHS_AND_HR';
        }
        // Safety, environmental, equipment, security, others go directly to OHS Pool on creation
        return c.status === 'NEW' || c.status === 'UNASSIGNED' || c.status === 'POOL';
      });
      setCases(filtered);
    } catch {
      setError('Failed to load unassigned incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user, load]);

  const handlePickup = async (id: string) => {
    setPickingId(id);
    try {
      await casesService.pickupCase(id);
      // Removed from the pool once picked up.
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Could not pick up this incident (it may have been escalated or taken).');
    } finally {
      setPickingId(null);
    }
  };

  const dueLabel = (c: PoolCase) => {
    const raw = (c as unknown as { pickupDueAt?: string }).pickupDueAt;
    if (!raw) return '—';
    const due = new Date(raw).getTime();
    const days = Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000));
    if (days < 0) return 'Overdue';
    return `${days} day${days === 1 ? '' : 's'} left`;
  };

  const isForwardedCase = (c: PoolCase) => c.status === 'REFERRED_TO_OHS_AND_HR';

  return (
    <DashboardLayout
      title="Unassigned Incidents"
      description="Incidents awaiting pickup in your province. Forwarded health cases (hospitalization) appear here too — pick one up to begin the OHS investigation track."
      breadcrumbs={[
        { label: 'OHS Dashboard', path: '/ohs/dashboard' },
        { label: 'Unassigned Incidents' },
      ]}
    >
      <div className="mb-6">
        <button
          onClick={() => navigate('/ohs/dashboard')}
          className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-colors shrink-0"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {
        loading && (
          <div className="py-16 text-center text-sm text-gray-400">Loading unassigned incidents…</div>
        )
      }

      {
        !loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-4">{error}</div>
        )
      }

      {
        !loading && !error && cases.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">No unassigned incidents waiting for pickup.</div>
        )
      }

      {
        !loading && cases.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Incident ID</th>
                  <th className="text-left font-semibold px-5 py-3">Category</th>
                  <th className="text-left font-semibold px-5 py-3">Severity</th>
                  <th className="text-left font-semibold px-5 py-3">Province</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                  <th className="text-left font-semibold px-5 py-3">HR Status</th>
                  <th className="text-left font-semibold px-5 py-3">HR Assignee</th>
                  <th className="text-left font-semibold px-5 py-3">Pickup SLA</th>
                  <th className="text-right font-semibold px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => {
                  const forwarded = isForwardedCase(c);
                  const hrStatus = c.hrStatus;
                  const hrAssignedTo = c.hrAssignedTo;
                  return (
                    <tr key={c.id} className={`border-t border-gray-100 hover:bg-gray-50 ${forwarded ? 'bg-purple-50/30' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{c.incidentNumber}</span>
                          {forwarded && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Health</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-[240px]">{c.description}</div>
                      </td>
                      <td className="px-5 py-3 capitalize">{c.category}</td>
                      <td className="px-5 py-3 capitalize">{c.severity ?? c.severityLevel ?? '—'}</td>
                      <td className="px-5 py-3">{c.building?.province?.name ?? '—'}</td>
                      <td className="px-5 py-3">
                        <Pill
                          label={getStatusLabel(c.status)}
                          variant={c.status.toLowerCase().replace(/_/g, ' ')}
                        />
                      </td>
                      <td className="px-5 py-3">
                        {forwarded && hrStatus ? (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hrStatus === 'HR_APPROVED' ? 'bg-green-100 text-green-700'
                            : hrStatus === 'HR_ASSIGNED' ? 'bg-blue-100 text-blue-700'
                              : hrStatus === 'HR_UNDER_REVIEW' ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                            {hrStatusLabel[hrStatus] ?? hrStatus}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {hrAssignedTo ? (
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <Users size={12} /> {hrAssignedTo.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {!forwarded ? (
                          <span className={dueLabel(c) === 'Overdue' ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                            {dueLabel(c)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/ohs/cases/${c.id}`, { state: { from: 'pool' } })}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </DashboardLayout >
  );
};

export default CasePool;
