import { useMemo } from 'react';
import { useIncidents } from '../../hooks/useIncidents';
import type { Case } from '../../services/cases.service';

/**
 * Shared data layer for the Chief Director (DDG / Executive Management) screens.
 *
 * Pulls the maximum amount of real data available from the incidents API and
 * derives executive aggregates from it. Every page uses `hasData` to decide
 * whether to render these live values or fall back to its illustrative sample
 * data (used when the database has no incidents, or on first load).
 *
 * Fields with no backing column in the schema (compliance %, targets, budgets,
 * BRS-4.3 infrastructure framing) are computed heuristically or left to the
 * page-level sample data.
 */

export const PROVINCE_LIST = [
    'Gauteng',
    'Western Cape',
    'KwaZulu-Natal',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Eastern Cape',
    'Northern Cape',
    'National Office',
];

// Illustrative compliance targets per province (no schema source).
export const PROVINCE_TARGETS: Record<string, number> = {
    'Gauteng': 80,
    'Western Cape': 85,
    'KwaZulu-Natal': 80,
    'Free State': 75,
    'Limpopo': 75,
    'Mpumalanga': 80,
    'North West': 80,
    'Eastern Cape': 75,
    'Northern Cape': 75,
    'National Office': 85,
};

export type ComplianceStatus = 'Compliant' | 'At Risk' | 'Non-Compliant';

export interface ProvinceMetric {
    name: string;
    incidents: number;
    open: number;
    closed: number;
    pct: number;
    target: number;
    status: ComplianceStatus;
}

export interface TrendMonth {
    month: string;
    safety: number;
    health: number;
    environmental: number;
    other: number;
}

export interface CriticalAlert {
    type: string;
    title: string;
    time: string;
    tone: 'red' | 'amber' | 'gray';
}

const isOpen = (status?: string) => !['CLOSED', 'RESOLVED'].includes((status || '').toUpperCase());
const isClosed = (status?: string) => ['CLOSED', 'RESOLVED'].includes((status || '').toUpperCase());
const isEscalatedCase = (c: Case) => {
    const s = (c.status || '').toUpperCase();
    return c.isEscalated || s.includes('RECOMMENDATION') || s.includes('DIRECTOR') || s.includes('ESCALATED');
};

const relativeTime = (iso?: string) => {
    if (!iso) return '';
    const diffMs = Date.now() - new Date(iso).getTime();
    const hrs = Math.floor(diffMs / 3_600_000);
    if (hrs < 1) return 'just now';
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const complianceStatus = (pct: number, target: number): ComplianceStatus => {
    if (pct >= target) return 'Compliant';
    if (pct >= target - 10) return 'At Risk';
    return 'Non-Compliant';
};

const titleCase = (s?: string) =>
    (s || '').split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

export function useExecutiveData() {
    const { data, isLoading } = useIncidents({ take: 1000 });
    const cases: Case[] = data?.data || [];
    const hasData = cases.length > 0;

    const metrics = useMemo(() => {
        const year = new Date().getFullYear();
        const ytd = cases.filter(c => new Date(c.createdAt).getFullYear() === year);
        const closed = cases.filter(c => isClosed(c.status)).length;
        return {
            totalYtd: ytd.length || cases.length,
            open: cases.filter(c => isOpen(c.status)).length,
            escalated: cases.filter(isEscalatedCase).length,
            // Heuristic "compliance" = share of incidents brought to closure.
            nationalCompliance: cases.length ? Math.round((closed / cases.length) * 100) : 0,
        };
    }, [cases]);

    const byProvince = useMemo<ProvinceMetric[]>(() => {
        return PROVINCE_LIST.map(name => {
            const list = cases.filter(c => c.building?.province?.name === name);
            const incidents = list.length;
            const closed = list.filter(c => isClosed(c.status)).length;
            const open = list.filter(c => isOpen(c.status)).length;
            const target = PROVINCE_TARGETS[name] ?? 80;
            const pct = incidents ? Math.round((closed / incidents) * 100) : 0;
            return { name, incidents, open, closed, pct, target, status: complianceStatus(pct, target) };
        });
    }, [cases]);

    const trends = useMemo<TrendMonth[]>(() => {
        const now = new Date();
        const months: TrendMonth[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: d.toLocaleString('en-US', { month: 'short' }),
                safety: 0, health: 0, environmental: 0, other: 0,
            });
        }
        const firstMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        cases.forEach(c => {
            const created = new Date(c.createdAt);
            if (created < firstMonth) return;
            const idx = (created.getFullYear() - firstMonth.getFullYear()) * 12 + (created.getMonth() - firstMonth.getMonth());
            if (idx < 0 || idx > 5) return;
            const cat = (c.category || c.type || '').toLowerCase();
            if (cat.includes('safety')) months[idx].safety += 1;
            else if (cat.includes('health')) months[idx].health += 1;
            else if (cat.includes('environ')) months[idx].environmental += 1;
            else months[idx].other += 1;
        });
        return months;
    }, [cases]);

    const criticalAlerts = useMemo<CriticalAlert[]>(() => {
        return [...cases]
            .filter(c => ['critical', 'high'].includes((c.severity || '').toLowerCase()) || isEscalatedCase(c))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4)
            .map(c => {
                const sev = (c.severity || '').toLowerCase();
                const prov = c.building?.province?.name || 'Unknown';
                return {
                    type: isEscalatedCase(c) ? 'Escalation' : titleCase(c.category || c.type),
                    title: `${titleCase(c.category || c.type)} — ${prov}`,
                    time: relativeTime(c.createdAt),
                    tone: sev === 'critical' ? 'red' : sev === 'high' ? 'amber' : 'gray',
                } as CriticalAlert;
            });
    }, [cases]);

    const escalatedCases = useMemo(() => {
        return [...cases]
            .filter(isEscalatedCase)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [cases]);

    return { isLoading, hasData, cases, metrics, byProvince, trends, criticalAlerts, escalatedCases };
}
