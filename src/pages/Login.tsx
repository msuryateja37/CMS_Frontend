import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, isInitialized, user } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showSsoModal, setShowSsoModal] = useState(false);
    const [ssoProvince, setSsoProvince] = useState('Gauteng');
    const [ssoRole, setSsoRole] = useState('EMPLOYEE');

    useEffect(() => {
        if (['Eastern Cape', 'Northern Cape', 'North West'].includes(ssoProvince) && ssoRole === 'OHS_PRACTITIONER') {
            setSsoRole('EMPLOYEE');
        }
        if (ssoProvince !== 'National Office' && (ssoRole === 'OHS_NATIONAL_OFFICE' || ssoRole === 'CHIEF_DIRECTOR')) {
            setSsoRole('EMPLOYEE');
        }
    }, [ssoProvince, ssoRole]);

    const provincesList = [
        'Eastern Cape',
        'Free State',
        'Gauteng',
        'KwaZulu-Natal',
        'Limpopo',
        'Mpumalanga',
        'Northern Cape',
        'North West',
        'Western Cape',
        'National Office'
    ];

    const rolesList = [
        { id: 'EMPLOYEE', label: 'Employee', prefix: 'employee' },
        { id: 'SUPERVISOR', label: 'Supervisor', prefix: 'supervisor' },
        { id: 'FIRST_AIDER', label: 'First Aider', prefix: 'firstaider' },
        { id: 'OHS_PRACTITIONER', label: 'OHS Practitioner', prefix: 'ohspractitioner' },
        { id: 'OHS_NATIONAL_OFFICE', label: 'OHS National Office', prefix: 'ohspractitioner' },
        { id: 'HR', label: 'HR Officer', prefix: 'hr' },
        { id: 'PSSC_COORDINATOR', label: 'PSSC Coordinator', prefix: 'pssccoordinator' },
        { id: 'DEPUTY_DIRECTOR', label: 'Deputy Director', prefix: 'deputydirector' },
        { id: 'CHIEF_DIRECTOR', label: 'Chief Director', prefix: 'chiefdirector' },
        { id: 'FACILITIES_COORDINATOR', label: 'Facilities Co Coordinator', prefix: 'facilitiescoordinator' }
    ];

    // Redirect if already authenticated
    useEffect(() => {
        if (!isInitialized) return;

        if (isAuthenticated && user) {
            const roleName = user.role?.name?.toLowerCase().replace(/\s+/g, '_');

            // Route based on role (normalized to lowercase with underscores)
            if (roleName === 'employee') {
                navigate('/employee/dashboard');
            } else if (roleName === 'supervisor') {
                navigate('/supervisor/dashboard');
            } else if (roleName === 'ohs_practitioner' || roleName === 'ohs_national_office') {
                navigate('/ohs/dashboard');
            } else if (roleName === 'first_aider') {
                navigate('/first-aider/dashboard');
            } else if (roleName === 'hr') {
                navigate('/hr/dashboard');
            } else if (roleName === 'finance_official') {
                navigate('/finance/dashboard');
            } else if (roleName === 'system_administrator' || roleName === 'manager') {
                navigate('/admin/dashboard');
            } else if (roleName === 'pssc_coordinator') {
                navigate('/pssc/dashboard');
            } else if (roleName === 'deputy_director') {
                navigate('/deputy/dashboard');
            } else if (roleName === 'chief_director') {
                navigate('/chief-director/dashboard');
            } else if (roleName === 'facilities_coordinator') {
                navigate('/facilities/dashboard');
            } else {
                // Default fallback
                navigate('/admin/dashboard');
            }
        }
    }, [isAuthenticated, isInitialized, user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSsoSubmit = async () => {
        setError('');
        setLoading(true);
        setShowSsoModal(false);

        const slug = ssoProvince.replace(/\s+/g, '').toLowerCase();
        const rolePrefix = rolesList.find(r => r.id === ssoRole)?.prefix || 'employee';
        const ssoEmail = `${rolePrefix}.${slug}@dlrrd.gov.za`;

        try {
            await login({ email: ssoEmail, password: 'sso-password' });
        } catch (err: any) {
            console.error('SSO login error:', err);
            setError(err.response?.data?.message || err.message || 'SSO Sign-in failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden font-sans">
            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-[#884616] flex-col items-center justify-center text-white p-8 relative overflow-hidden">
                <div className="bottom-0 right-0 opacity-10">
                    <img src="/sidebar_logo.png" alt="" className="w-96 h-96 bottom-[-10%] right-[-10%] absolute" />
                </div>

                <div className="z-10 text-center">
                    <div className="mx-auto mb-5 w-48 h-48 rounded-full flex items-center justify-center text-4xl font-bold">
                        <img src="/short_logo.png" alt="Background" className="w-full h-full object-contain" />
                    </div>

                    <h1 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight text-center">
                        Department of Land Reform <br /> and Rural Development
                    </h1>

                    <p className="mt-6 text-xs lg:text-sm opacity-80 max-w-md mx-auto text-center">
                        Document Security Compliance and OHS Management System
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="mb-6 text-center flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
                        <p className="text-xs text-gray-500">Sign in to access your dashboard</p>
                    </div>

                    <div className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">
                                {error}
                            </div>
                        )}

                        {/* Microsoft SSO Button */}
                        <button
                            type="button"
                            onClick={() => setShowSsoModal(true)}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-gray-50 transition duration-300 shadow-sm disabled:opacity-50"
                        >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="10.5" height="10.5" fill="#F25022"/>
                                <rect x="12.5" width="10.5" height="10.5" fill="#7FBA00"/>
                                <rect y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
                                <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
                            </svg>
                            Log in with Microsoft
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">or sign in with email</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-3.5 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gold-700 focus:ring-1 focus:ring-gold-700 outline-none text-xs transition disabled:opacity-50"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-3.5 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gold-700 focus:ring-1 focus:ring-gold-700 outline-none text-xs transition disabled:opacity-50"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-3.5 w-3.5 text-gold-700 rounded border-gray-300 focus:ring-gold-700" />
                                    <span className="ml-2 text-xs text-gray-600">Remember Me</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#884616] text-white font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-opacity-90 transition duration-300 shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                            >
                                {loading ? 'Signing In...' : 'Log In'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Having trouble signing in? <a href="mailto:support@dlrrd.gov.za?subject=OHS%20Incident%20System%20Support" className="text-[#884616] font-semibold hover:underline">Contact IT Support</a>
                        </p>
                    </div>

                    <div className="mt-6 text-center border-t border-gray-100 pt-4">
                        <p className="text-[10px] text-gray-400">
                            © 2026 Department of Land Reform and Rural Development<br />Republic of South Africa
                        </p>
                    </div>
                </div>
            </div>

            {/* Microsoft SSO Mock Selector Modal */}
            {showSsoModal && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-150 overflow-hidden animate-fadeIn">
                        {/* Modal Header */}
                        <div className="bg-[#884616] text-white px-5 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <svg className="w-4.5 h-4.5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="10.5" height="10.5" fill="#ffffff" opacity="0.9"/>
                                    <rect x="12.5" width="10.5" height="10.5" fill="#ffffff" opacity="0.9"/>
                                    <rect y="12.5" width="10.5" height="10.5" fill="#ffffff" opacity="0.9"/>
                                    <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#ffffff" opacity="0.9"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Microsoft Azure Active Directory</h3>
                                <p className="text-[10px] text-white/80 mt-0.5">Single Sign-On (SSO) Portal Simulator</p>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Province / Region</label>
                                <select
                                    value={ssoProvince}
                                    onChange={(e) => setSsoProvince(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-[#884616] focus:ring-1 focus:ring-[#884616] transition"
                                >
                                    {provincesList.map(prov => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Role Account</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {rolesList
                                        .filter(role => {
                                            if (['Eastern Cape', 'Northern Cape', 'North West'].includes(ssoProvince) && role.id === 'OHS_PRACTITIONER') {
                                                return false;
                                            }
                                            if (role.id === 'OHS_NATIONAL_OFFICE' || role.id === 'CHIEF_DIRECTOR') {
                                                return ssoProvince === 'National Office';
                                            }
                                            return true;
                                        })
                                        .map(role => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setSsoRole(role.id)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                                                    ssoRole === role.id
                                                        ? 'border-[#884616] bg-amber-50/30 text-[#884616] font-bold shadow-sm'
                                                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                                }`}
                                            >
                                                <span className="text-xs">{role.label}</span>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {role.prefix}.{ssoProvince.replace(/\s+/g, '').toLowerCase()}@dlrrd.gov.za
                                                </span>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="px-5 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-150">
                            <button
                                type="button"
                                onClick={() => setShowSsoModal(false)}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSsoSubmit}
                                className="px-5 py-2 bg-[#884616] text-white hover:bg-opacity-95 rounded-lg text-xs font-bold transition shadow-sm"
                            >
                                Authenticate SSO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
