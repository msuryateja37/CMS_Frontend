import React, { useState } from 'react';
import usePagination from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import IncidentStatusCard from '../../components/incident/IncidentStatusCard';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';
import { PROVINCES, STATUS_OPTIONS, SEVERITY_OPTIONS } from '../../data/constants';
import {
    Plus,
    Search,
    Package,
    CheckCircle2,
    FileText,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '../../hooks/useIncidents';
import { formatCategory } from '../../utils/formatters';


const IncidentManagement: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [provinceFilter, setProvinceFilter] = useState('');
    const {
        data: casesData,
        isLoading: loading,
    } = useIncidents({ take: 1000 });

    const cases = casesData?.data || [];

    // Calculate stats from real data
    const openCount = cases.filter(c => c.status === 'OPEN').length;
    const inProgressCount = cases.filter(c => c.status === 'IN_PROGRESS' || c.status === 'INVESTIGATING').length;
    const criticalCount = cases.filter(c => (c.severity || c.severityLevel)?.toLowerCase() === 'critical').length;
    const closedCount = cases.filter(c => c.status === 'CLOSED').length;

    const stats = [
        { label: 'Open', count: openCount, icon: Package, iconBg: 'bg-subtle-gold', iconColor: 'text-gold', percentage: '4.7%' },
        { label: 'In progress', count: inProgressCount, icon: CheckCircle2, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', showBottomBar: true, barColor: 'bg-blue-500' },
        { label: 'Critical', count: criticalCount, icon: FileText, iconBg: 'bg-subtle-red', iconColor: 'text-brand-red', showBottomBar: true, barColor: 'bg-brand-red' },
        { label: 'Closed (MTD)', count: closedCount, icon: AlertCircle, iconBg: 'bg-gold-50', iconColor: 'text-gold-500', showBottomBar: true, barColor: 'bg-gold-500' },
    ];

    // Map database status to component-expected values
    const mapStatus = (status: string): 'Open' | 'Investigating' | 'Resolved' | 'Closed' => {
        const statusMap: Record<string, 'Open' | 'Investigating' | 'Resolved' | 'Closed'> = {
            'OPEN': 'Open',
            'PENDING': 'Open',
            'RAISED': 'Open',
            'IN_PROGRESS': 'Investigating',
            'INVESTIGATING': 'Investigating',
            'RESOLVED': 'Resolved',
            'CLOSED': 'Closed'
        };
        return statusMap[status] || 'Open';
    };

    // Capitalize severity properly
    const capitalizeSeverity = (severity: string | undefined): 'Critical' | 'High' | 'Medium' | 'Low' => {
        const sev = severity ? severity.toLowerCase() : 'medium';
        if (sev === 'critical') return 'Critical';
        if (sev === 'high') return 'High';
        if (sev === 'low') return 'Low';
        return 'Medium';
    };

    // Transform Case to incident row format
    const transformedIncidents = cases.map(incident => ({
        id: incident.id,
        refId: incident.incidentNumber,
        description: incident.description,
        type: incident.category || incident.type,
        severity: capitalizeSeverity(incident.severity || incident.severityLevel),
        status: mapStatus(incident.status),
        date: new Date(incident.createdAt).toLocaleDateString(),
        rawDate: incident.createdAt,
        assigned: incident.assignedTo?.name || '-',
        loc: incident.building?.name || incident.building?.province?.name || 'N/A',
        provinceName: incident.building?.province?.name || 'N/A'
    }));

    // Filter incidents based on search
    // Filter incidents based on search and filters
    const filteredIncidents = transformedIncidents.filter(incident => {
        const matchesSearch = !searchQuery || (
            incident.refId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesStatus = !statusFilter || incident.status === statusFilter;
        const matchesSeverity = !severityFilter || incident.severity === severityFilter;
        const matchesProvince = !provinceFilter || incident.provinceName === provinceFilter;

        return matchesSearch && matchesStatus && matchesSeverity && matchesProvince;
    });



    // Pagination — handled by usePagination below

    const {
        paginatedData: paginatedIncidents,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        setItemsPerPage,
    } = usePagination({
        data: filteredIncidents,
        defaultItemsPerPage: 10,
        resetOnChange: [searchQuery, statusFilter, severityFilter, provinceFilter],
    });

    const columns: Column<typeof transformedIncidents[0]>[] = [
        {
            header: 'Reference',
            accessorKey: 'refId',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3 w-48">
                    {/* <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-gold"></div>
                    </div> */}
                    <div className="w-8 h-8 rounded-full bg-[#BB8F53]"></div>
                    <span className="font-bold text-brown text-sm">{item.refId}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessorKey: 'type',
            sortable: true,
            cell: (item) => <span className="text-sm text-dark-grey font-medium">{formatCategory(item.type)}</span>
        },
        {
            header: 'Severity',
            accessorKey: 'severity',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.severity}
                    variant={item.severity.toLowerCase()}
                />
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.status}
                    variant={item.status.toLowerCase()}
                    className="rounded-lg"
                />
            )
        },
        {
            header: 'Reported',
            accessorKey: 'rawDate',
            sortable: true,
            cell: (item) => <span className="text-sm text-dark-grey font-medium">{item.date}</span>
        },
        {
            header: 'Assigned to',
            accessorKey: 'assigned',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className=" p-2 rounded w-32 bg-semi-subtle-grey flex items-center justify-center text-xs font-bold text-brown shadow-sm">
                        {item.assigned}
                    </div>

                </div>
            )
        },
        {
            header: 'Location',
            accessorKey: 'loc',
            sortable: true,
            cell: (item) => <span className="text-sm text-light-grey font-medium">{item.loc}</span>
        }
    ];

    return (
        <DashboardLayout
            title="Incident Management"
            description="Incident Management"
            breadcrumbs={[{ label: "Dashboard", path: "/admin/dashboard" }, { label: "Incident Management" }]}
        >
            <div className="flex flex-col gap-8">
                {/* Header Action */}
                <div className="flex justify-end -mt-20">
                    <button
                        onClick={() => navigate('/ohs/report-incident')}
                        className="flex items-center gap-2 px-6 mt-14 py-3 bg-gold text-white rounded-xl font-bold shadow-lg shadow-gold/20 hover:bg-[#2aa88d] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus size={20} />
                        Report Incident
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <IncidentStatusCard key={index} {...stat} />
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mt-4">
                    <div className="relative w-full xl:max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-light-grey" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Reference ID ...."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-semi-subtle-grey rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="w-[160px]">
                            <Select
                                value={provinceFilter}
                                onChange={(val) => {
                                    setProvinceFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: '', label: 'All provinces' },
                                    ...PROVINCES.map(p => ({ value: p, label: p }))
                                ]}
                                placeholder="All provinces"
                                bgColor="bg-light-gold"
                            />
                        </div>
                        <div className="w-[160px]">
                            <Select
                                value={statusFilter}
                                onChange={(val) => {
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: '', label: 'All statuses' },
                                    ...STATUS_OPTIONS
                                ]}
                                placeholder="All statuses"
                                bgColor="bg-light-gold"
                            />
                        </div>
                        <div className="w-[160px]">
                            <Select
                                value={severityFilter}
                                onChange={(val) => {
                                    setSeverityFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: '', label: 'All severities' },
                                    ...SEVERITY_OPTIONS
                                ]}
                                placeholder="All severities"
                                bgColor="bg-light-gold"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Component */}
                <DataTable
                    title="Recent Incidents"
                    data={paginatedIncidents}
                    columns={columns}
                    keyField="refId"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    loading={loading}
                    paginatable={true}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredIncidents.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(size) => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                    }}
                    onRowClick={(item) => navigate(`/admin/incidents/${item.id}`)}
                    defaultSortBy="rawDate"
                    defaultSortOrder="desc"
                />
            </div>
        </DashboardLayout>
    );
};

export default IncidentManagement;
