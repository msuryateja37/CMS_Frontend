import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { DataTable, type Column } from '../../components/common/DataTable';
import { dressingRegistryService, type DressingRegistryEntry } from '../../services/dressingRegistry.service';
import { Eye, Loader2, ArrowUpRight, CheckCircle, Folder, X, User, Calendar, Clock, Building2, Activity, Stethoscope, UserCheck } from 'lucide-react';
import { formatCategory } from '../../utils/formatters';

const FirstAiderMyRegistry: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedEntry, setSelectedEntry] = useState<DressingRegistryEntry | null>(null);

    const {
        data: entries = [],
        isLoading: loading,
        error: fetchError
    } = useQuery<DressingRegistryEntry[]>({
        queryKey: ['dressing-registry', 'my'],
        queryFn: () => dressingRegistryService.getMyEntries(),
    });

    const error = fetchError ? (fetchError as any).message || 'Failed to load registry' : null;

    const totalCount = entries.length;
    const caseLinkedCount = entries.filter(e => e.incidentId).length;
    const manualCount = entries.filter(e => !e.incidentId).length;

    const filteredEntries = entries.filter(e => {
        const matchesSearch = (
            e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.officeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.natureOfInjury?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.incident?.incidentNumber && e.incident.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return matchesSearch;
    });

    // Pagination slice for local table (as API returns all entries for the user)
    const paginatedEntries = filteredEntries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns: Column<DressingRegistryEntry>[] = [
        {
            header: 'Incident ID / Ref',
            accessorKey: 'incident',
            sortable: true,
            cell: (item) => (
                <span className="font-mono text-sm font-medium text-gray-600">
                    {item.incident?.incidentNumber || <span className="text-gray-400 italic text-xs">Manual Entry</span>}
                </span>
            )
        },
        {
            header: 'Patient Name',
            accessorKey: 'name',
            sortable: true,
            cell: (item) => <span className="text-gray-700 font-medium">{item.name}</span>
        },
        {
            header: 'Nature of Injury',
            accessorKey: 'natureOfInjury',
            sortable: true,
            cell: (item) => <span className="text-gray-705 font-medium">{formatCategory(item.natureOfInjury || 'N/A')}</span>
        },
        {
            header: 'Office Name',
            accessorKey: 'officeName',
            sortable: true,
            cell: (item) => <span className="text-gray-600 text-sm">{item.officeName}</span>
        },
        {
            header: 'Date Logged',
            accessorKey: 'date',
            sortable: true,
            cell: (item) => (
                <span className="text-gray-500 text-sm">
                    {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: (item) => (
                <button
                    onClick={() => setSelectedEntry(item)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-light-gold text-brown text-xs font-bold rounded-lg hover:bg-gold/10 transition-colors whitespace-nowrap"
                >
                    <Eye size={14} />
                    View
                </button>
            )
        }
    ];

    return (
        <DashboardLayout
            title="My Registry"
            description="All dressing registry logs you have recorded"
            breadcrumbs={[{ label: 'Dashboard', path: '/first-aider/dashboard' }, { label: 'My Registry' }]}
        >
            <div className="flex flex-col gap-6">

                {/* Page title */}
                <div>
                    <h1 className="text-lg font-bold text-gray-900">OHS My Registry</h1>
                    <p className="text-xs text-gray-500">Inspection Register</p>
                </div>

                {/* Summary Stats */}
                {!loading && !error && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                                <Folder size={18} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Logs</p>
                                <p className="text-xl font-bold text-gray-900">{totalCount}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                                <ArrowUpRight size={18} className="text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Case-Linked Logs</p>
                                <p className="text-xl font-bold text-gray-900">{caseLinkedCount}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                                <CheckCircle size={18} className="text-green-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Manual Logs</p>
                                <p className="text-xl font-bold text-gray-900">{manualCount}</p>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                        <span className="ml-3 text-gray-600">Loading registry...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
                )}

                {!loading && !error && (
                    <DataTable
                        data={paginatedEntries}
                        columns={columns}
                        keyField="id"
                        selectable={false}
                        selectedIds={[]}
                        onSelectionChange={() => { }}
                        searchable={true}
                        onSearch={setSearchTerm}
                        searchPlaceholder="Search registry by patient name, office, or injury..."
                        filterable={false}
                        totalItems={filteredEntries.length}
                        paginatable={true}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                        totalPages={Math.ceil(filteredEntries.length / itemsPerPage)}
                        emptyMessage={searchTerm
                            ? 'No entries found matching your search.'
                            : 'No dressing logs in your registry yet.'}
                    />
                )}
            </div>

            {/* ===== View Registry Modal ===== */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-gray-900">Dressing Registry Entry</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs bg-amber-50 text-brown font-semibold px-2.5 py-0.5 rounded-full border border-amber-100">
                                        {selectedEntry.incident?.incidentNumber || 'Manual Entry'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-3">
                            {[
                                { icon: User, label: 'Patient Name', value: selectedEntry.name || '—' },
                                { icon: Calendar, label: 'Date', value: selectedEntry.date ? new Date(selectedEntry.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—' },
                                { icon: Clock, label: 'Time', value: selectedEntry.time || '—' },
                                { icon: Building2, label: 'Office Name', value: selectedEntry.officeName || '—' },
                                { icon: Activity, label: 'Nature of Injury', value: selectedEntry.natureOfInjury ? formatCategory(selectedEntry.natureOfInjury) : '—' },
                                { icon: Stethoscope, label: 'Treatment Rendered', value: selectedEntry.treatmentRendered || '—' },
                                { icon: UserCheck, label: 'Treated By', value: selectedEntry.treatedBy?.name || '—' },
                                { icon: Calendar, label: 'Date Resumed Work', value: selectedEntry.dateResumedWork ? new Date(selectedEntry.dateResumedWork).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-2 text-gray-500 shrink-0">
                                        <Icon size={14} className="text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-500">{label}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-800 text-right max-w-[55%] break-words">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="px-6 py-2 bg-brown hover:bg-opacity-90 text-white rounded-xl text-xs font-bold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default FirstAiderMyRegistry;
