import { useState } from 'react';
import usePagination from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';
import { Select } from '../../components/common/Select';

const STATS_CARDS = [
  {
    title: 'Entries Today',
    value: '1,247',
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-[#BB8F53]/20',
    barColor: 'bg-[#BB8F53]'
  },
  {
    title: 'Denied Today',
    value: '23',
    icon: CheckCircle2,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    barColor: 'bg-orange-400'
  },
  {
    title: 'Alert today',
    value: '3',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    barColor: 'bg-blue-500'
  },
  {
    title: 'Active Cards',
    value: '892',
    icon: AlertCircle,
    color: 'text-gold-500',
    bgColor: 'bg-gold-50',
    barColor: 'bg-gold-500'
  }
];

const ACCESS_LOGS = [
  { id: 1, time: '08:15', user: 'Linda Nkosi', action: 'Entry', location: 'Server Room', cardId: 'AACC-4521', status: 'Granted' },
  { id: 2, time: '08:15', user: 'Kagila Katlego', action: 'Entry Attempt', location: 'Main Entrance', cardId: 'AACC-4521', status: 'Denied' },
  { id: 3, time: '08:15', user: 'Dube Desmond', action: 'Entry', location: 'Floor 3 - East Wing', cardId: 'AACC-4521', status: 'Granted' },
  { id: 4, time: '08:15', user: 'Unknown', action: 'Exit', location: 'Parking Garage', cardId: 'AACC-4521', status: 'Alert' },
  { id: 5, time: '08:15', user: 'Lethabo', action: 'Tailgating', location: 'Executive Suite', cardId: 'AACC-4521', status: 'Granted' },
  { id: 6, time: '08:15', user: 'Thapelo', action: 'Tailgating', location: 'Main Entrance', cardId: 'AACC-4521', status: 'Denied' },
  { id: 7, time: '08:15', user: 'Simphiwe', action: 'Entry', location: 'Floor 4 west wing', cardId: 'AACC-4521', status: 'Denied' },
  { id: 8, time: '08:15', user: 'Andile', action: 'Exit', location: 'Parking Garage', cardId: 'AACC-4521', status: 'Denied' },
  { id: 9, time: '08:15', user: 'Nkosi', action: 'Exit', location: 'Server Room', cardId: 'AACC-4521', status: 'Alert' },
  { id: 10, time: '08:15', user: 'Guguthela ..', action: 'Entry Attempt', location: 'Main ENTRANCE', cardId: 'AACC-4521', status: 'Granted' },
];

export function AccessControl() {
  const [activeTab, setActiveTab] = useState('Access Logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Extract unique locations from logs
  const locations = Array.from(new Set(ACCESS_LOGS.map(log => log.location))).sort();
  const statuses = Array.from(new Set(ACCESS_LOGS.map(log => log.status))).sort();

  const columns: Column<typeof ACCESS_LOGS[0]>[] = [
    {
      header: 'Time',
      accessorKey: 'time',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#BB8F53] flex items-center justify-center text-white">

          </div>
          <span className="text-sm font-medium text-gray-400">{item.time}</span>
        </div>
      )
    },
    {
      header: 'User',
      accessorKey: 'user',
      sortable: true,
      cell: (item) => (
        <span className={clsx(
          "text-sm font-bold",
          item.user === 'Unknown' ? "text-orange-200" : "text-gray-800"
        )}>{item.user}</span>
      )
    },
    {
      header: 'Action',
      accessorKey: 'action',
      sortable: true,
      cell: (item) => <span className="text-sm font-bold text-gray-800">{item.action}</span>
    },
    {
      header: 'Location',
      accessorKey: 'location',
      sortable: true,
      cell: (item) => <span className="text-sm font-medium text-gray-400">{item.location}</span>
    },
    {
      header: 'Card ID',
      accessorKey: 'cardId',
      sortable: true,
      cell: (item) => <span className="text-sm font-medium text-gray-400">{item.cardId}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => (
        <Pill label={item.status} variant={item.status} />
      )
    }
  ];

  const filteredLogs = ACCESS_LOGS.filter(log => {
    const matchesSearch = !searchTerm || (
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.cardId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = !statusFilter || log.status === statusFilter;
    const matchesLocation = !locationFilter || log.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const {
    paginatedData: paginatedLogs,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredLogs,
    defaultItemsPerPage: 10,
    resetOnChange: [statusFilter, locationFilter, searchTerm],
  });

  return (
    <DashboardLayout
      title="Access Control"
      description="Access Control"
      breadcrumbs={[{ label: "Dashboard", path: "/security/dashboard" }, { label: "Access Control" }]}
    >
      <div className="space-y-8 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_CARDS.map((card, index) => (
            <div key={index} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col justify-between relative overflow-hidden group h-40">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={clsx("p-2 rounded-lg", card.bgColor)}>
                  <card.icon size={20} className={card.color} />
                </div>
                <span className="text-gray-400 text-xs font-medium">{card.title}</span>
              </div>
              <div className="mt-2 relative z-10">
                <h3 className={clsx("text-4xl font-bold", card.color)}>{card.value}</h3>
              </div>
              <div className={clsx("absolute bottom-0 left-0 right-0 h-4 transition-all group-hover:h-6", card.barColor, "rounded-b-[2rem] opacity-90")}></div>
            </div>
          ))}
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-50">
            {['Access Logs', 'Access Cards', 'Access Points'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab
                    ? "bg-[#e8f5e9] text-[#2e7d32]"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#884616] text-white rounded-xl font-bold text-sm shadow-lg shadow-gold-900/10 hover:bg-[#6e3510] transition-all">
            <Plus size={18} />
            Issue New Card
          </button>
        </div>

        <DataTable
          title="Real-time Access Logs"
          data={paginatedLogs}
          columns={columns}
          keyField="id"
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchable={true}
          onSearch={setSearchTerm}
          paginatable={true}
          totalItems={filteredLogs.length}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
          filterable={true}
          filterOptions={
            <div className="flex gap-3">
              <div className="w-[160px]">
                <Select
                  value={locationFilter}
                  onChange={setLocationFilter}
                  options={[
                    { value: '', label: 'All locations' },
                    ...locations.map(loc => ({ value: loc, label: loc }))
                  ]}
                  placeholder="Location"
                  bgColor="bg-light-gold"
                />
              </div>
              <div className="w-[160px]">
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: '', label: 'All statuses' },
                    ...statuses.map(s => ({ value: s, label: s }))
                  ]}
                  placeholder="Status"
                  bgColor="bg-light-gold"
                />
              </div>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}

export default AccessControl;
