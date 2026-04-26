import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { SIDEBAR_ITEMS, EMPLOYEE_SIDEBAR, SUPERVISOR_SIDEBAR, OHS_SIDEBAR, SECURITY_SIDEBAR, INVESTIGATOR_SIDEBAR, CHAIRPERSON_SIDEBAR, EA_DA_SIDEBAR } from '../../data/navigation';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const getSidebarItems = () => {
        const role = user?.role?.name?.toLowerCase().replace(/\s+/g, '_');
        if (role === 'employee') return EMPLOYEE_SIDEBAR;
        if (role === 'supervisor') return SUPERVISOR_SIDEBAR;
        if (role === 'ohs_practitioner') return OHS_SIDEBAR;
        if (role === 'security_practitioner') return SECURITY_SIDEBAR;
        if (role === 'investigator') return INVESTIGATOR_SIDEBAR;
        if (role === 'chairperson') return CHAIRPERSON_SIDEBAR;
        if (role === 'system_administrator') return SIDEBAR_ITEMS;
        if (role === 'finance_official') return SIDEBAR_ITEMS;
        if (role === 'manager') return SIDEBAR_ITEMS;
        if (role === 'ea_da') return EA_DA_SIDEBAR;
        return SIDEBAR_ITEMS;
    };

    const currentSidebarItems: any[] = getSidebarItems();

    useEffect(() => {
        // Find the section that contains the current path and open it
        const activeItem = currentSidebarItems.find(item =>
            !item.isSingle && item.children?.some((child: any) => location.pathname === child.path)
        );

        if (activeItem) {
            setActiveSection(activeItem.label);
        }
    }, [location.pathname, currentSidebarItems]);

    const toggleSection = (label: string) => {
        setActiveSection(prev => (prev === label ? null : label));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <aside className="w-64 bg-dark-green text-white flex flex-col flex-shrink-0 h-screen transition-all duration-300 font-sans">
            {/* Logo Area */}
            <div className="px-2 my-8 flex gap-3 items-center justify-center">
                <div className="">
                    <div className="">
                        <img
                            src="/short_logo.png"
                            alt="Providence"
                            className="w-12 h-auto block"
                        />
                    </div>
                </div>
                <div className=" py-2 ">
                    <h1 className="text-lg font-bold text-grey-50">Case Management System</h1>
                </div>
            </div>


            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
                {currentSidebarItems.map((item) => {
                    const Icon = item.icon;
                    if (item.isSingle) {
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path!}
                                className={({ isActive }) =>
                                    clsx(
                                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1",
                                        isActive ? "bg-green text-white" : "text-gray-300 hover:bg-white/10"
                                    )
                                }
                            >
                                <Icon size={20} className="mr-3 shrink-0" />
                                {item.label}
                            </NavLink>
                        );
                    }

                    const isOpen = activeSection === item.label;
                    const isParentActive = item.children?.some((child: any) => location.pathname === child.path);

                    return (
                        <div key={item.label} className="mb-1">
                            <button
                                onClick={() => toggleSection(item.label)}
                                className={clsx(
                                    "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isOpen ? "bg-green text-white" : (isParentActive ? "text-white" : "text-gray-300 hover:bg-white/10")
                                )}
                            >
                                <div className="flex items-center">
                                    <Icon size={20} className="mr-3 shrink-0" />
                                    {item.label}
                                </div>
                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {/* Submenu */}
                            <div className={clsx(
                                "overflow-hidden transition-all duration-300 ease-in-out",
                                isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                            )}>
                                {item.children?.map((child: any) => (
                                    <NavLink
                                        key={child.path}
                                        to={child.path}
                                        end
                                        className={({ isActive }) =>
                                            clsx(
                                                "block py-2 px-10 text-xs rounded-lg transition-all mb-0.5",
                                                isActive ? "bg-green text-white" : "text-white hover:text-white hover:bg-white/10"
                                            )
                                        }
                                    >
                                        {child.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Inspector Information — shown for OHS role */}
            {(user?.role?.name?.toLowerCase().replace(/\s+/g, '_') === 'ohs_practitioner') && (
                <div className="px-4 pb-2">
                    <div className="border-t border-white/10 pt-4 mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Inspector Information</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Name:</span>
                                <span className="text-gray-100 font-medium text-right max-w-[60%] truncate">
                                    {user?.fullName || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Office:</span>
                                <span className="text-gray-100 font-medium text-right max-w-[60%] truncate">
                                    {user?.department?.building?.name ?? user?.department?.name ?? 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Province:</span>
                                <span className="text-gray-100 font-medium text-right max-w-[60%] truncate">
                                    {user?.department?.building?.province?.name ?? user?.province?.name ?? 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Card */}
            <div className="p-4 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-green hover:bg-[#2aa88f] text-white py-3.5 px-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] relative z-10"
                >
                    <LogOut size={18} strokeWidth={2.5} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
