import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Select } from '../common/Select';
import casesService from '../../services/cases.service';
import userService, { type User } from '../../services/userService';
import { ArrowUpRight } from 'lucide-react';

interface EscalationModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseId: string;
    currentRole: string; // 'OHS_PRACTITIONER' or 'SECURITY_PRACTITIONER'
    currentUserId: string;
    onSuccess?: () => void;
}

const EscalationModal: React.FC<EscalationModalProps> = ({
    isOpen,
    onClose,
    caseId,
    currentRole,
    currentUserId,
    onSuccess,
}) => {
    const [peers, setPeers] = useState<User[]>([]);
    const [selectedPeerId, setSelectedPeerId] = useState('');
    const [reason, setReason] = useState('');
    const [isEscalating, setIsEscalating] = useState(false);
    const [isLoadingPeers, setIsLoadingPeers] = useState(false);
    const [error, setError] = useState('');

    const roleLabel = currentRole === 'OHS_PRACTITIONER' ? 'OHS Practitioner' : 'Security Practitioner';

    useEffect(() => {
        if (isOpen) {
            fetchPeers();
        }
    }, [isOpen, currentRole]);

    const fetchPeers = async () => {
        try {
            setIsLoadingPeers(true);
            const data = await userService.listFiltered({ role: currentRole });
            // Exclude current user from the list
            setPeers(data.filter(u => u.id !== currentUserId));
        } catch (err) {
            console.error('Error fetching peers:', err);
        } finally {
            setIsLoadingPeers(false);
        }
    };

    const handleEscalate = async () => {
        if (!selectedPeerId || !reason.trim()) {
            setError('Please select a peer and provide a reason for escalation.');
            return;
        }

        try {
            setIsEscalating(true);
            setError('');
            await casesService.escalateCase(caseId, selectedPeerId, reason.trim());
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err: any) {
            console.error('Error escalating incident:', err);
            setError(err?.response?.data?.message || 'Failed to escalate incident. Please try again.');
        } finally {
            setIsEscalating(false);
        }
    };

    const handleClose = () => {
        setSelectedPeerId('');
        setReason('');
        setError('');
        setPeers([]);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Escalate"
            footer={
                <>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleEscalate}
                        disabled={!selectedPeerId || !reason.trim() || isEscalating}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isEscalating ? 'Escalating...' : 'Confirm Escalation'}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Role indicator */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800">
                    <ArrowUpRight size={18} />
                    <div>
                        <p className="text-sm font-bold">Peer-to-Peer Escalation</p>
                        <p className="text-xs opacity-75">
                            This incident will be reassigned to another {roleLabel.toLowerCase()}
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-500">
                    Select a peer {roleLabel.toLowerCase()} to take over this incident. They will be notified immediately.
                </p>

                <Select
                    label={`Select ${roleLabel}`}
                    value={selectedPeerId}
                    onChange={setSelectedPeerId}
                    options={peers.map(u => ({
                        value: u.id,
                        label: `${u.name} (${u.email})${u.province ? ` — ${u.province.name}` : ''}`
                    }))}
                    placeholder={isLoadingPeers ? 'Loading peers...' : `Choose ${roleLabel.toLowerCase()}...`}
                    disabled={isLoadingPeers}
                />

                {!isLoadingPeers && peers.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                        No other {roleLabel.toLowerCase()}s found.
                    </p>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Escalation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                        placeholder="Explain why this incident needs to be escalated to another practitioner..."
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                {peers.length > 0 && !isLoadingPeers && (
                    <p className="text-xs text-gray-400">
                        {peers.length} peer{peers.length > 1 ? 's' : ''} available
                    </p>
                )}
            </div>
        </Modal>
    );
};

export default EscalationModal;
