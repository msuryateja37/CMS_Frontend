import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronLeft, LogOut } from 'lucide-react';
import { SIDEBAR_ITEMS, EMPLOYEE_SIDEBAR, SUPERVISOR_SIDEBAR, OHS_SIDEBAR, OHS_NATIONAL_SIDEBAR, FIRST_AIDER_SIDEBAR, HR_SIDEBAR, INVESTIGATOR_SIDEBAR, CHAIRPERSON_SIDEBAR, EA_DA_SIDEBAR } from '../../data/navigation';
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
        if (role === 'ohs_national_office') return OHS_NATIONAL_SIDEBAR;
        if (role === 'first_aider') return FIRST_AIDER_SIDEBAR;
        if (role === 'hr') return HR_SIDEBAR;
        if (role === 'investigator') return INVESTIGATOR_SIDEBAR;
        if (role === 'chairperson') return CHAIRPERSON_SIDEBAR;
        if (role === 'system_administrator') return SIDEBAR_ITEMS;
        if (role === 'finance_official') return SIDEBAR_ITEMS;
        if (role === 'manager') return SIDEBAR_ITEMS;
        if (role === 'ea_da') return EA_DA_SIDEBAR;
        return SIDEBAR_ITEMS;
    };

    const currentSidebarItems = getSidebarItems();

    useEffect(() => {
        // Find the section that contains the current path and open it
        const activeItem = currentSidebarItems.find(item =>
            !item.isSingle && item.children?.some((child: { path: string }) => location.pathname === child.path)
        );

        if (activeItem && !sidebarCollapsed && activeSection !== activeItem.label) {
            const timer = setTimeout(() => {
                setActiveSection(activeItem.label);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [location.pathname, currentSidebarItems, sidebarCollapsed, activeSection]);

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

    const handleParentClick = (item: { label: string }) => {
        if (sidebarCollapsed) {
            setSidebarCollapsed(false);
            setActiveSection(item.label);
        } else {
            toggleSection(item.label);
        }
    };

    return (
        <aside className={clsx(
            "bg-brown text-white flex flex-col flex-shrink-0 h-screen transition-all duration-300 font-sans shadow-xl",
            "fixed inset-y-0 left-0 z-50 lg:relative",
            sidebarCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 lg:w-56"
        )}>
            {/* Logo Area */}
            <div className={clsx(
                "p-3.5 flex flex-col border-b border-white/5 relative",
                sidebarCollapsed ? "items-center" : ""
            )}>
                {sidebarCollapsed ? (
                    <div className="flex items-center justify-center w-full">
                        <img
                            src="/short_logo.png"
                            alt="Providence"
                            className="w-7 h-auto block shrink-0"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between mb-3 pr-6">
                            <div className="bg-white p-2.5 rounded-xl w-full flex justify-center shadow-sm">
                                <img
                                    src="/logo_with_name.png"
                                    alt="Land Reform & Rural Development"
                                    className="w-full max-w-[150px] h-auto object-contain"
                                />
                            </div>
                        </div>
                        <div className="text-center mb-1">
                            <span className="text-[11px] font-extrabold text-[#ECC899] tracking-wider uppercase block">
                                OHS Incident Management System
                            </span>
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={toggleSidebar}
                    className={clsx(
                        "hidden lg:flex items-center justify-center p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors shrink-0",
                        sidebarCollapsed ? "mt-3 w-8 h-8" : "absolute top-2 right-2"
                    )}
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
                                        isActive ? "bg-gold text-white" : "text-gray-300 hover:bg-white/10"
                                    )
                                }
                            >
                                <Icon size={16} className={clsx(sidebarCollapsed ? "m-0" : "mr-2.5 shrink-0")} />
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </NavLink>
                        );
                    }

                    const isOpen = activeSection === item.label && !sidebarCollapsed;
                    const isParentActive = item.children?.some((child: { path: string }) => location.pathname === child.path);

                    return (
                        <div key={item.label} className="mb-0.5">
                            <button
                                onClick={() => handleParentClick(item)}
                                title={sidebarCollapsed ? item.label : undefined}
                                className={clsx(
                                    "w-full flex items-center rounded-lg transition-colors",
                                    sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2 text-[13px] font-medium",
                                    isOpen ? "bg-gold text-white" : (isParentActive ? "text-white" : "text-gray-300 hover:bg-white/10")
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
                                    {item.children?.map((child: { path: string; label: string }) => (
                                        <NavLink
                                            key={child.path}
                                            to={child.path}
                                            end
                                            className={({ isActive }) =>
                                                clsx(
                                                    "block py-1.5 px-8.5 text-[11px] font-medium rounded-lg transition-all mb-0.5",
                                                    isActive ? "bg-gold text-white" : "text-white hover:text-white hover:bg-white/10"
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
            {!sidebarCollapsed && (user?.role?.name?.toLowerCase().replace(/\s+/g, '_') === 'ohs_practitioner' || user?.role?.name?.toLowerCase().replace(/\s+/g, '_') === 'ohs_national_office') && (
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
                                    {(() => {
                                        const rawOffice = user?.department?.building?.name ?? user?.department?.name ?? 'N/A';
                                        const userProvinceName = user?.province?.name;
                                        if (userProvinceName && rawOffice && rawOffice.toLowerCase().includes('gauteng')) {
                                            return rawOffice.replace(/gauteng/i, userProvinceName);
                                        }
                                        return rawOffice;
                                    })()}
                                </span>
                            </div>
                            <div className="flex justify-between items-start text-xs gap-2">
                                <span className="text-gray-400">Province:</span>
                                <span className="text-gray-100 font-medium text-right max-w-[70%] leading-tight">
                                    {user?.province?.name ?? user?.department?.building?.province?.name ?? 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom: Logout icon (collapsed) or Sign out button (expanded) */}
            <div className="p-3 mt-auto shrink-0 border-t border-white/10 flex flex-col gap-2">
                {sidebarCollapsed ? (
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="flex items-center justify-center p-2.5 w-10 mx-auto rounded-xl bg-white/5 hover:bg-red-600/20 text-gray-200 hover:text-white transition-all duration-200 border border-white/10 hover:border-red-500/30 shadow-sm active:scale-[0.98]"
                    >
                        <LogOut size={15} strokeWidth={2.5} className="shrink-0" />
                    </button>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-600/20 text-gray-200 hover:text-white font-semibold text-[13px] transition-all duration-200 border border-white/10 hover:border-red-500/30 shadow-sm hover:shadow-red-950/20 active:scale-[0.98]"
                    >
                        <LogOut size={14} strokeWidth={2.5} className="shrink-0" />
                        <span>Sign out</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
