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
            } else if (roleName === 'ohs_practitioner') {
                navigate('/ohs/dashboard');
            } else if (roleName === 'security_practitioner') {
                navigate('/security/dashboard');
            } else if (roleName === 'finance_official') {
                navigate('/finance/dashboard');
            } else if (roleName === 'system_administrator' || roleName === 'manager') {
                navigate('/admin/dashboard');
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
            // Navigation will happen automatically via useEffect when isAuthenticated changes
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-[#884616] flex-col items-center justify-center text-white p-8 relative overflow-hidden">
                {/* Background Pattern elements could go here */}
                <div className=" bottom-0 right-0 opacity-10">
                    <img src="/sidebar_logo.png" alt="" className="w-96 h-96 bottom-[-10%] right-[-10%] absolute" />
                </div>

                <div className="z-10 text-center">
                    {/* Logo Placeholder */}
                    <div className="mx-auto mb-5 w-48 h-48 rounded-full flex items-center justify-center text-4xl font-bold ">
                        <img src="/short_logo.png" alt="Background" className="w-full h-full object-contain" />
                    </div>

                    <h1 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight text-center">
                        Department of Land Reform <br /> and Rural Development
                    </h1>

                    <p className="mt-6 text-xs lg:text-sm opacity-80 max-w-md mx-auto text-center">
                        Chief Directorate: Security and Facilities Management Services<br />
                        Integrated Case Management System
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="mb-6 text-center flex flex-col items-center justify-center">

                        <div className="my-4 mb-4 w-40 h-28 font-bold ">
                            <img src="/logo_with_name.png" alt="Background" className="w-full h-full object-contain" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
                        <p className="text-xs text-gray-500">Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-3.5 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gold-700 focus:ring-1 focus:ring-gold-700 outline-none text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="w-full px-3.5 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gold-700 focus:ring-1 focus:ring-gold-700 outline-none text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="form-checkbox h-3.5 w-3.5 text-gold-700 rounded border-gray-300 focus:ring-gold-700" />
                                <span className="ml-2 text-xs text-gray-600">Remember Me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#884616] text-white font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-gold-800 transition duration-300 shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Signing In...' : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Having trouble signing in? <a href="#" className="text-[#884616] font-semibold hover:underline">Contact IT Support</a>
                        </p>
                    </div>

                    <div className="mt-6 text-center border-t border-gray-100 pt-4">
                        <p className="text-[10px] text-gray-400">
                            © 2026 Department of Land Reform and Rural Development<br />Republic of South Africa
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
