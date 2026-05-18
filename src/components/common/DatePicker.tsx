import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    label?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = 'Select date' }) => {
    const today = new Date();
    const parsed = value ? new Date(value + 'T00:00:00') : null;

    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed ? parsed.getMonth() : today.getMonth());
    const [showYearGrid, setShowYearGrid] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setShowYearGrid(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sync view when value changes externally
    useEffect(() => {
        if (parsed) {
            setViewYear(parsed.getFullYear());
            setViewMonth(parsed.getMonth());
        }
    }, [value]);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    // Previous month trailing days
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const handleSelect = (day: number) => {
        const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
        onChange(dateStr);
        setOpen(false);
        setShowYearGrid(false);
    };

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const isToday = (day: number) =>
        day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

    const isSelected = (day: number) =>
        parsed !== null && day === parsed.getDate() && viewMonth === parsed.getMonth() && viewYear === parsed.getFullYear();

    const displayValue = parsed
        ? `${pad(parsed.getDate())} ${MONTHS[parsed.getMonth()].slice(0, 3)} ${parsed.getFullYear()}`
        : '';

    // Year grid
    const yearRangeStart = Math.floor(viewYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

    // Build calendar cells
    const cells: { day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        cells.push({ day: prevMonthDays - firstDayOfWeek + 1 + i, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, inMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
        cells.push({ day: i, inMonth: false });
    }

    return (
        <div className="relative" ref={ref}>
            {/* Trigger Input */}
            <button
                type="button"
                onClick={() => { setOpen(!open); setShowYearGrid(false); }}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all text-left cursor-pointer
                    ${open ? 'border-dark-green ring-2 ring-dark-green/20' : 'border-gray-200 hover:border-green/50'}`}
            >
                <Calendar size={16} className="text-dark-green shrink-0" />
                <span className={displayValue ? 'text-gray-700 font-medium text-xs' : 'text-gray-400 text-xs font-medium'}>
                    {displayValue || placeholder}
                </span>
            </button>

            {/* Calendar Popup */}
            {open && (
                <div className="absolute z-50 mt-2 w-[320px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(14,77,65,0.15)] border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {!showYearGrid ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-light-green transition-colors"
                                >
                                    <ChevronLeft size={18} className="text-dark-green" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowYearGrid(true)}
                                    className="text-sm font-bold text-dark-green hover:bg-light-green px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    {MONTHS[viewMonth]} {viewYear}
                                </button>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-light-green transition-colors"
                                >
                                    <ChevronRight size={18} className="text-dark-green" />
                                </button>
                            </div>

                            {/* Day headers */}
                            <div className="grid grid-cols-7 mb-1">
                                {DAYS.map(d => (
                                    <div key={d} className="text-center text-[11px] font-bold text-dark-grey/60 uppercase tracking-wider py-1">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Day grid */}
                            <div className="grid grid-cols-7">
                                {cells.map((cell, idx) => {
                                    if (!cell.inMonth) {
                                        return (
                                            <div key={`out-${idx}`} className="w-full aspect-square flex items-center justify-center">
                                                <span className="text-[13px] text-gray-300">{cell.day}</span>
                                            </div>
                                        );
                                    }
                                    const selected = isSelected(cell.day);
                                    const todayMark = isToday(cell.day);
                                    return (
                                        <button
                                            key={`in-${cell.day}`}
                                            type="button"
                                            onClick={() => handleSelect(cell.day)}
                                            className={`w-full aspect-square flex items-center justify-center rounded-xl text-[13px] font-semibold transition-all duration-150
                                                ${selected
                                                    ? 'bg-dark-green text-white shadow-md shadow-dark-green/30 scale-105'
                                                    : todayMark
                                                        ? 'ring-2 ring-green text-dark-green font-bold hover:bg-light-green'
                                                        : 'text-gray-700 hover:bg-subtle-green hover:text-dark-green'
                                                }`}
                                        >
                                            {cell.day}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Today shortcut */}
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setViewMonth(today.getMonth());
                                        setViewYear(today.getFullYear());
                                        handleSelect(today.getDate());
                                    }}
                                    className="text-xs font-bold text-green hover:text-dark-green transition-colors px-4 py-1.5 rounded-lg hover:bg-subtle-green"
                                >
                                    Today
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Year Grid */
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={() => setViewYear(viewYear - 12)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-light-green transition-colors"
                                >
                                    <ChevronLeft size={18} className="text-dark-green" />
                                </button>
                                <span className="text-sm font-bold text-dark-green">
                                    {yearRangeStart} – {yearRangeStart + 11}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setViewYear(viewYear + 12)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-light-green transition-colors"
                                >
                                    <ChevronRight size={18} className="text-dark-green" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {years.map(y => (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => {
                                            setViewYear(y);
                                            setShowYearGrid(false);
                                        }}
                                        className={`py-3 rounded-xl text-sm font-semibold transition-all duration-150
                                            ${y === viewYear
                                                ? 'bg-dark-green text-white shadow-md shadow-dark-green/30'
                                                : y === today.getFullYear()
                                                    ? 'ring-2 ring-green text-dark-green hover:bg-light-green'
                                                    : 'text-gray-600 hover:bg-subtle-green hover:text-dark-green'
                                            }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DatePicker;
