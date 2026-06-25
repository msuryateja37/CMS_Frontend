import React, { useState } from 'react';
import type { Case } from '../../services/cases.service';
import { DataTable, type Column } from '../common/DataTable';
import { Pill } from '../common/Pill';

interface RecentIncidentsTableProps {
    cases: Case[];
    loading?: boolean;
}

const RecentIncidentsTable: React.FC<RecentIncidentsTableProps> = ({ cases, loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const columns: Column<Case>[] = [
        {
            header: 'Reference',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3 w-48">
                    <div className="w-8 h-8 rounded-full bg-[#BB8F53] flex items-center justify-center ">
                        {/* <div className="w-4 h-4 rounded-full border-2 border-white/30"></div> */}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.incidentNumber}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessorKey: 'type',
            sortable: true,
            cell: (item) => <span className="text-sm text-gray-700">{item.type}</span>
        },
        {
            header: 'Severity',
            accessorKey: 'severity',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.severity || item.severityLevel || 'Medium'}
                    variant={item.severity || item.severityLevel || 'medium'}
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
                    variant={item.status}
                    className="rounded-lg" // Status pills were rounded-lg in original, severity were rounded-full. Pill component defaults to rounded-full. Adjust if needed.
                />
            )
        },
        {
            header: 'Reported',
            accessorKey: 'createdAt',
            sortable: true,
            cell: (item) => <span className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</span>
        },
        {
            header: 'Assigned to',
            accessorKey: 'assignedTo',
            sortable: true,
            cell: (item) => <span className="text-sm text-gray-600 bg-grey-200 px-2 py-1 rounded-full flex items-center justify-center">{item.assignedTo?.name || 'Unassigned'}</span>
        },
        {
            header: 'Location',
            accessorKey: 'id',
            sortable: true,
            cell: (item) => <span className="text-sm text-gray-600">{item.building?.name || item.building?.province?.name || 'N/A'}</span>
        }
    ];

    const filteredCases = cases.filter(item =>
        item.incidentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DataTable
            title="Recent Incidents"
            data={filteredCases.slice(0, 10)}
            columns={columns}
            keyField="id"
            loading={loading}
            selectable={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            searchable={true}
            onSearch={setSearchTerm}
            paginatable={false} // Since it's a "Recent" table, maybe no pagination or handled externally
            frozenColumnCount={1}
        />
    );
};

export default RecentIncidentsTable;
