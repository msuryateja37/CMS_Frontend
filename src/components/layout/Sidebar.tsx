import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronLeft, LogOut } from 'lucide-react';
import { SIDEBAR_ITEMS, EMPLOYEE_SIDEBAR, SUPERVISOR_SIDEBAR, OHS_SIDEBAR, SECURITY_SIDEBAR, INVESTIGATOR_SIDEBAR, CHAIRPERSON_SIDEBAR, EA_DA_SIDEBAR } from '../../data/navigation';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const { sidebarCollapsed, setSidebarCollapsed, toggleSidebar } = useUIStore();

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

        if (activeItem && !sidebarCollapsed) {
            setActiveSection(activeItem.label);
        }
    }, [location.pathname, currentSidebarItems, sidebarCollapsed]);

    useEffect(() => {
        // Auto-close sidebar on mobile after navigation
        const handleRouteChange = () => {
            if (window.innerWidth < 1024) {
                setSidebarCollapsed(true);
            }
        };
        handleRouteChange();
    }, [location.pathname, setSidebarCollapsed]);

    const toggleSection = (label: string) => {
        setActiveSection(prev => (prev === label ? null : label));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleParentClick = (item: any) => {
        if (sidebarCollapsed) {
            setSidebarCollapsed(false);
            setActiveSection(item.label);
        } else {
            toggleSection(item.label);
        }
    };

    return (
        <aside className={clsx(
            "bg-dark-green text-white flex flex-col flex-shrink-0 h-screen transition-all duration-300 font-sans shadow-xl",
            "fixed inset-y-0 left-0 z-50 lg:relative",
            sidebarCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 lg:w-56"
        )}>
            {/* Logo Area */}
            <div className={clsx(
                "px-3.5 py-3.5 flex items-center border-b border-white/5",
                sidebarCollapsed ? "justify-center" : "justify-between"
            )}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <img
                        src="/short_logo.png"
                        alt="Providence"
                        className="w-7 h-auto block shrink-0"
                    />
                    {!sidebarCollapsed && (
                        <h1 className="text-xs font-bold text-white tracking-wide leading-tight truncate">
                            Case Management
                        </h1>
                    )}
                </div>
                
                <button 
                    onClick={toggleSidebar}
                    className="hidden lg:flex items-center justify-center p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors ml-1 shrink-0"
                >
                    {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                {currentSidebarItems.map((item) => {
                    const Icon = item.icon;
                    if (item.isSingle) {
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path!}
                                title={sidebarCollapsed ? item.label : undefined}
                                className={({ isActive }) =>
                                    clsx(
                                        "flex items-center rounded-lg transition-colors mb-0.5",
                                        sidebarCollapsed ? "justify-center p-2.5" : "px-3.5 py-2 text-[13px] font-medium",
                                        isActive ? "bg-green text-white" : "text-gray-300 hover:bg-white/10"
                                    )
                                }
                            >
                                <Icon size={16} className={clsx(sidebarCollapsed ? "m-0" : "mr-2.5 shrink-0")} />
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </NavLink>
                        );
                    }

                    const isOpen = activeSection === item.label && !sidebarCollapsed;
                    const isParentActive = item.children?.some((child: any) => location.pathname === child.path);

                    return (
                        <div key={item.label} className="mb-0.5">
                            <button
                                onClick={() => handleParentClick(item)}
                                title={sidebarCollapsed ? item.label : undefined}
                                className={clsx(
                                    "w-full flex items-center rounded-lg transition-colors",
                                    sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2 text-[13px] font-medium",
                                    isOpen ? "bg-green text-white" : (isParentActive ? "text-white" : "text-gray-300 hover:bg-white/10")
                                )}
                            >
                                <div className="flex items-center">
                                    <Icon size={16} className={clsx(sidebarCollapsed ? "m-0" : "mr-2.5 shrink-0")} />
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </div>
                                {!sidebarCollapsed && (isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
                            </button>

                            {/* Submenu */}
                            {!sidebarCollapsed && (
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
                                                    "block py-1.5 px-8.5 text-[11px] font-medium rounded-lg transition-all mb-0.5",
                                                    isActive ? "bg-green text-white" : "text-white hover:text-white hover:bg-white/10"
                                                )
                                            }
                                        >
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Inspector Information — shown for OHS role */}
            {!sidebarCollapsed && (user?.role?.name?.toLowerCase().replace(/\s+/g, '_') === 'ohs_practitioner') && (
                <div className="px-4 pb-2 shrink-0">
                    <div className="border-t border-white/10 pt-4 mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Inspector Information</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-start text-xs gap-2">
                                <span className="text-gray-400">Name:</span>
                                <span className="text-gray-100 font-medium text-right max-w-[70%] leading-tight">
                                    {user?.fullName || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-start text-xs gap-2">
                                <span className="text-gray-400">Office:</span>
                                <span className="text-gray-100 font-medium text-right max-w-[70%] leading-tight">
                                    {user?.department?.building?.name ?? user?.department?.name ?? 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-start text-xs gap-2">
                                <span className="text-gray-400">Province:</span>
                                <span className="text-gray-100 font-medium text-right max-w-[70%] leading-tight">
                                    {user?.department?.building?.province?.name ?? user?.province?.name ?? 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Card */}
            <div className="p-3 mt-auto shrink-0">
                <button
                    onClick={handleLogout}
                    title={sidebarCollapsed ? "Logout" : undefined}
                    className={clsx(
                        "flex items-center justify-center gap-1.5 bg-green hover:bg-[#2aa88f] text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] relative z-10 text-xs",
                        sidebarCollapsed ? "p-2.5 w-10 mx-auto" : "w-full py-2 px-3.5"
                    )}
                >
                    <LogOut size={15} strokeWidth={2.5} className="shrink-0" />
                    {!sidebarCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
