import React, { useState, useEffect } from 'react';
import SeverityOption from './SeverityOption';
import Checkbox from '../common/Checkbox';
import { Select } from '../common/Select';
import MapSelector from '../common/MapSelector';
import DatePicker from '../common/DatePicker';
import TimePicker from '../common/TimePicker';
import locationService, { type Province, type Building } from '../../services/location.service';
import { IMMEDIATE_ACTIONS_BY_CATEGORY } from '../../data/constants';



const severityLevels = [
    { id: 'critical', label: 'Critical', color: 'red' },
    { id: 'high', label: 'High', color: 'orange' },
    { id: 'medium', label: 'Medium', color: 'yellow' },
    { id: 'low', label: 'Low', color: 'gold' },
];

const genericImmediateActions = [
    { id: 'cordoned', label: 'Area cordoned off/secured' },
    { id: 'isolated', label: 'Power/utilities isolated' },
    { id: 'evacuated', label: 'Personnel evacuated' },
    { id: 'first_aid', label: 'First aid administered' },
    { id: 'emergency', label: 'Emergency services contacted' },
    { id: 'management', label: 'Management notified' },
    { id: 'other', label: 'Other' },
];

interface StepBasicInfoProps {
    data: any;
    onChange: (data: any) => void;
    onBack: () => void;
    onNext: () => void;
    onSaveDraft?: (data?: any) => void;
    onDiscard?: () => void;
    categoryName?: string;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ data, onChange, onBack, onNext, onSaveDraft, onDiscard, categoryName }) => {
    // ... (state hooks)

    const handleSaveDraftClick = () => {
        if (onSaveDraft) {
            const selectedProvince = provinces.find(p => p.id === province);
            const selectedBuilding = buildings.find(b => b.id === building);

            onSaveDraft({
                severityLevel: selectedSeverity,
                severity: selectedSeverity,
                occurredAt,
                provinceId: province,
                provinceName: selectedProvince?.name,
                buildingId: building,
                buildingName: selectedBuilding?.name,
                location: locationDesc,
                latitude: latitude,
                longitude: longitude,
                immediateActions: selectedActions,
                otherActions: otherActions,
            });
        }
    };

    const [selectedSeverity, setSelectedSeverity] = useState(data.severityLevel || 'medium');
    const [occurredAt, setOccurredAt] = useState(data.occurredAt || '');

    // New state for location details
    const [province, setProvince] = useState(data.provinceId || '');
    const [building, setBuilding] = useState(data.buildingId || '');
    const [locationDesc, setLocationDesc] = useState(data.location || '');
    const [latitude, setLatitude] = useState(data.latitude || '');
    const [longitude, setLongitude] = useState(data.longitude || '');

    // API data state
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loadingBuildings, setLoadingBuildings] = useState(false);

    // Actions state
    const [selectedActions, setSelectedActions] = useState<string[]>(data.immediateActions || []);
    const [otherActions, setOtherActions] = useState(data.otherActions || '');

    const currentCategoryActions = IMMEDIATE_ACTIONS_BY_CATEGORY[data.categoryId || 'others'] || genericImmediateActions;

    // Helpers for Date/Time
    const getDatePart = () => occurredAt ? occurredAt.split('T')[0] : '';
    const getTimePart = () => occurredAt && occurredAt.includes('T') ? occurredAt.split('T')[1].substring(0, 5) : '';

    const isSecurityBreach = categoryName === 'Security Breach';

    // Fetch provinces on component mount
    useEffect(() => {
        locationService.getProvinces()
            .then(setProvinces)
            .catch(err => console.error('Error fetching provinces:', err));
    }, []);

    // Fetch buildings when province changes
    useEffect(() => {
        if (province) {
            setLoadingBuildings(true);
            locationService.getBuildingsByProvince(province)
                .then(setBuildings)
                .catch(err => console.error('Error fetching buildings:', err))
                .finally(() => setLoadingBuildings(false));
        } else {
            setBuildings([]);
            setBuilding('');
        }
    }, [province]);

    // Sync state with data prop
    useEffect(() => {
        setSelectedSeverity(data.severityLevel?.toLowerCase() || 'medium');
        setOccurredAt(data.occurredAt || '');
        setProvince(data.provinceId || '');
        setBuilding(data.buildingId || '');
        setLocationDesc(data.location || '');
        setLatitude(data.latitude || '');
        setLongitude(data.longitude || '');
        setSelectedActions(data.immediateActions || []);
        setOtherActions(data.otherActions || '');
    }, [data]);

    const handleDateChange = (date: string) => {
        const time = getTimePart() || '00:00';
        setOccurredAt(`${date}T${time}`);
    };

    const handleTimeChange = (time: string) => {
        const date = getDatePart() || new Date().toISOString().split('T')[0];
        setOccurredAt(`${date}T${time}`);
    };

    const toggleAction = (actionId: string) => {
        setSelectedActions(prev =>
            prev.includes(actionId)
                ? prev.filter(a => a !== actionId)
                : [...prev, actionId]
        );
    };

    const handleNext = () => {
        // Find the selected province and building names
        const selectedProvince = provinces.find(p => p.id === province);
        const selectedBuilding = buildings.find(b => b.id === building);

        onChange({
            severityLevel: selectedSeverity,
            severity: selectedSeverity,
            occurredAt,
            provinceId: province,
            provinceName: selectedProvince?.name,
            buildingId: building,
            buildingName: selectedBuilding?.name,
            location: locationDesc,
            latitude: latitude,
            longitude: longitude,
            immediateActions: selectedActions,
            otherActions: otherActions,
        });
        onNext();
    };

    const isFormValid = () => {
        const dateValid = !!occurredAt;
        const locationValid = !!province && !!building;
        const severityValid = !!selectedSeverity;

        if (isSecurityBreach) {
            return dateValid && locationValid && severityValid;
        }

        return dateValid;
    };

    return (
        <div className="flex flex-col animate-fadeIn">
            {/* Main Content Area - Full Width */}
            <div className="flex-1 w-full max-w-5xl mx-auto">
                <div className="mb-4">
                    <span className="text-[10px] font-bold text-gray-400 mb-0.5 block">Step 2/5</span>
                    <h3 className="text-lg font-bold text-gray-800 mb-0.5">Basic Info</h3>
                    <p className="text-xs text-gray-400 font-medium">Date, Location, Severity</p>
                    <div className="h-[1px] bg-gray-100 w-full mt-3" />
                </div>

                <div className="space-y-4">
                    {/* Time & Date Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1">Time of incident *</label>
                            <TimePicker
                                value={getTimePart()}
                                onChange={handleTimeChange}
                                placeholder="Select time"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1">Date of incident *</label>
                            <DatePicker
                                value={getDatePart()}
                                onChange={handleDateChange}
                                placeholder="Select date"
                            />
                        </div>
                    </div>


                    {/* Location */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">Location {isSecurityBreach ? '*' : ''}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                            <Select
                                label="Province"
                                value={province}
                                onChange={(value) => {
                                    setProvince(value);
                                    setBuilding(''); // Reset building when province changes
                                }}
                                options={provinces.map(p => ({ value: p.id, label: p.name }))}
                                placeholder="Select province"
                            />
                            <Select
                                label="Building"
                                value={building}
                                onChange={setBuilding}
                                options={buildings.map(b => ({ value: b.id, label: b.name }))}
                                placeholder={loadingBuildings ? "Loading buildings..." : "Select building"}
                                disabled={!province || loadingBuildings}
                            />
                        </div>
                        <input
                            type="text"
                            value={locationDesc}
                            onChange={(e) => setLocationDesc(e.target.value)}
                            placeholder={isSecurityBreach ? "Floor and Area (Optional)" : "Floor, room, number, area description"}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BB8F53] focus:border-transparent outline-none transition-all mb-3 text-xs font-medium"
                        />

                        {/* Interactive Map */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-900">Pinpoint Exact Location</label>
                            <MapSelector
                                latitude={latitude}
                                longitude={longitude}
                                onChange={(lat, lng) => {
                                    setLatitude(lat.toString());
                                    setLongitude(lng.toString());
                                }}
                            />
                        </div>
                    </div>

                    {/* Severity Level */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2">Severity Level *</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {severityLevels.map((level) => (
                                <SeverityOption
                                    key={level.id}
                                    label={level.label}
                                    isSelected={selectedSeverity === level.id}
                                    onClick={() => setSelectedSeverity(level.id)}
                                    activeColor={level.color}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Immediate Action Taken - Hide for Security Breach */}
                    {!isSecurityBreach && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-1">Immediate Action Taken</label>
                                <div className="mb-2">
                                    <span className="text-xs text-gray-400 font-medium">Select any immediate action that have been taken</span>
                                </div>
                                <hr className="border-gray-200 my-2" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-xs">
                                    {currentCategoryActions.map((action) => (
                                        <Checkbox
                                            key={action.id}
                                            label={action.label}
                                            checked={selectedActions.includes(action.id)}
                                            onChange={() => toggleAction(action.id)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Other Actions - Always visible, enabled only if 'other' is selected */}
                            <div className="mt-3 animate-fadeIn">
                                <label className={`block text-xs font-bold text-gray-900 mb-1 ${!selectedActions.includes('other') ? 'text-gray-400' : ''}`}>
                                    Other Actions Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={otherActions}
                                    onChange={(e) => setOtherActions(e.target.value)}
                                    placeholder="Please describe the other immediate actions taken..."
                                    disabled={!selectedActions.includes('other')}
                                    className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BB8F53] focus:border-transparent outline-none transition-all resize-none text-xs ${!selectedActions.includes('other') ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                />
                            </div>
                        </>
                    )}

                    {/* Attachments UI in Step 2 is unused, removed code to avoid confusion as Step 5 handles it */}
                </div>

                {/* Footer buttons matching the image */}
                <div className="flex items-center justify-between mt-6 pt-3 border-t border-gray-100">
                    <div className="flex gap-4">
                        <button
                            onClick={handleSaveDraftClick}
                            className="text-gray-600 font-bold hover:text-gray-900 transition-colors text-xs"
                        >
                            Save as Draft
                        </button>
                        <button
                            onClick={onDiscard}
                            className="text-gray-600 font-bold hover:text-gray-900 transition-colors text-xs"
                        >
                            Discard
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onBack}
                            className="px-5 py-1.5 bg-light-gold rounded-lg font-bold text-xs"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!isFormValid()}
                            className="px-6 py-1.5 bg-gold text-white rounded-lg font-bold shadow-sm transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 text-xs"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepBasicInfo;
