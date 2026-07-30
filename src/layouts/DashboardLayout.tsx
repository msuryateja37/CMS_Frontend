import React, { type ReactNode, useState, useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopBar, { type BreadcrumbItem } from '../components/layout/TopBar';
import { useUIStore } from '../store/ui.store';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { X, Bell } from 'lucide-react';

import { useAuthStore } from '../store/auth.store';
import { getUserRoleName } from '../utils/rolePaths';

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    headerContent?: ReactNode;
    actionButton?: {
        label: string;
        onClick: () => void;
        icon?: React.ElementType;
    };
    userProfile?: {
        name: string;
        role: string;
    };
    searchPlaceholder?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    title,
    description,
    breadcrumbs,
    headerContent,
    actionButton,
    userProfile,
    searchPlaceholder
}) => {
    const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { notifications, markAsRead } = useNotifications();
    const [toasts, setToasts] = useState<any[]>([]);
    const seenIds = useRef<Set<string>>(new Set());
    const isInitial = useRef(true);

    useEffect(() => {
        if (!notifications || notifications.length === 0) return;
        const unread = notifications.filter((n: any) => !n.isRead);

        if (isInitial.current) {
            // First load: toast up to 3 unread notifications
            const toShow = unread.slice(0, 3);
            toShow.forEach((n: any) => {
                triggerToast(n);
                seenIds.current.add(n.id);
            });
            unread.forEach((n: any) => seenIds.current.add(n.id));
            isInitial.current = false;
        } else {
            // New arrivals: toast immediately
            unread.forEach((n: any) => {
                if (!seenIds.current.has(n.id)) {
                    triggerToast(n);
                    seenIds.current.add(n.id);
                }
            });
        }
    }, [notifications]);

    const triggerToast = (n: any) => {
        const id = Math.random().toString();
        const newToast = {
            id,
            notificationId: n.id,
            title: n.title,
            message: n.message,
            referenceId: n.referenceId,
            createdAt: n.createdAt
        };
        setToasts(prev => [...prev, newToast]);

        // Auto remove after 8 seconds
        setTimeout(() => {
            removeToast(id);
        }, 8000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleToastClick = async (toast: any) => {
        try {
            await markAsRead(toast.notificationId);
        } catch (e) {}
        removeToast(toast.id);
        if (toast.referenceId) {
            const roleName = getUserRoleName(user) || 'employee';
            let path = `/employee/my-cases/${toast.referenceId}`;
            if (roleName === 'first_aider') {
                path = `/first-aider/cases/${toast.referenceId}`;
            } else if (roleName === 'ohs_practitioner' || roleName === 'ohs_national_office') {
                path = `/ohs/cases/${toast.referenceId}`;
            } else if (roleName === 'supervisor') {
                path = `/supervisor/cases/${toast.referenceId}`;
            } else if (roleName === 'pssc_coordinator') {
                path = `/pssc/incidents/${toast.referenceId}`;
            } else if (roleName === 'deputy_director') {
                path = `/deputy/incidents/${toast.referenceId}`;
            } else if (roleName === 'chief_director') {
                path = `/chief-director/incidents/${toast.referenceId}`;
            } else if (roleName === 'facilities_coordinator') {
                path = `/facilities/cases/${toast.referenceId}`;
            } else if (roleName === 'system_administrator' || roleName === 'manager') {
                path = `/admin/incidents/${toast.referenceId}`;
            }
            navigate(path);
        }
    };

    return (
        <div className="flex h-screen bg-subtle-grey overflow-hidden font-sans text-dark-grey relative">
            {/* Mobile Sidebar Overlay */}
            {!sidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}

            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b border-gray-200 px-5 py-4 shrink-0 shadow-sm">
                    <TopBar
                        title={title}
                        description={description}
                        breadcrumbs={breadcrumbs}
                        actionButton={actionButton}
                        userProfile={userProfile}
                        searchPlaceholder={searchPlaceholder}
                    >
                        {headerContent}
                    </TopBar>
                </div>
                <main id="dashboard-main-content" className="flex-1 overflow-x-hidden overflow-y-auto p-5 custom-scrollbar">
                    {children}
                </main>
            </div>

            {/* Toast Notifications Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        onClick={() => handleToastClick(toast)}
                        className="bg-white/95 backdrop-blur-md border border-gray-150 shadow-2xl p-4 rounded-2xl flex gap-3 cursor-pointer hover:bg-gray-50 transition-all transform translate-x-0 pointer-events-auto relative overflow-hidden"
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#884616]" />
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#884616] flex items-center justify-center shrink-0 border border-amber-100/50">
                            <Bell size={15} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-xs text-gray-800 truncate">{toast.title}</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{toast.message}</p>
                            <span className="text-[9px] text-gray-400 mt-1 block">Click to view details</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeToast(toast.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition shrink-0 self-start p-1 -mr-1"
                        >
                            <X size={13} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardLayout;

