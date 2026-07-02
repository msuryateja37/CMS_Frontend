import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Shield,
    Plus,
    Search,
    AlertTriangle,
    Eye,
    TrendingDown,
    X,
    Filter
} from 'lucide-react';

interface RiskRecord {
    id: string;
    refNo: string;
    activity: string;
    hazard: string;
    task: string;
    riskType: 'Ergonomic' | 'Safety' | 'Health' | 'Environmental';
    activityType: 'Routine' | 'Non-routine';
    riskOwner: string;
    initialLikelihood: number;
    initialConsequence: number;
    initialRiskValue: number;
    existingControls: string;
    recommendedControls: string;
    residualLikelihood: number;
    residualConsequence: number;
    residualRiskValue: number;
}

const OHSHira: React.FC = () => {
    // Initial seeded risks matching the analysis of the ergonomics Excel sheet
    const [risks, setRisks] = useState<RiskRecord[]>([
        {
            id: '1',
            refNo: 'HIRA-001',
            activity: 'Continuous input of documents / capturing of transactions',
            hazard: 'Repetitive movement/ergonomic hazards (hand, wrist, fingers)',
            task: 'Input of documents on PC',
            riskType: 'Ergonomic',
            activityType: 'Routine',
            riskOwner: 'All employees / captures',
            initialLikelihood: 4,
            initialConsequence: 3,
            initialRiskValue: 12,
            existingControls: 'None',
            recommendedControls: 'Provide ergonomic keyboard/mouse, wrist rests, and enforce 5-minute micro-breaks hourly.',
            residualLikelihood: 2,
            residualConsequence: 2,
            residualRiskValue: 4
        },
        {
            id: '2',
            activity: 'Continuous computer work (data capturing & analysis)',
            refNo: 'HIRA-002',
            hazard: 'Visual fatigue, awkward posture (neck, back strain)',
            task: 'Continuous screen reading & sitting',
            riskType: 'Ergonomic',
            activityType: 'Routine',
            riskOwner: 'All office employees',
            initialLikelihood: 4,
            initialConsequence: 4,
            initialRiskValue: 16,
            existingControls: 'Standard office chairs',
            recommendedControls: 'Provide adjustable monitor stands, anti-glare screens, and office ergonomics awareness training.',
            residualLikelihood: 2,
            residualConsequence: 3,
            residualRiskValue: 6
        },
        {
            id: '3',
            activity: 'Manual handling of heavy files and office archive boxes',
            refNo: 'HIRA-003',
            hazard: 'Musculoskeletal injury, physical strain, slips/trips',
            task: 'Carrying files/lifting heavy boxes to high shelves',
            riskType: 'Safety',
            activityType: 'Non-routine',
            riskOwner: 'Facilities / Admin Officers',
            initialLikelihood: 3,
            initialConsequence: 3,
            initialRiskValue: 9,
            existingControls: 'None',
            recommendedControls: 'Provide manual handling training, supply rolling utility trolleys, and restrict lifting above shoulder height.',
            residualLikelihood: 1,
            residualConsequence: 3,
            residualRiskValue: 3
        },
        {
            id: '4',
            activity: 'Prolonged sitting in non-ergonomic chairs',
            refNo: 'HIRA-004',
            hazard: 'Poor posture, lower back pain, circulation issues',
            task: 'Sedentary desk work',
            riskType: 'Ergonomic',
            activityType: 'Routine',
            riskOwner: 'All office staff',
            initialLikelihood: 5,
            initialConsequence: 3,
            initialRiskValue: 15,
            existingControls: 'Standard office chairs',
            recommendedControls: 'Procure and distribute ergonomic task chairs, establish standing desks, and promote stretching exercises.',
            residualLikelihood: 2,
            residualConsequence: 2,
            residualRiskValue: 4
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRiskType, setSelectedRiskType] = useState<string>('ALL');

    // New risk form state
    const [newRisk, setNewRisk] = useState<Partial<RiskRecord>>({
        activity: '',
        hazard: '',
        task: '',
        riskType: 'Ergonomic',
        activityType: 'Routine',
        riskOwner: '',
        initialLikelihood: 3,
        initialConsequence: 3,
        existingControls: 'None',
        recommendedControls: '',
        residualLikelihood: 2,
        residualConsequence: 2
    });

    const getRiskLevelColor = (val: number) => {
        if (val >= 15) return 'bg-red-50 border-red-200 text-red-700'; // High/Critical
        if (val >= 8) return 'bg-orange-50 border-orange-200 text-orange-700'; // Medium
        return 'bg-green-50 border-green-200 text-green-700'; // Low
    };

    const getRiskLabel = (val: number) => {
        if (val >= 15) return `Critical (${val})`;
        if (val >= 8) return `High (${val})`;
        return `Low (${val})`;
    };

    const handleOpenModal = () => {
        setNewRisk({
            activity: '',
            hazard: '',
            task: '',
            riskType: 'Ergonomic',
            activityType: 'Routine',
            riskOwner: '',
            initialLikelihood: 3,
            initialConsequence: 3,
            existingControls: 'None',
            recommendedControls: '',
            residualLikelihood: 2,
            residualConsequence: 2
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const initL = Number(newRisk.initialLikelihood || 3);
        const initC = Number(newRisk.initialConsequence || 3);
        const resL = Number(newRisk.residualLikelihood || 2);
        const resC = Number(newRisk.residualConsequence || 2);

        const record: RiskRecord = {
            id: String(Date.now()),
            refNo: `HIRA-00${risks.length + 1}`,
            activity: newRisk.activity || '',
            hazard: newRisk.hazard || '',
            task: newRisk.task || '',
            riskType: newRisk.riskType as any,
            activityType: newRisk.activityType as any,
            riskOwner: newRisk.riskOwner || 'All staff',
            initialLikelihood: initL,
            initialConsequence: initC,
            initialRiskValue: initL * initC,
            existingControls: newRisk.existingControls || 'None',
            recommendedControls: newRisk.recommendedControls || '',
            residualLikelihood: resL,
            residualConsequence: resC,
            residualRiskValue: resL * resC
        };

        setRisks([record, ...risks]);
        setIsModalOpen(false);
    };

    const filteredRisks = risks.filter(r => {
        const matchesSearch = r.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.hazard.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedRiskType === 'ALL' || r.riskType === selectedRiskType;
        return matchesSearch && matchesType;
    });

    return (
        <DashboardLayout
            title="Hazard Identification & Risk Assessment (HIRA)"
            description="Manage office ergonomics and safety hazard assessments. Proactively identify risks and plan control measures."
            breadcrumbs={[
                { label: 'OHS Dashboard', path: '/ohs/dashboard' },
                { label: 'HIRA' }
            ]}
        >
            <div className="flex flex-col gap-6">
                
                {/* Actions & Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
                    <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by activity or hazard..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#884616] transition"
                            />
                        </div>
                        <select
                            value={selectedRiskType}
                            onChange={(e) => setSelectedRiskType(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#884616] cursor-pointer"
                        >
                            <option value="ALL">All Types</option>
                            <option value="Ergonomic">Ergonomic</option>
                            <option value="Safety">Safety</option>
                            <option value="Health">Health</option>
                            <option value="Environmental">Environmental</option>
                        </select>
                    </div>

                    <button
                        onClick={handleOpenModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brown text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-sm text-xs w-full sm:w-auto shrink-0 active:scale-[0.98]"
                    >
                        <Plus size={16} />
                        Raise Risk
                    </button>
                </div>

                {/* Risks Table Card */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Shield size={16} className="text-gold" />
                            <span>Risk Register</span>
                        </h3>
                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                            {filteredRisks.length} Assessments
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="px-5 py-3.5">Ref No</th>
                                    <th className="px-5 py-3.5 max-w-[200px]">Activity & Task</th>
                                    <th className="px-5 py-3.5">Hazard Description</th>
                                    <th className="px-5 py-3.5">Classification</th>
                                    <th className="px-5 py-3.5 text-center">Initial Risk</th>
                                    <th className="px-5 py-3.5">Recommended Controls</th>
                                    <th className="px-5 py-3.5 text-center">Residual Risk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                                {filteredRisks.map((risk) => (
                                    <tr key={risk.id} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="px-5 py-4 font-mono font-bold text-gray-600">
                                            {risk.refNo}
                                        </td>
                                        <td className="px-5 py-4 max-w-[200px] text-gray-800">
                                            <span className="font-bold leading-normal block">{risk.activity}</span>
                                            <span className="text-[10px] text-gray-400 mt-1 block">Task: {risk.task}</span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 leading-normal max-w-[180px]">
                                            {risk.hazard}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-1">
                                                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[9px] font-bold">
                                                    {risk.riskType}
                                                </span>
                                                <span className="block text-[9px] text-gray-400">
                                                    {risk.activityType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold ${getRiskLevelColor(risk.initialRiskValue)}`}>
                                                {getRiskLabel(risk.initialRiskValue)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 leading-relaxed max-w-[200px]">
                                            {risk.recommendedControls}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold ${getRiskLevelColor(risk.residualRiskValue)}`}>
                                                {getRiskLabel(risk.residualRiskValue)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Risk Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-gray-150 overflow-hidden animate-fadeIn">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <AlertTriangle className="text-gold" size={16} />
                                    <span>Raise New Workplace Risk</span>
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Risk Type *</label>
                                        <select
                                            value={newRisk.riskType}
                                            onChange={(e) => setNewRisk({ ...newRisk, riskType: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                        >
                                            <option value="Ergonomic">Ergonomic</option>
                                            <option value="Safety">Safety</option>
                                            <option value="Health">Health</option>
                                            <option value="Environmental">Environmental</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Activity Type *</label>
                                        <select
                                            value={newRisk.activityType}
                                            onChange={(e) => setNewRisk({ ...newRisk, activityType: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                        >
                                            <option value="Routine">Routine</option>
                                            <option value="Non-routine">Non-routine</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Workplace Activity *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Extended data entry tasks..."
                                        value={newRisk.activity}
                                        onChange={(e) => setNewRisk({ ...newRisk, activity: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Specific Task *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Keyboard input, physical lifting..."
                                        value={newRisk.task}
                                        onChange={(e) => setNewRisk({ ...newRisk, task: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Hazard Identified *</label>
                                    <textarea
                                        placeholder="Describe the repetitive movement, heavy loads, awkward postures..."
                                        value={newRisk.hazard}
                                        onChange={(e) => setNewRisk({ ...newRisk, hazard: e.target.value })}
                                        rows={2}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Risk Owner</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. All staff, facilities..."
                                            value={newRisk.riskOwner}
                                            onChange={(e) => setNewRisk({ ...newRisk, riskOwner: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Existing Controls</label>
                                        <input
                                            type="text"
                                            value={newRisk.existingControls}
                                            onChange={(e) => setNewRisk({ ...newRisk, existingControls: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Risk Assessment (Initial vs Residual)</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-600 mb-1">Init. Likelihood</label>
                                            <select
                                                value={newRisk.initialLikelihood}
                                                onChange={(e) => setNewRisk({ ...newRisk, initialLikelihood: Number(e.target.value) })}
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                                            >
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-600 mb-1">Init. Consequence</label>
                                            <select
                                                value={newRisk.initialConsequence}
                                                onChange={(e) => setNewRisk({ ...newRisk, initialConsequence: Number(e.target.value) })}
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                                            >
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-600 mb-1">Res. Likelihood</label>
                                            <select
                                                value={newRisk.residualLikelihood}
                                                onChange={(e) => setNewRisk({ ...newRisk, residualLikelihood: Number(e.target.value) })}
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                                            >
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-600 mb-1">Res. Consequence</label>
                                            <select
                                                value={newRisk.residualConsequence}
                                                onChange={(e) => setNewRisk({ ...newRisk, residualConsequence: Number(e.target.value) })}
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                                            >
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Recommended Additional Control Measures *</label>
                                    <textarea
                                        placeholder="List specific actions, ergonomic chair deployments, training or rotations..."
                                        value={newRisk.recommendedControls}
                                        onChange={(e) => setNewRisk({ ...newRisk, recommendedControls: e.target.value })}
                                        rows={2}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                    />
                                </div>

                                <div className="border-t border-gray-150 pt-4 flex justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-xs transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[#BB8F53] hover:bg-[#A1743E] text-white rounded-xl font-bold text-xs transition shadow-sm"
                                    >
                                        Confirm & Save Risk
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OHSHira;
