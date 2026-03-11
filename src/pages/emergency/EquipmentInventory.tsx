import React, { useState } from 'react';
import usePagination from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Search,
    Plus,
    MoreHorizontal,
    Box,
    AlertTriangle,
    CheckCircle2,
    Wrench
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';
import { formatCategory } from '../../utils/formatters';

// --- MOCK DATA ---
const INVENTORY = [
    {
        id: 'EQ-001',
        name: 'Fire Extinguisher - Type ABC',
        category: 'Fire Safety',
        location: 'Hallway A - Level 1',
        quantity: 12,
        status: 'Operational',
        lastInspection: '2024-01-10',
        nextInspection: '2024-02-10'
    },
    {
        id: 'EQ-002',
        name: 'First Aid Kit - Pro',
        category: 'Medical',
        location: 'Break Room',
        quantity: 5,
        status: 'Low Stock',
        lastInspection: '2024-01-15',
        nextInspection: '2024-02-15'
    },
    {
        id: 'EQ-003',
        name: 'Emergency Generator',
        category: 'Power',
        location: 'Basement',
        quantity: 1,
        status: 'Maintenance Due',
        lastInspection: '2023-11-20',
        nextInspection: '2024-01-25'
    },
    {
        id: 'EQ-004',
        name: 'HazMat Spill Kit',
        category: 'HazMat',
        location: 'Loading Dock',
        quantity: 3,
        status: 'Operational',
        lastInspection: '2024-01-05',
        nextInspection: '2024-04-05'
    },
    {
        id: 'EQ-005',
        name: 'AED Defibrillator',
        category: 'Medical',
        location: 'Reception',
        quantity: 2,
        status: 'Operational',
        lastInspection: '2024-01-12',
        nextInspection: '2024-02-12'
    }
];

const EquipmentInventory: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeTab, setActiveTab] = useState('All Equipment');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Pagination State managed by usePagination below

    const CATEGORY_OPTIONS = [
        { value: '', label: 'All Categories' },
        { value: 'Fire Safety', label: 'Fire Safety' },
        { value: 'Medical', label: 'Medical' },
        { value: 'Power', label: 'Power' },
        { value: 'HazMat', label: 'HazMat' },
    ];

    const STATUS_OPTIONS = [
        { value: '', label: 'All Statuses' },
        { value: 'Operational', label: 'Operational' },
        { value: 'Low Stock', label: 'Low Stock' },
        { value: 'Maintenance Due', label: 'Maintenance Due' },
    ];



    const columns: Column<typeof INVENTORY[0]>[] = [
        {
            header: 'Asset ID',
            accessorKey: 'id',
            sortable: true,
            cell: (item) => <span className="text-xs font-medium text-gray-500">{item.id}</span>
        },
        {
            header: 'Item Name',
            accessorKey: 'name',
            sortable: true,
            cell: (item) => <span className="text-sm font-bold text-gray-800">{item.name}</span>
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{formatCategory(item.category)}</span>
        },
        {
            header: 'Quantity',
            accessorKey: 'quantity',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600 font-mono">{item.quantity}</span>
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
            header: 'Last Inspection',
            accessorKey: 'lastInspection',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.lastInspection}</span>
        },
        {
            header: 'Location',
            accessorKey: 'location',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.location}</span>
        },
        {
            header: '',
            cell: () => (
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            ),
            className: "w-10"
        }
    ];

    const filteredInventory = INVENTORY.filter(item => {
        const matchesSearch = !searchTerm || (
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        const matchesStatus = !statusFilter || item.status === statusFilter;

        // Tab filtering
        const matchesTab = activeTab === 'All Equipment' ||
            (activeTab === 'Maintenance Needed' && item.status === 'Maintenance Due') ||
            (activeTab === 'Low Stock' && item.status === 'Low Stock');

        return matchesSearch && matchesCategory && matchesStatus && matchesTab;
    });

    const {
        paginatedData: paginatedInventory,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        setItemsPerPage,
    } = usePagination({
        data: filteredInventory,
        defaultItemsPerPage: 10,
        resetOnChange: [searchTerm, categoryFilter, statusFilter, activeTab],
    });

    const actionButton = {
        label: 'Add Equipment',
        onClick: () => console.log('Add Equipment'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Equipment Inventory"
            description="Tracking emergency response equipment and maintenance"
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                                <Box size={20} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-gray-800">142</div>
                            <div className="text-sm text-gray-500 mt-1">Total Items</div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-2 rounded-lg bg-[#E4F2D3] text-[#0E4D41]">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-gray-800">92%</div>
                            <div className="text-sm text-gray-500 mt-1">Operational</div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                                <Wrench size={20} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-gray-800">5</div>
                            <div className="text-sm text-gray-500 mt-1">Maintenance Due</div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-2 rounded-lg bg-red-50 text-red-600">
                                <AlertTriangle size={20} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-gray-800">3</div>
                            <div className="text-sm text-gray-500 mt-1">Low Stock</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="inline-flex p-1 bg-[#E5E6E6] rounded-[20px] border border-gray-100 shadow-sm gap-2">
                    {['All Equipment', 'Maintenance Needed', 'Low Stock'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                                activeTab === tab ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search equipment ..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="w-44">
                            <Select
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={CATEGORY_OPTIONS}
                                placeholder="Category"
                                bgColor="bg-light-green"
                            />
                        </div>
                        <div className="w-44">
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={STATUS_OPTIONS}
                                placeholder="Status"
                                bgColor="bg-light-green"
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Equipment List"
                    data={paginatedInventory}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    paginatable={true}
                    totalItems={filteredInventory.length}
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

export default EquipmentInventory;
