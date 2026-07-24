import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { useNotifications } from '../../hooks/useNotifications';
import { getUserRoleName, getUserRoleDisplayName } from '../../utils/rolePaths';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface TopBarProps {
    children?: React.ReactNode;
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    searchPlaceholder?: string;
    showFilters?: boolean;
    actionButton?: {
        label: string;
        onClick: () => void;
        icon?: React.ElementType;
    };
    userProfile?: {
        name: string;
        role: string;
    };
}

const TopBar: React.FC<TopBarProps> = ({
    children,
    title,
    description,
    actionButton,
    userProfile
}) => {
    const { user } = useAuthStore();
    const { toggleSidebar } = useUIStore();
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const currentRole = getUserRoleName(user);
    const isSupervisor = currentRole === 'supervisor';
    const isOHSNational = currentRole === 'ohs_national_office';
    const isOHS = currentRole === 'ohs_practitioner' || currentRole === 'ohs_national_office';

    const getDisplayTitle = () => {
        const path = pathname.toLowerCase();
        
        if (isOHSNational) {
            if (path.includes('/ohs-national/dashboard')) return 'National Oversight';
            if (path.includes('/ohs-national/logged-incidents')) return 'Logged Incidents';
            if (path.includes('/ohs-national/administration')) return 'Administration';
            if (path.includes('/ohs-national/ai-assistant')) return 'AI Assistant';
            if (path.includes('/profile')) return 'Profile';
        }

        if (isSupervisor) {
            if (path.includes('/submit-case')) {
                return 'National Oversight';
            }
            if (path.includes('/logged-incidents')) {
                return 'Logged Incidents';
            }
            if (path.includes('/ai-assistant')) {
                return 'AI Assistant';
            }
            if (path.includes('/dashboard')) {
                return 'Dashboard';
            }
        }
        
        // General mapping for other roles (like employee, ohs, etc.)
        if (path.endsWith('/dashboard')) {
            return 'Dashboard';
        }
        if (path.endsWith('/submit-case')) {
            return 'Report New Incident';
        }
        if (path.includes('/ai-assistant')) {
            return 'AI Assistant';
        }
        if (path.includes('/logged-incidents')) {
            return 'Logged Incidents';
        }
        if (path.includes('/my-cases')) {
            return 'My Incidents';
        }
        if (path.includes('/profile')) {
            return 'My Profile';
        }
        
        // Fallback or mapping for default titles
        if (title === 'OHS Incident Management' || title === 'OHS Incident Management System') {
            return 'Dashboard';
        }
        return title;
    };

    const displayTitle = getDisplayTitle();
    let displayDescription = (isSupervisor || isOHS || isOHSNational) ? 'DLRRD Facilities Management Services' : description;

    if (displayTitle && displayDescription && displayTitle.toLowerCase().trim() === displayDescription.toLowerCase().trim()) {
        displayDescription = undefined;
    }

    // Use notifications hook
    const { 
        unreadCount, 
        notifications, 
        isLoading: loadingNotifications, 
        markAsRead, 
        markAllAsRead, 
        fetchNotifications 
    } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
        } catch { /* silent */ }
    };

    const handleNotificationClick = async (notif: { id: string; title: string; message: string; isRead: boolean; referenceId?: string; createdAt: string }) => {
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }
        if (notif.referenceId) {
            const roleName = user?.role?.name?.toLowerCase().replace(/\s+/g, '_') || 'employee';
            let path = `/employee/my-cases/${notif.referenceId}`;
            if (roleName === 'first_aider') {
                path = `/first-aider/cases/${notif.referenceId}`;
            } else if (roleName === 'ohs_practitioner') {
                path = `/ohs/cases/${notif.referenceId}`;
            } else if (roleName === 'supervisor') {
                path = `/supervisor/cases/${notif.referenceId}`;
            } else if (roleName === 'system_administrator' || roleName === 'manager') {
                path = `/admin/incidents/${notif.referenceId}`;
            }
            navigate(path);
            setShowNotifications(false);
        }
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (userProfile) {
            const names = userProfile.name.split(' ');
            if (names.length >= 2) {
                return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
            }
            return names[0].charAt(0).toUpperCase();
        }

        if (!user) return 'U';
        if (user.fullName) {
            const names = user.fullName.split(' ');
            if (names.length >= 2) {
                return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
            }
            return names[0].charAt(0).toUpperCase();
        }
        return 'U';
    };

    const getFullName = () => {
        if (userProfile) return userProfile.name;
        if (!user) return 'User';
        return user.fullName || 'User';
    };

    const getUserRole = () => {
        if (userProfile) return userProfile.role;
        return getUserRoleDisplayName(user);
    };



    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 transition-all duration-300">
            {/* Left: Title and Breadcrumbs */}
            <div className="shrink-0 flex items-center w-full lg:w-auto gap-2">
                {/* Mobile hamburger menu toggle */}
                <button 
                    onClick={toggleSidebar}
                    className="p-1.5 -ml-1 text-gray-500 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all lg:hidden shrink-0 shadow-sm"
                    title="Toggle menu"
                >
                    <Menu size={14} />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center w-full lg:w-auto gap-2.5 sm:gap-4">
                    {displayTitle && (
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-[19px] font-bold text-gray-800 leading-tight">{displayTitle}</h1>
                        </div>
                    )}
                    {actionButton && (
                        <button
                            onClick={actionButton.onClick}
                            className="flex items-center justify-center gap-1.5 bg-brown text-white px-3 py-1 rounded-lg text-[11px] font-bold hover:bg-opacity-90 transition-all shadow-md sm:mt-0.5 w-full sm:w-auto"
                        >
                            {actionButton.icon && <actionButton.icon size={12} />}
                            {actionButton.label}
                        </button>
                    )}
                </div>
            </div>

            {/* Right: Search, Icons, Profile */}
            <div className="flex flex-col-reverse md:flex-row items-center gap-2.5 w-full lg:w-auto">
                {children}



                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                    {/* Icons */}
                    <div className="flex items-center gap-1">
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={handleBellClick}
                                className="p-1.5 text-gray-400 bg-light-gold hover:bg-gray-50 rounded-xl transition-all relative border border-transparent hover:border-gray-100"
                            >
                                <Bell size={14} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center bg-red text-white text-[8px] font-bold rounded-full px-1 shadow-sm">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-800">Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-xs text-gold font-semibold hover:underline flex items-center gap-1"
                                            >
                                                <Check size={12} /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {loadingNotifications ? (
                                            <div className="px-4 py-6 text-center text-xs text-gray-400">Loading...</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-xs text-gray-400">No notifications yet</div>
                                        ) : (
                                            notifications.slice(0, 20).map(notif => (
                                                <button
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {!notif.isRead && (
                                                            <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                        )}
                                                        <div className={!notif.isRead ? '' : 'ml-4'}>
                                                            <p className="text-sm font-semibold text-gray-800 leading-tight">{notif.title}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                            <p className="text-[10px] text-gray-300 mt-1">
                                                                {new Date(notif.createdAt).toLocaleString('en-GB', {
                                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-1.5 pl-2 p-0.5 select-none shrink-0">
                        <div className="flex flex-col text-right hidden sm:block gap-0.5">
                            <p className="text-[11px] font-bold text-gray-800 leading-normal whitespace-nowrap">{getFullName()}</p>
                            <p className="text-[9px] font-semibold text-gray-400 whitespace-nowrap">{getUserRole()}</p>
                        </div>
                        <div className="w-[28px] h-[28px] rounded-full bg-gold flex items-center justify-center text-white font-bold text-[11px] shadow-inner border-2 border-white shrink-0">
                            {getUserInitials()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
