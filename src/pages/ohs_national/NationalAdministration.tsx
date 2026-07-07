import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useProvinces, useBuildings } from '../../hooks/useOrganization';
import { useAuthStore } from '../../store/auth.store';
import { Loader2 } from 'lucide-react';
import authService from '../../services/auth.service';

// ---------- Types ----------
interface ProvinceRow {
    id: string;
    name: string;
    offices: string;
    practitioner: string | null;
    practitionerAssigned: boolean;
}

interface UserRow {
    name: string;
    username: string;
    role: string;
    provinceOffice: string;
    isCurrent: boolean;
}

interface FirstAiderRow {
    name: string;
    province: string;
    office: string;
    active: boolean;
}

interface NotificationRule {
    title: string;
    description: string;
    enabled: boolean;
}

// ---------- Static Data ----------
const DEMO_USERS: UserRow[] = [
    { name: 'John Doe', username: 'john.doe', role: 'Employee', provinceOffice: 'Gauteng · Pretoria Head Office', isCurrent: false },
    { name: 'Mike Tau', username: 'mike.tau', role: 'Employee', provinceOffice: 'Gauteng · Johannesburg Office', isCurrent: false },
    { name: 'Jane Smith', username: 'jane.smith', role: 'Employee', provinceOffice: 'Gauteng · Pretoria Head Office', isCurrent: false },
    { name: 'Peter Mokoena', username: 'peter.mokoena', role: 'Employee', provinceOffice: 'Gauteng · Johannesburg Office', isCurrent: false },
    { name: 'Sarah Mokae', username: 'sarah.mokae', role: 'Supervisor', provinceOffice: 'Gauteng · Pretoria Head Office', isCurrent: false },
    { name: 'Thandi Nkosi', username: 'first.aid.gauteng', role: 'First Aider', provinceOffice: 'Gauteng · Pretoria Head Office', isCurrent: false },
    { name: 'David Khumalo', username: 'first.aid.jhb', role: 'First Aider', provinceOffice: 'Gauteng · Johannesburg Office', isCurrent: false },
    { name: 'Lerato Dlamini', username: 'ohs.gauteng', role: 'OHS Practitioner', provinceOffice: 'Gauteng', isCurrent: false },
    { name: 'Naledi van Wyk', username: 'hr.benefits', role: 'HR Benefits', provinceOffice: '—', isCurrent: false },
    { name: 'Sipho Ndlovu', username: 'asd.ohs', role: 'ASD OHS (National)', provinceOffice: '—', isCurrent: true },
];

const FIRST_AIDERS: FirstAiderRow[] = [
    { name: 'Thandi Nkosi', province: 'Gauteng', office: 'Pretoria Head Office', active: true },
    { name: 'David Khumalo', province: 'Gauteng', office: 'Johannesburg Office', active: true },
];

const INITIAL_RULES: NotificationRule[] = [
    { title: 'Notify First Aider, OHS Practitioner & ASD on every new incident', description: 'Routed by province and office.', enabled: true },
    { title: 'Auto-escalate after 4 hours without acceptance', description: 'Escalation routes to OHS Practitioner + ASD OHS National.', enabled: true },
    { title: 'Notify HR Benefits on referral for WCL processing', description: 'Triggered when a first aider marks a treatment as "Referred".', enabled: true },
    { title: 'National Office fallback for provinces without practitioner', description: 'Currently Eastern Cape, Northern Cape.', enabled: true },
];

const PROVINCE_OFFICES: Record<string, string> = {
    'Gauteng': 'Pretoria Head Office, Johannesburg Office, Centurion Branch',
    'Western Cape': 'Cape Town Regional Office, George Branch',
    'KwaZulu-Natal': 'Durban Regional Office, Pietermaritzburg Branch',
    'Eastern Cape': 'East London Office, Bhisho Office',
    'Northern Cape': 'Kimberley Office',
    'Free State': 'Bloemfontein Office',
    'Mpumalanga': 'Mbombela Office',
    'Limpopo': 'Polokwane Office',
    'North West': 'Mahikeng Office',
};

const PROVINCE_PRACTITIONERS: Record<string, string | null> = {
    'Gauteng': 'Lerato Dlamini',
    'Western Cape': null,
    'KwaZulu-Natal': null,
    'Eastern Cape': null,
    'Northern Cape': null,
    'Free State': null,
    'Mpumalanga': null,
    'Limpopo': null,
    'North West': null,
};

const NationalAdministration: React.FC = () => {
    const { user } = useAuthStore();
    const { data: provinces = [], isLoading: loadingProvinces } = useProvinces();
    const [aiderStates, setAiderStates] = useState<boolean[]>(FIRST_AIDERS.map(a => a.active));
    const [ruleStates, setRuleStates] = useState<boolean[]>(INITIAL_RULES.map(r => r.enabled));
    const [loginLoading, setLoginLoading] = useState<string | null>(null);

    const displayProvinces = provinces.filter(p => p.name !== 'National Office');

    const provinceRows: ProvinceRow[] = displayProvinces.map(p => ({
        id: p.id,
        name: p.name,
        offices: PROVINCE_OFFICES[p.name] || '—',
        practitioner: PROVINCE_PRACTITIONERS[p.name] || null,
        practitionerAssigned: !!PROVINCE_PRACTITIONERS[p.name],
    }));

    const toggleAider = (idx: number) => {
        setAiderStates(prev => prev.map((v, i) => i === idx ? !v : v));
    };

    const toggleRule = (idx: number) => {
        setRuleStates(prev => prev.map((v, i) => i === idx ? !v : v));
    };

    const handleLoginAs = async (username: string) => {
        setLoginLoading(username);
        try {
            // Try SSO login with email convention
            const email = `${username.replace(/\./g, '.')}@dlrrd.gov.za`;
            await authService.login({ email, password: 'unused' });
            window.location.href = '/';
        } catch {
            // Fallback: just reload
            setLoginLoading(null);
        }
    };

    const isLoading = loadingProvinces;

    return (
        <DashboardLayout
            title="Administration"
            description="DLRRD Facilities Management Services"
        >
            <div className="flex flex-col gap-6">
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-7 h-7 text-gold animate-spin" />
                        <span className="ml-3 text-gray-500 text-sm">Loading...</span>
                    </div>
                )}

                {!isLoading && (
                    <>
                        {/* Section 1: Provinces & Offices */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h3 className="text-base font-bold text-gray-800 mb-1">Provinces & offices</h3>
                            <p className="text-xs text-gray-400 mb-4">Provinces without an assigned OHS Practitioner are serviced by National.</p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Province</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Offices</th>
                                            <th className="text-right py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">OHS Practitioner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {provinceRows.map((row) => (
                                            <tr key={row.id} className="border-b border-gray-50 hover:bg-subtle-gold/20 transition-colors">
                                                <td className="py-3 px-3">
                                                    <span className="text-sm font-bold text-gray-800">{row.name}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-xs text-gray-500">{row.offices}</span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    {row.practitionerAssigned ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                            {row.practitioner}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                                            Unassigned — National
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 2: Users & Roles */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h3 className="text-base font-bold text-gray-800 mb-1">Users & roles</h3>
                            <p className="text-xs text-gray-400 mb-4">Click "Login as" to instantly switch into another role for demonstration.</p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Username</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Province / Office</th>
                                            <th className="text-right py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DEMO_USERS.map((u, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-subtle-gold/20 transition-colors">
                                                <td className="py-3 px-3">
                                                    <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <code className="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">{u.username}</code>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-xs font-medium text-gray-600">{u.role}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-xs text-gray-500">{u.provinceOffice}</span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    {u.isCurrent ? (
                                                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500">Current</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleLoginAs(u.username)}
                                                            disabled={loginLoading === u.username}
                                                            className="text-[11px] font-bold text-brown hover:text-gold transition-colors disabled:opacity-50"
                                                        >
                                                            {loginLoading === u.username ? 'Switching...' : 'Login as'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: First Aider Register */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h3 className="text-base font-bold text-gray-800 mb-4">First Aider register</h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Province</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Office</th>
                                            <th className="text-right py-2.5 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Active</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {FIRST_AIDERS.map((aider, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td className="py-3 px-3">
                                                    <span className="text-sm font-semibold text-gray-800">{aider.name}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-xs text-gray-600">{aider.province}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-xs text-gray-600">{aider.office}</span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        onClick={() => toggleAider(i)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${aiderStates[i] ? 'bg-brown' : 'bg-gray-300'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${aiderStates[i] ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 4: Notification Rules */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h3 className="text-base font-bold text-gray-800 mb-1">Notification rules</h3>
                            <p className="text-xs text-gray-400 mb-4">Auto-routing and escalation policies.</p>

                            <div className="space-y-0">
                                {INITIAL_RULES.map((rule, i) => (
                                    <div key={i} className="flex items-center justify-between py-3.5 px-4 border-b border-gray-50 last:border-0 hover:bg-subtle-gold/20 rounded-lg transition-colors">
                                        <div className="flex-1 pr-4">
                                            <p className="text-sm font-semibold text-gray-800">{rule.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{rule.description}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleRule(i)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0 ${ruleStates[i] ? 'bg-brown' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${ruleStates[i] ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default NationalAdministration;
