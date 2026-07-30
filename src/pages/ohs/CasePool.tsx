import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import { useAuthStore } from '../../store/auth.store';
import { getRoleBasePath } from '../../utils/rolePaths';
import { formatIncidentCategory } from '../../utils/formatters';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';

const hrStatusLabel: Record<string, string> = {
  HR_UNASSIGNED: 'WCL Processing',
  HR_ASSIGNED: 'WCL Processing',
  HR_UNDER_REVIEW: 'WCL Sent',
  HR_APPROVED: 'WCL Processed',
  WCL_ISSUED: 'WCL Sent',
  WCL_PROCESSED: 'WCL Processed',
  CLOSED: 'Completed',
};

interface PoolCase extends Case {
  hrStatus?: string;
  hrAssignedTo?: { name: string };
}

const CasePool: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const base = getRoleBasePath(user?.role?.name);
  const [cases, setCases] = useState<PoolCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isNational = user?.role?.name?.toUpperCase()?.replace(/_/g, ' ') === 'OHS NATIONAL OFFICE';
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
        return c.status === 'NEW' || c.status === 'UNASSIGNED' || c.status === 'REFERRED_TO_OHS_AND_HR' || c.status === 'POOL';
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

  const isForwardedCase = (c: PoolCase) => c.status === 'REFERRED_TO_OHS_AND_HR';

  return (
    <DashboardLayout
      title="Unassigned Incidents"
      description="Incidents awaiting pickup in your province. Forwarded health cases (hospitalization) appear here — click View to self assign and begin the investigation track."
      breadcrumbs={[
        { label: 'OHS Dashboard', path: `${base}/dashboard` },
        { label: 'Unassigned Incidents' },
      ]}
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`${base}/dashboard`)}
          className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-lg text-gray-600 font-medium text-xs transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {loading && (
        <div className="py-16 text-center text-sm text-gray-400">Loading unassigned incidents…</div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-4">{error}</div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-400 font-semibold">No unassigned incidents waiting for pickup.</div>
      )}

      {!loading && cases.length > 0 && (
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
                <th className="text-right font-semibold px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const forwarded = isForwardedCase(c);
                const hrStatus = c.hrStatus;
                return (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-800 font-mono text-xs">
                      {c.incidentNumber}
                    </td>
                    <td className="px-5 py-3 capitalize">{formatIncidentCategory(c.category, c.description)}</td>
                    <td className="px-5 py-3 capitalize">{c.severity ?? c.severityLevel ?? '—'}</td>
                    <td className="px-5 py-3">{c.building?.province?.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <Pill
                        label={getStatusLabel(c.status)}
                        variant={c.status.toLowerCase().replace(/_/g, ' ')}
                      />
                    </td>
                    <td className="px-5 py-3">
                      {hrStatus ? (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          hrStatus === 'WCL_PROCESSED' || hrStatus === 'HR_APPROVED' ? 'bg-emerald-100 text-emerald-800'
                            : hrStatus === 'HR_UNDER_REVIEW' || hrStatus === 'WCL_ISSUED' ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {hrStatusLabel[hrStatus] ?? hrStatus}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => navigate(`${base}/cases/${c.id}`, { state: { from: 'pool' } })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#884616] hover:bg-[#723b12] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
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

export default CasePool;
