import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import { DataTable, type Column } from '../../components/common/DataTable';
import { type Case } from '../../services/cases.service';
import { useIncidents } from '../../hooks/useIncidents';
import { useAuthStore } from '../../store/auth.store';
import { Loader2, Folder, Eye, ArrowLeft } from 'lucide-react';
import { formatCategory } from '../../utils/formatters';

const LoggedIncidents: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const provinceId = user?.province?.id || user?.department?.building?.province?.id;
    const provinceName = user?.province?.name || user?.department?.building?.province?.name || 'your Province';

    const { data: result, isLoading: loading, error: queryError } = useIncidents({
        provinceId,
        take: 200
    });

    const cases = result?.data || [];
    const error = queryError ? 'Failed to load logged incidents.' : null;

    const columns: Column<Case>[] = [
        {
            header: 'Incident ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => (
                <span className="font-mono text-sm font-medium text-gray-600">{item.incidentNumber}</span>
            )
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-gray-700 font-medium">{formatCategory(item.category || item.type || 'N/A')}</span>
        },
        {
            header: 'Severity',
            accessorKey: 'severity',
            sortable: true,
            cell: (item) => {
                const sev = item.severity || 'medium';
                return <Pill label={sev.charAt(0).toUpperCase() + sev.slice(1)} variant={sev.toLowerCase()} />;
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => {
                const statusLabel = getStatusLabel(item.status);
                return <Pill label={statusLabel.toUpperCase()} variant={item.status.toLowerCase().replace(/_/g, ' ')} />;
            }
        },
        {
            header: 'Assigned To',
            cell: (item) => (
                <span className="text-gray-500 text-sm">
                    {item.assignedTo?.name || <span className="text-gray-400 italic">Unassigned</span>}
                </span>
            )
        },
        {
            header: 'Date',
            accessorKey: 'createdAt',
            sortable: true,
            cell: (item) => (
                <span className="text-gray-500 text-sm">
                    {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
            )
        },
        {
            header: '',
            cell: (item) => (
                <button
                    onClick={() => navigate(`/supervisor/cases/${item.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-light-gold text-brown text-xs font-bold rounded-lg hover:bg-gold/10 transition-colors"
                >
                    <Eye size={14} />
                    View
                </button>
            )
        }
    ];

    return (
        <DashboardLayout
            title="Logged Incidents"
            description="Overview of province incidents"
            breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "Logged Incidents" }]}
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => navigate('/supervisor/dashboard')}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-colors shrink-0"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Province Logged Incidents</h3>
                        <p className="text-xs text-gray-400">Viewing incidents raised in {provinceName}</p>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                        <span className="ml-3 text-gray-600">Loading incidents...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
                )}

                {!loading && !error && cases.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <Folder className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-gray-400 font-medium">No incidents found for this province.</p>
                    </div>
                )}

                {!loading && !error && cases.length > 0 && (
                    <DataTable
                        data={cases}
                        columns={columns}
                        keyField="id"
                        selectable={false}
                        selectedIds={[]}
                        onSelectionChange={() => { }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default LoggedIncidents;
