import React, { useState, useEffect, useRef } from 'react';
import { Settings, Bell, Check, ChevronRight, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useSearchStore } from '../../store/search.store';
import { useUIStore } from '../../store/ui.store';
import { SearchInput, type SearchOption } from '../common/SearchInput';

import { useNotifications } from '../../hooks/useNotifications';

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
    breadcrumbs,
    searchPlaceholder = "Search cases, incident, invoices..",
    actionButton,
    userProfile
}) => {
    const user = useAuthStore((state) => state.user);
    const { searchQuery, setSearchQuery, searchResults, isSearching, performSearch } = useSearchStore();
    const { toggleSidebar } = useUIStore();
    const navigate = useNavigate();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                performSearch(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, performSearch]);

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

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }
        if (notif.referenceId) {
            const roleName = user?.role?.name;
            let basePath = '/cases';
            if (roleName === 'OHS Practitioner') basePath = '/ohs/cases';
            else if (roleName === 'Security Practitioner') basePath = '/security/cases';
            else if (roleName === 'Supervisor') basePath = '/supervisor/cases';
            navigate(`${basePath}/${notif.referenceId}`);
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
        if (!user?.role?.name) return 'User';
        // Format role name: SYSTEM_ADMINISTRATOR -> System Administrator
        return user.role.name
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Convert search results to SearchOption format
    const searchSuggestions: SearchOption[] = searchResults.map(result => ({
        value: result.id,
        label: result.incidentNumber || result.title,
        secondaryLabel: `${result.category || 'Case'} - ${result.severity || result.status || 'N/A'}`,
        metadata: result,
    }));

    // Handle search result selection
    const handleSearchSelect = (option: SearchOption) => {
        const result = option.metadata as typeof searchResults[0] | undefined;

        if (!result) return;

        // Navigate based on result type and user role
        if (result.type === 'case') {
            // Check user role and navigate to appropriate path
            const roleName = user?.role?.name;

            if (roleName === 'Employee') {
                navigate(`/employee/cases/${result.id}`);
            } else if (roleName === 'Supervisor') {
                navigate(`/supervisor/cases/${result.id}`);
            } else if (roleName === 'OHS Practitioner') {
                navigate(`/ohs/cases/${result.id}`);
            } else if (roleName === 'Security Practitioner') {
                navigate(`/security/cases/${result.id}`);
            } else if (roleName === 'Finance Official') {
                navigate(`/finance/cases/${result.id}`);
            } else if (roleName === 'System Administrator' || roleName === 'Manager') {
                navigate(`/admin/cases/${result.id}`);
            } else {
                // Default fallback
                navigate(`/cases/${result.id}`);
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-4 lg:mb-5 transition-all duration-300">
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
                    <div>
                        <h1 className="text-[19px] font-bold text-gray-800 leading-tight">{title}</h1>
                        {breadcrumbs && breadcrumbs.length > 0 ? (
                            <nav className="flex items-center gap-1 text-[11px] font-semibold mt-0">
                                {breadcrumbs.map((crumb, idx) => {
                                    const isLast = idx === breadcrumbs.length - 1;
                                    return (
                                        <React.Fragment key={idx}>
                                            {idx > 0 && <ChevronRight size={10} className="text-gray-300 mx-0.5" />}
                                            {crumb.path && !isLast ? (
                                                <Link to={crumb.path} className="text-green hover:text-dark-green hover:underline transition-colors">
                                                    {crumb.label}
                                                </Link>
                                            ) : (
                                                <span className={isLast ? 'text-gray-500' : 'text-green'}>{crumb.label}</span>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </nav>
                        ) : description ? (
                            <p className="text-[11px] font-semibold mt-0">
                                <span className="text-green">Dashboard </span>
                                <span className="text-black">/ {description}</span>
                            </p>
                        ) : null}
                    </div>

                    {actionButton && (
                        <button
                            onClick={actionButton.onClick}
                            className="flex items-center justify-center gap-1.5 bg-dark-green text-white px-3 py-1 rounded-lg text-[11px] font-bold hover:bg-opacity-90 transition-all shadow-md sm:mt-0.5 w-full sm:w-auto"
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

                {/* Functional Search with Autocomplete */}
                <div className="w-full md:w-48 lg:w-52">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={searchPlaceholder}
                        suggestions={searchSuggestions}
                        onSuggestionSelect={handleSearchSelect}
                        loading={isSearching}
                        variant="bordered"
                        filterMode="contains"
                        maxSuggestions={8}
                        className="w-full"
                    />
                </div>

                {/* Icons & Profile Group */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                    {/* Icons */}
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 bg-light-green hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                            <Settings size={14} />
                        </button>
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={handleBellClick}
                                className="p-1.5 text-gray-400 bg-light-green hover:bg-gray-50 rounded-xl transition-all relative border border-transparent hover:border-gray-100"
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
                                                className="text-xs text-green font-semibold hover:underline flex items-center gap-1"
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
                    <div className="relative">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-1.5 pl-2 hover:bg-gray-50 rounded-xl transition-all p-0.5"
                        >
                            <div className="flex flex-col text-right hidden sm:block">
                                <p className="text-[11px] font-bold text-gray-800 leading-none">{getFullName()}</p>
                                <p className="text-[9px] font-semibold text-gray-400 mt-0">{getUserRole()}</p>
                            </div>
                            <div className="w-[28px] h-[28px] rounded-full bg-green flex items-center justify-center text-white font-bold text-[11px] shadow-inner border-2 border-white">
                                {getUserInitials()}
                            </div>
                            {/* <ChevronDown size={16} className="text-gray-400" /> */}
                        </button>

                        {/* Profile Dropdown logic commented out in original file */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
