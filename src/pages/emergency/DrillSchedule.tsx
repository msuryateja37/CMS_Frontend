import React, { useState, useMemo } from 'react';
import usePagination from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Plus,
    Search,
    Calendar,
    Users,
    CheckCircle2 as CheckCircle,
    Info,
    MapPin,
    Activity
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';
import { useDrills } from '../../hooks/useEmergency';

// --- MOCK DATA ---
const DRILLS = [
    {
        id: 'DRL-2024-015',
        name: 'Fire Evacuation',
        type: 'Fire',
        location: 'Civic Centre - All Floors',
        dateRange: '2024-02-15 to 2024-02-15',
        status: 'Scheduled',
        participants: '450 Participants',
        organizer: 'David Botha'
    },
    {
        id: 'DRL-2024-016',
        name: 'First Aid Response',
        type: 'Medical',
        location: 'North Depot - Training Room',
        dateRange: '2024-02-17 to 2024-02-17',
        status: 'Scheduled',
        participants: '30 Participants',
        organizer: 'Sarah Jenkins'
    },
    {
        id: 'DRL-2024-017',
        name: 'Chemical Spill',
        type: 'HazMat',
        location: 'Wastewater Plant - Site B',
        dateRange: '2024-02-20 to 2024-02-20',
        status: 'Scheduled',
        participants: '15 Participants',
        organizer: 'David Botha'
    },
    {
        id: 'DRL-2024-018',
        name: 'Lockdown Procedure',
        type: 'Security',
        location: 'Public Library - Central',
        dateRange: '2024-02-25 to 2024-02-25',
        status: 'Planning',
        participants: '80 Participants',
        organizer: 'Chief M. Ndlovu'
    },
    {
        id: 'DRL-2024-019',
        name: 'Gas Leak Simulation',
        type: 'HazMat',
        location: 'Municipal Clinic - Ward 4',
        dateRange: '2024-03-01 to 2024-03-01',
        status: 'Scheduled',
        participants: '45 Participants',
        organizer: 'David Botha'
    },
    {
        id: 'DRL-2024-020',
        name: 'Active Shooter Drill',
        type: 'Security',
        location: 'Stadium - Entrance Gates',
        dateRange: '2024-03-10 to 2024-03-10',
        status: 'Planning',
        participants: '200 Participants',
        organizer: 'Chief M. Ndlovu'
    }
];

const DrillSchedule: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [activeTab, setActiveTab] = useState('Upcoming Drills');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Pagination State managed by usePagination below

    const STATUS_OPTIONS = [
        { value: '', label: 'All Statuses' },
        { value: 'Scheduled', label: 'Scheduled' },
        { value: 'Planning', label: 'Planning' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    const LOCATION_OPTIONS = [
        { value: '', label: 'All Locations' },
        { value: 'Civic Centre', label: 'Civic Centre' },
        { value: 'North Depot', label: 'North Depot' },
        { value: 'Wastewater Plant', label: 'Wastewater Plant' },
        { value: 'Public Library', label: 'Public Library' },
        { value: 'Municipal Clinic', label: 'Municipal Clinic' },
        { value: 'Stadium', label: 'Stadium' },
    ];



    const columns: Column<typeof DRILLS[0]>[] = [
        {
            header: 'Drill ID',
            accessorKey: 'id',
            sortable: true,
            cell: (item) => <span className="text-xs font-bold text-gray-800">{item.id}</span>
        },
        {
            header: 'Name',
            accessorKey: 'name',
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#BB8F53]">{item.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">Coordinator: {item.organizer}</span>
                </div>
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
                />
            )
        },
        {
            header: 'Location',
            accessorKey: 'location',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <MapPin size={14} className="text-gray-400" />
                    {item.location}
                </div>
            )
        },
        {
            header: 'Date & Range',
            accessorKey: 'dateRange',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                    <Calendar size={14} className="text-gray-400" />
                    {item.dateRange}
                </div>
            )
        },
        {
            header: 'Participants',
            accessorKey: 'participants',
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Users size={14} className="text-gray-400" />
                    {item.participants}
                </div>
            )
        },
        {
            header: '',
            cell: () => (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <button className="px-5 py-1.5 bg-[#F1E3D3] text-[#884616] rounded-lg text-xs font-bold hover:bg-[#d4eabc] transition-colors shadow-sm whitespace-nowrap">
                        Details
                    </button>
                    <button className="px-5 py-1.5 bg-[#034C3D] text-white rounded-lg text-xs font-bold hover:bg-[#023a2e] transition-colors shadow-sm whitespace-nowrap">
                        Start Drill
                    </button>
                </div>
            ),
            className: "w-48"
        }
    ];

    // TanStack Query hook
    const { data: drillsData } = useDrills();

    const drills = useMemo(() => {
        if (!drillsData || drillsData.length === 0) return DRILLS;
        const mapped = drillsData.map((d: any) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            location: d.location || d.building?.name || 'Unknown Location',
            dateRange: d.scheduledDate
                ? `${new Date(d.scheduledDate).toLocaleDateString()} to ${new Date(d.scheduledDate).toLocaleDateString()}`
                : 'Date Pending',
            status: d.status || 'Scheduled',
            participants: d.participants || 'Staff Only',
            organizer: d.organizer || 'Unassigned'
        }));
        return [...DRILLS, ...mapped];
    }, [drillsData]);

    const filteredDrills = drills.filter(drill => {
        const matchesSearch = !searchTerm || (
            drill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            drill.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = !statusFilter || drill.status === statusFilter;
        const matchesLocation = !locationFilter || (drill.location && drill.location.includes(locationFilter));

        // Tab filtering
        const matchesTab = activeTab === 'All Drills' ||
            (activeTab === 'Upcoming Drills' && (drill.status === 'Scheduled' || drill.status === 'Planning')) ||
            (activeTab === 'Completed Drills' && drill.status === 'Completed') ||
            (activeTab === 'Drill Schedule'); // Dynamic schedule view

        return matchesSearch && matchesStatus && matchesLocation && matchesTab;
    });

    const {
        paginatedData: paginatedDrills,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        setItemsPerPage,
    } = usePagination({
        data: filteredDrills,
        defaultItemsPerPage: 10,
        resetOnChange: [searchTerm, statusFilter, locationFilter, activeTab],
    });

    const actionButton = {
        label: 'Schedule Drill',
        onClick: () => console.log('Schedule Drill'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Drill Schedule"
            description="Manage and track emergency drills and simulations"
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Hero Card: Upcoming Drills */}
                    <div className="bg-[#F1E3D3] p-6 rounded-2xl border border-[#d4eabc] shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start z-10">
                            <div className="flex items-center gap-2 px-2 py-1 bg-white/60 rounded-lg text-xs font-bold text-[#884616]">
                                <Calendar size={16} />
                                <span>Upcoming Drills</span>
                            </div>
                        </div>
                        <div className="z-10">
                            <h3 className="text-4xl font-bold text-[#884616]">3</h3>
                        </div>
                        <Calendar size={100} className="absolute -right-4 -bottom-4 text-[#884616]/5 group-hover:opacity-10 transition-opacity" />
                    </div>

                    {[
                        { label: 'Completed This Year', value: '28', icon: Info, color: 'text-gold-600', iconBg: 'bg-gold-50' },
                        { label: 'Avg Response Time', value: '56%', icon: Activity, color: 'text-blue-600', iconBg: 'bg-blue-50' },
                        { label: 'Drill Compliance', value: '12', icon: CheckCircle, color: 'text-gold-600', iconBg: 'bg-gold-50' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start z-10">
                                <div className={clsx("p-2 rounded-lg", stat.iconBg)}>
                                    <stat.icon size={18} className={stat.color} />
                                </div>
                            </div>
                            <div className="z-10">
                                <h3 className="text-4xl font-bold text-gray-800">{stat.value}</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
                            </div>
                            <stat.icon size={100} className="absolute -right-4 -bottom-4 text-gray-100/30 group-hover:opacity-10 transition-opacity" />
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-100">
                    {['Upcoming Drills', 'Completed Drills', 'Drill Schedule'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "pb-4 text-sm font-bold transition-all relative whitespace-nowrap",
                                activeTab === tab ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search drills ..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="w-44">
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={STATUS_OPTIONS}
                                placeholder="Status"
                                bgColor="bg-light-gold"
                            />
                        </div>
                        <div className="w-44">
                            <Select
                                value={locationFilter}
                                onChange={setLocationFilter}
                                options={LOCATION_OPTIONS}
                                placeholder="Location"
                                bgColor="bg-light-gold"
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Scheduled Drills"
                    data={paginatedDrills}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    searchable={false}
                    filterable={false}
                    paginatable={true}
                    totalItems={filteredDrills.length}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </DashboardLayout>
    );
};

export default DrillSchedule;
