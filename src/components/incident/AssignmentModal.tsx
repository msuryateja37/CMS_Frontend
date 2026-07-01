import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Select } from '../common/Select';
import casesService from '../../services/cases.service';
import userService, { type User } from '../../services/userService';

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    incidentId: string;
    provinceId?: string;
    /**
     * Cross-province mode: used by an admin to reassign a case that escalated
     * (not picked up within 3 days) to an OHS practitioner in ANOTHER province.
     * Lists OHS practitioners across all provinces, excluding the case's own.
     */
    crossProvince?: boolean;
    onSuccess?: () => void;
}

// Only OHS practitioners can be assigned a pooled/escalated case.
const PRACTITIONER_CATEGORIES = [
    { value: 'OHS_PRACTITIONER', label: 'OHS' },
];

const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, incidentId, provinceId, crossProvince, onSuccess }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const fetchPractitioners = async (role: string) => {
        try {
            setIsLoadingUsers(true);
            const data = await userService.listFiltered(
                crossProvince ? { role } : { provinceId, role },
            );
            // In cross-province mode, drop the case's own province (it already
            // failed to pick the case up — that's why it escalated).
            const list = crossProvince
                ? data.filter((u) => (u as unknown as { province?: { id?: string } }).province?.id !== provinceId)
                : data;
            setUsers(list);
        } catch (err) {
            console.error('Error fetching practitioners:', err);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    // Reset + load on open / when inputs change.
    useEffect(() => {
        if (!isOpen) return;
        setSelectedUserId('');
        if (crossProvince) {
            // Admin reassignment — no category picker, list OHS immediately.
            setSelectedCategory('OHS_PRACTITIONER');
            fetchPractitioners('OHS_PRACTITIONER');
        } else if (provinceId && selectedCategory) {
            fetchPractitioners(selectedCategory);
        } else {
            setSelectedCategory('');
            setUsers([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, provinceId, selectedCategory, crossProvince]);

    const handleAssignSubmit = async () => {
        if (!incidentId || !selectedUserId) return;
        try {
            setIsAssigning(true);
            await casesService.assignCase(incidentId, selectedUserId);
            if (onSuccess) onSuccess();
            onClose();
            setSelectedCategory('');
            setSelectedUserId('');
        } catch (err) {
            console.error('Error assigning case:', err);
        } finally {
            setIsAssigning(false);
        }
    };

    const showList = crossProvince || !!selectedCategory;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={crossProvince ? 'Reassign to another province' : 'Assign Case'}
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssignSubmit}
                        disabled={!selectedUserId || isAssigning}
                        className="px-6 py-2 bg-[#BB8F53] text-white rounded-lg font-bold text-sm hover:bg-[#A1743E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                    {crossProvince
                        ? 'This case was not picked up within 3 days. Assign it to an OHS practitioner from another province.'
                        : 'Select the practitioner category and assign a practitioner from the same area as this case.'}
                </p>

                {!crossProvince && (
                    <Select
                        label="Select Category"
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={PRACTITIONER_CATEGORIES}
                        placeholder="Choose OHS..."
                    />
                )}

                {showList && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select OHS Practitioner
                        </label>
                        {isLoadingUsers ? (
                            <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                Loading practitioners...
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-xs text-red-500 py-3">
                                No OHS practitioners found{crossProvince ? ' in other provinces.' : " in the case's area."}
                            </p>
                        ) : (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                                {users.map(u => {
                                    const count = u.ticketCount ?? 0;
                                    const isSelected = selectedUserId === u.id;
                                    const provinceName = (u as unknown as { province?: { name?: string } }).province?.name;
                                    return (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => setSelectedUserId(u.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${isSelected
                                                    ? 'bg-gold-50 border-l-4 border-l-gold-500'
                                                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-gold-500' : 'border-gray-300'
                                                    }`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-gold-700' : 'text-gray-800'}`}>
                                                        {u.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {provinceName ? `${provinceName} • ` : ''}{u.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${count === 0
                                                    ? 'bg-gold-50 text-gold-700'
                                                    : count <= 3
                                                        ? 'bg-yellow-50 text-yellow-700'
                                                        : 'bg-red-50 text-red-700'
                                                }`}>
                                                {count} {count === 1 ? 'ticket' : 'tickets'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AssignmentModal;
