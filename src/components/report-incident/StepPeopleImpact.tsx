import React, { useState, useMemo, useEffect } from 'react';
import { Select } from '../common/Select';
import { DataTable, type Column } from '../common/DataTable';
import locationService, { type Province, type User as LocationUser } from '../../services/location.service';
import { Trash2, Plus, Search, UserPlus } from 'lucide-react';



interface Person {
    id: string;
    name: string;
    phone?: string;
    email: string;
}

interface StepProps {
    data: any;
    onChange: (data: any) => void;
    onBack: () => void;
    onNext: () => void;
    onSaveDraft?: (data?: any) => void;
    onDiscard?: () => void;
}

const StepPeopleImpact: React.FC<StepProps> = ({ data, onChange, onBack, onNext, onSaveDraft, onDiscard }) => {
    // Description State
    const [description, setDescription] = useState(data.description || '');

    // ... (other state)

    const handleSaveDraftClick = () => {
        if (onSaveDraft) {
            onSaveDraft({
                description,
                impactedPeople
            });
        }
    };


    // API data state
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [users, setUsers] = useState<LocationUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // People Selection State
    const [selectedProvince, setSelectedProvince] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [impactedPeople, setImpactedPeople] = useState<Person[]>(data.impactedPeople || []);

    // Fetch provinces on mount
    useEffect(() => {
        locationService.getProvinces()
            .then(setProvinces)
            .catch(err => console.error('Error fetching provinces:', err));
    }, []);

    // Fetch users when province changes
    useEffect(() => {
        if (selectedProvince) {
            setLoadingUsers(true);
            setCurrentPage(1); // Reset to page 1 when province changes
            locationService.getUsersByProvince(selectedProvince)
                .then(setUsers)
                .catch(err => console.error('Error fetching users:', err))
                .finally(() => setLoadingUsers(false));
        } else {
            setUsers([]);
        }
    }, [selectedProvince]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPageState, setItemsPerPageState] = useState(5);

    // Manual Entry State
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualName, setManualName] = useState('');
    const [manualPhone, setManualPhone] = useState('');
    const [manualEmail, setManualEmail] = useState('');

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Filter People based on selection
    const filteredPeople = useMemo(() => {
        return users.filter(person => {
            const matchesSearch = searchQuery
                ? person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                person.email.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            // Exclude already added people
            const isNotAdded = !impactedPeople.some(p => p.email === person.email);

            return matchesSearch && isNotAdded;
        });
    }, [users, searchQuery, impactedPeople]);

    // Pagination calculations
    const totalItems = filteredPeople.length;
    const totalPages = Math.ceil(totalItems / itemsPerPageState);

    // Paginate the filtered data
    const paginatedPeople = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPageState;
        const endIndex = startIndex + itemsPerPageState;
        return filteredPeople.slice(startIndex, endIndex);
    }, [filteredPeople, currentPage, itemsPerPageState]);

    const handleAddPerson = (person: Person) => {
        const updatedPeople = [...impactedPeople, person];
        setImpactedPeople(updatedPeople);
        onChange({ impactedPeople: updatedPeople });
    };

    const handleRemovePerson = (email: string) => {
        const updatedPeople = impactedPeople.filter(p => p.email !== email);
        setImpactedPeople(updatedPeople);
        onChange({ impactedPeople: updatedPeople });
    };

    const handleManualAdd = () => {
        if (manualName && manualPhone && manualEmail) {
            const newPerson = {
                id: `manual-${Date.now()}`,
                name: manualName,
                phone: manualPhone,
                email: manualEmail
            };
            handleAddPerson(newPerson);
            // Reset manual fields
            setManualName('');
            setManualPhone('');
            setManualEmail('');
            setShowManualEntry(false);
        }
    };

    const handleNext = () => {
        onChange({
            description,
            impactedPeople
        });
        onNext();
    };

    const columns: Column<Person>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Phone', accessorKey: 'phone' },
        { header: 'Email', accessorKey: 'email' },
        {
            header: 'Action',
            cell: (person: Person) => (
                <button
                    onClick={() => handleAddPerson(person)}
                    className="flex items-center gap-1 text-green hover:text-dark-green font-bold text-sm"
                >
                    <Plus size={16} /> Add
                </button>
            )
        }
    ];

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <span className="text-sm font-bold text-gray-400 mb-1 block">Step 3/5</span>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">People & Impact</h3>
                <p className="text-gray-500 font-medium">Add involved people and describe the impact</p>
                <div className="h-[1px] bg-gray-100 w-full mt-6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Selection & Search */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Search size={18} /> Find People
                        </h4>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <Select
                                label="Province"
                                value={selectedProvince}
                                onChange={setSelectedProvince}
                                options={provinces.map(p => ({ value: p.id, label: p.name }))}
                                placeholder="Select a province"
                                bgColor="bg-white"
                            />
                        </div>

                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green focus:border-transparent outline-none"
                            />
                        </div>

                        <DataTable
                            data={paginatedPeople}
                            columns={columns}
                            keyField="id"
                            paginatable
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPageState}
                            totalItems={totalItems}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(size) => {
                                setItemsPerPageState(size);
                                setCurrentPage(1); // Reset to first page on items per page change
                            }}
                            emptyMessage={loadingUsers ? "Loading users..." : selectedProvince ? "No users found in selected province" : "Please select a province"}
                        />

                        {/* Manual Entry Toggle */}
                        <div className="mt-4">
                            <button
                                onClick={() => setShowManualEntry(!showManualEntry)}
                                className="flex items-center gap-2 text-dark-green font-bold hover:underline"
                            >
                                <UserPlus size={18} />
                                {showManualEntry ? 'Cancel Manual Entry' : 'Add Person Manually'}
                            </button>

                            {showManualEntry && (
                                <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <input
                                            placeholder="Name"
                                            value={manualName}
                                            onChange={(e) => setManualName(e.target.value)}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green outline-none"
                                        />
                                        <input
                                            placeholder="Phone"
                                            value={manualPhone}
                                            onChange={(e) => setManualPhone(e.target.value)}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green outline-none"
                                        />
                                        <input
                                            placeholder="Email"
                                            value={manualEmail}
                                            onChange={(e) => setManualEmail(e.target.value)}
                                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleManualAdd}
                                        disabled={!manualName || !manualPhone || !manualEmail}
                                        className="px-6 py-2 bg-green text-white rounded-lg font-bold hover:bg-dark-green disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Person
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Impacted People List */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 h-full">
                        <h4 className="font-bold text-gray-800 mb-4">Impacted People ({impactedPeople.length})</h4>

                        {impactedPeople.length === 0 ? (
                            <div className="text-gray-400 text-center py-8 text-sm">
                                No people added yet.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {impactedPeople.map((person) => (
                                    <div key={person.id || person.email} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                                        <button
                                            onClick={() => handleRemovePerson(person.email)}
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <h5 className="font-bold text-gray-800">{person.name}</h5>
                                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                                            <p>{person.phone}</p>
                                            <p>{person.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Impact Description Section */}
            <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-800 mb-2">Impact Description *</h4>
                <p className="text-sm text-gray-500 mb-3">Provide a detailed description of the case and its impact (min 100 characters).</p>
                <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the incident details and impact..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green focus:border-transparent outline-none transition-all resize-none"
                />
                <div className="text-right mt-2 text-xs font-medium">
                    <span className={description.length < 100 ? 'text-red-500' : 'text-green'}>
                        {description.length} / 100 characters minimum
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-100">
                <div className="flex gap-8">
                    <button
                        onClick={handleSaveDraftClick}
                        className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={onDiscard}
                        className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                        Discard
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="px-8 py-2.5 bg-light-green rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={description.length < 100}
                        className="px-8 py-2.5 bg-green text-white rounded-lg font-bold shadow-sm hover:bg-[#0f766e] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepPeopleImpact;
