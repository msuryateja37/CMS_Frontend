import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/auth.store';
import { useIncidents } from '../../hooks/useIncidents';
import { Download, Eye } from 'lucide-react';
import { Pill } from '../../components/common/Pill';
import { getRoleBasePath } from '../../utils/rolePaths';

interface ReportData {
    id: string;
    firstCaseId?: string;
    reportId: string;
    title: string;
    province: string;
    category: string;
    date: string;
    incidents: number;
    status: 'Final' | 'Draft';
}

const getProvinceSlug = (name: string): string => {
    switch (name) {
        case 'Eastern Cape': return 'EC';
        case 'Free State': return 'FS';
        case 'Gauteng': return 'GP';
        case 'KwaZulu-Natal': return 'KZN';
        case 'Limpopo': return 'LMP';
        case 'Mpumalanga': return 'MP';
        case 'Northern Cape': return 'NC';
        case 'North West': return 'NW';
        case 'Western Cape': return 'WC';
        case 'National Office': return 'National';
        default: return 'All';
    }
};



const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { data: casesData, isLoading } = useIncidents({ take: 1000 });
    const cases = casesData?.data || [];

    const userProvince = user?.province?.name || '';
    const isNationalOffice = userProvince === 'National Office';
    const userSlug = getProvinceSlug(userProvince);

    // Filter reports based on user's province (generates dynamically if cases exist, otherwise returns empty)
    const filteredReports = React.useMemo<ReportData[]>(() => {
        if (cases.length === 0) return [];

        const list: ReportData[] = [];
        const groups: Record<string, any[]> = {};

        cases.forEach(c => {
            const pSlug = getProvinceSlug(c.building?.province?.name || '');
            const cat = c.category || 'Safety';
            const dateObj = new Date(c.occurredAt || c.createdAt);
            const month = dateObj.toLocaleString('default', { month: 'long' });
            const year = dateObj.getFullYear();
            const key = `${pSlug}-${cat}-${month}-${year}`;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(c);
        });

        Object.entries(groups).forEach(([key, groupCases], idx) => {
            const [pSlug, cat, month] = key.split('-');
            const firstCase = groupCases[0];
            const dateStr = new Date(firstCase.occurredAt || firstCase.createdAt).toISOString().split('T')[0];
            const allClosed = groupCases.every(c => c.status === 'CLOSED');

            // Enforce province filter
            if (!isNationalOffice && pSlug !== userSlug) {
                return;
            }

            list.push({
                id: key,
                firstCaseId: firstCase.id,
                reportId: `RPT-2026-${String(idx + 1).padStart(3, '0')}`,
                title: `${month} ${cat} Incidents Report`,
                province: pSlug,
                category: cat,
                date: dateStr,
                incidents: groupCases.length,
                status: allClosed ? 'Final' : 'Draft'
            });
        });

        return list;
    }, [cases, userSlug, isNationalOffice]);

    return (
        <DashboardLayout
            title="Reports"
            description="Manage and download incident report summaries"
            breadcrumbs={[{ label: 'Reports', path: '/reports' }, { label: 'Overview' }]}
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-55 border-b border-gray-150">
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Report ID</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Province</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Incidents</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 text-center uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400 font-semibold text-sm">
                                        No reports found
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-xs font-mono font-bold text-gray-500">
                                            {report.reportId}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">
                                            {report.title}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs">
                                            <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px]">
                                                {report.province}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-650">
                                            {report.category}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500">
                                            {report.date}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-gray-800">
                                            {report.incidents}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Pill
                                                label={report.status}
                                                variant={report.status === 'Final' ? 'closed' : 'raised'}
                                            />
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => navigate(`${getRoleBasePath(user?.role?.name)}/cases/${report.firstCaseId}`)}
                                                    className="flex items-center gap-1 text-xs text-gold hover:text-gold-700 font-bold transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const csvContent = `Report ID,Title,Province,Category,Date,Incidents Count,Status\n"${report.reportId}","${report.title}","${report.province}","${report.category}","${report.date}",${report.incidents},"${report.status}"`;
                                                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                                        const url = URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.setAttribute('href', url);
                                                        link.setAttribute('download', `${report.reportId}_Export.csv`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }}
                                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-brown font-bold transition"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Export
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Reports;
