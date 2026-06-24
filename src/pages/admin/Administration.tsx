import React, { useState } from 'react';
import usePagination from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Search,
    Plus,
    MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';

// --- MOCK DATA ---
const USERS = [
    {
        id: 'EMP-0234',
        name: 'Olivia Mason',
        role: 'Marketing',
        roleDetail: 'Executive Marketing',
        department: 'OHS',
        province: 'Gauteng',
        lastLogin: '2024-01-23 14:33',
        status: 'Active',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0178',
        name: 'Ethan Ray',
        role: 'UI Designer',
        roleDetail: 'Product Design',
        department: 'Facilities',
        province: 'Gauteng',
        lastLogin: '2024-01-23 17:43',
        status: 'Active',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0312',
        name: 'Lina Armand',
        role: 'Lab Analyst',
        roleDetail: 'R&D',
        department: 'Administration',
        province: 'Western Cape',
        lastLogin: '--',
        status: 'Inactive',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0115',
        name: 'Jacob Yuen',
        role: 'Site Supervisor',
        roleDetail: 'Operations',
        department: 'Security',
        province: 'Eastern Cape',
        lastLogin: '2024-01-23 17:43',
        status: 'Active',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0289',
        name: 'Mia Torres',
        role: 'HR Officer',
        roleDetail: 'Human Resources',
        department: 'Operations',
        province: 'Western Cape',
        lastLogin: '2024-01-23 17:43',
        status: 'Active',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0956',
        name: 'Sara Kim',
        role: 'Customer Support',
        roleDetail: 'Customer Service',
        department: 'Executive',
        province: 'Limpopo',
        lastLogin: '2024-01-23 17:43',
        status: 'Active',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0291',
        name: 'Daniel Cheung',
        role: 'Compliance Specialist',
        roleDetail: 'Operations',
        department: 'OHS',
        province: 'Kwa-Zulu Natal',
        lastLogin: '2024-01-23 17:43',
        status: 'Active',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0275',
        name: 'Anya Rodriguez',
        role: 'Graphic Designer',
        roleDetail: 'Marketing',
        department: 'Facilities',
        province: 'North West',
        lastLogin: '--',
        status: 'Inactive',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0159',
        name: 'Kelvin Yu',
        role: 'Training Coordinator',
        roleDetail: 'HR',
        department: 'Administration',
        province: 'Mpumalanga',
        lastLogin: '2024-01-23 17:43',
        status: 'Active',
        avatar: 'bg-[#BB8F53]'
    },
    {
        id: 'EMP-0320',
        name: 'Farah Nabila',
        role: 'Customer Experience Lead',
        roleDetail: 'Customer Service',
        department: 'Operations',
        province: 'Free State',
        lastLogin: '2024-01-23 17:43',
        status: 'Active',
        avatar: 'bg-[#BB8F53]'
    }
];

const Administration: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [activeTab, setActiveTab] = useState('Users');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const ROLE_OPTIONS = [
        { value: '', label: 'All Roles' },
        ...Array.from(new Set(USERS.map(u => u.role))).map(role => ({
            value: role,
            label: role
        }))
    ];

    const columns: Column<typeof USERS[0]>[] = [
        {
            header: 'User',
            accessorKey: 'name',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className={clsx("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold", item.avatar)}>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.id}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessorKey: 'role',
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{item.role}</span>
                    <span className="text-xs text-gray-400">{item.roleDetail}</span>
                </div>
            )
        },
        {
            header: 'Department',
            accessorKey: 'department',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.department}</span>
        },
        {
            header: 'Province',
            accessorKey: 'province',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.province}</span>
        },
        {
            header: 'Last Login',
            accessorKey: 'lastLogin',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.lastLogin}</span>
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.status}
                    variant={item.status === 'Active' ? 'active' : 'default'}
                />
            )
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

    const filteredUsers = USERS.filter(user => {
        const matchesSearch = !searchTerm || (
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesRole = !roleFilter || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const {
        paginatedData: paginatedUsers,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        setItemsPerPage,
    } = usePagination({
        data: filteredUsers,
        defaultItemsPerPage: 10,
        resetOnChange: [searchTerm, roleFilter, activeTab],
    });

    const actionButton = {
        label: 'Quick Report',
        onClick: () => console.log('Quick Report'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Administration"
            description="Administration"
            breadcrumbs={[{ label: "Dashboard", path: "/admin/dashboard" }, { label: "Administration" }]}
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Tabs */}
                <div className="inline-flex p-1 bg-[#F8FAFB] rounded-[20px] border border-gray-100 shadow-sm">
                    {['Users', 'Roles & Permissions', 'Locations', 'Settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-6 py-2 rounded-[16px] text-[13px] font-bold transition-all duration-200",
                                activeTab === tab
                                    ? "bg-white text-[#1D312E] shadow-sm"
                                    : "text-[#64748B] hover:text-[#1D312E] hover:bg-white/50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users ..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="w-48">
                            <Select
                                value={roleFilter}
                                onChange={setRoleFilter}
                                options={ROLE_OPTIONS}
                                placeholder="Role"
                                bgColor="bg-light-gold"
                            />
                        </div>
                        <button className="flex items-center gap-2 py-3 px-6 bg-[#004D40] text-white rounded-xl text-sm font-bold hover:bg-[#00382e] transition-colors whitespace-nowrap">
                            <Plus size={16} /> Add User
                        </button>
                    </div>
                </div>

                <DataTable
                    title="User Management"
                    data={paginatedUsers}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    paginatable={true}
                    totalItems={filteredUsers.length}
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

export default Administration;
