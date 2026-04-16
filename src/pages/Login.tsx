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
        <div className="flex h-screen w-full">
            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-[#0f4c3a] flex-col items-center justify-center text-white p-12 relative overflow-hidden">
                {/* Background Pattern elements could go here */}
                <div className=" bottom-0 right-0 opacity-10">
                    <img src="/sidebar_logo.png" alt="" className="w-96 h-96 bottom-[-10%] right-[-10%] absolute" />
                </div>

                <div className="z-10 text-center">
                    {/* Logo Placeholder */}
                    <div className="mx-auto mb-8 w-64 h-64  rounded-full flex items-center justify-center text-4xl font-bold ">
                        <img src="/short_logo.png" alt="Background" />
                    </div>

                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        Department of Land Reform <br /> and Rural Development
                    </h1>

                    <p className="mt-8 text-sm opacity-80 max-w-md mx-auto">
                        Chief Directorate: Security and Facilities Management Services<br />
                        Integrated Case Management System
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 lg:p-24">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left  flex flex-col items-center justify-center">

                        <div className="my-10 mb-8 w-52 h-36  font-bold ">
                            <img src="/logo_with_name.png" alt="Background" />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-green-700 rounded border-gray-300 focus:ring-green-700" />
                                <span className="ml-2 text-sm text-gray-600">Remember Me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0f4c3a] text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 transition duration-300 shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Signing In...' : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Having trouble signing in? <a href="#" className="text-[#0f4c3a] font-semibold hover:underline">Contact IT Support</a>
                        </p>
                    </div>

                    <div className="mt-16 text-center border-t border-gray-100 pt-8">
                        <p className="text-xs text-gray-400">
                            © 2026 Department of Land Reform and Rural Development<br />Republic of South Africa
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
