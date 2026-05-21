import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    placeholder?: string;
    label?: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, placeholder = 'Select time' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hourListRef = useRef<HTMLDivElement>(null);
    const minuteListRef = useRef<HTMLDivElement>(null);

    const currentHour = value ? value.split(':')[0] : '';
    const currentMinute = value ? value.split(':')[1] : '';

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Scroll selected into view when opening
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                if (hourListRef.current && currentHour) {
                    const el = hourListRef.current.querySelector(`[data-hour="${currentHour}"]`);
                    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
                if (minuteListRef.current && currentMinute) {
                    const el = minuteListRef.current.querySelector(`[data-minute="${currentMinute}"]`);
                    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }, 50);
        }
    }, [open]);

    const handleHourSelect = (h: string) => {
        const m = currentMinute || '00';
        onChange(`${h}:${m}`);
    };

    const handleMinuteSelect = (m: string) => {
        const h = currentHour || '00';
        onChange(`${h}:${m}`);
    };

    const formatDisplay = () => {
        if (!value) return '';
        const h = parseInt(currentHour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${pad(h12)}:${currentMinute} ${ampm}`;
    };

    const displayValue = formatDisplay();

    const setNow = () => {
        const now = new Date();
        const h = pad(now.getHours());
        // Round to nearest 5
        const roundedMin = Math.round(now.getMinutes() / 5) * 5;
        const m = pad(roundedMin >= 60 ? 0 : roundedMin);
        onChange(`${h}:${m}`);
        setOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all text-left cursor-pointer
                    ${open ? 'border-dark-green ring-2 ring-dark-green/20' : 'border-gray-200 hover:border-green/50'}`}
            >
                <Clock size={16} className="text-dark-green shrink-0" />
                <span className={displayValue ? 'text-gray-700 font-medium text-xs' : 'text-gray-400 text-xs font-medium'}>
                    {displayValue || placeholder}
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-2 w-[240px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(14,77,65,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 bg-subtle-green border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-dark-green uppercase tracking-wider">Select Time</span>
                            <span className="text-sm font-bold text-dark-green">
                                {value ? displayValue : '--:--'}
                            </span>
                        </div>
                    </div>

                    {/* Columns */}
                    <div className="flex divide-x divide-gray-100">
                        {/* Hours */}
                        <div className="flex-1 flex flex-col">
                            <div className="text-[10px] font-bold text-dark-grey/50 uppercase tracking-widest text-center py-2 bg-gray-50/50">
                                Hour
                            </div>
                            <div
                                ref={hourListRef}
                                className="h-[200px] overflow-y-auto custom-scrollbar"
                            >
                                {HOURS.map(h => {
                                    const isActive = h === currentHour;
                                    return (
                                        <button
                                            key={h}
                                            type="button"
                                            data-hour={h}
                                            onClick={() => handleHourSelect(h)}
                                            className={`w-full py-2.5 text-center text-sm font-semibold transition-all duration-150
                                                ${isActive
                                                    ? 'bg-dark-green text-white'
                                                    : 'text-gray-600 hover:bg-subtle-green hover:text-dark-green'
                                                }`}
                                        >
                                            {h}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Minutes */}
                        <div className="flex-1 flex flex-col">
                            <div className="text-[10px] font-bold text-dark-grey/50 uppercase tracking-widest text-center py-2 bg-gray-50/50">
                                Min
                            </div>
                            <div
                                ref={minuteListRef}
                                className="h-[200px] overflow-y-auto custom-scrollbar"
                            >
                                {MINUTES.map(m => {
                                    const isActive = m === currentMinute;
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            data-minute={m}
                                            onClick={() => handleMinuteSelect(m)}
                                            className={`w-full py-2.5 text-center text-sm font-semibold transition-all duration-150
                                                ${isActive
                                                    ? 'bg-dark-green text-white'
                                                    : 'text-gray-600 hover:bg-subtle-green hover:text-dark-green'
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
                        <button
                            type="button"
                            onClick={setNow}
                            className="text-xs font-bold text-green hover:text-dark-green transition-colors px-3 py-1 rounded-lg hover:bg-subtle-green"
                        >
                            Now
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-xs font-bold text-white bg-dark-green hover:bg-dark-green/90 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
