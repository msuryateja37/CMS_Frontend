import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { EMPLOYEE_SIDEBAR } from '../../../data/navigation';
import clsx from 'clsx';
import { useAuthStore } from '../../../store/auth.store';

const Sidebar: React.FC = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    // Directly use Employee Sidebar items
    const currentSidebarItems = EMPLOYEE_SIDEBAR;



    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <aside className="w-64 bg-brown text-white flex flex-col flex-shrink-0 h-screen transition-all duration-300 font-sans">
            {/* Logo Area */}
            <div className="px-6 py-8">
                <div className="flex items-center justify-start">
                    <img
                        src="/short_logo.png"
                        alt="Providence"
                        className="w-12 h-auto block"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
                {currentSidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path!}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1",
                                    isActive ? "bg-gold text-white" : "text-gray-300 hover:bg-white/10"
                                )
                            }
                        >
                            <Icon size={20} className="mr-3 shrink-0" />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-[#A1743E] text-white py-3.5 px-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                    <LogOut size={18} strokeWidth={2.5} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
