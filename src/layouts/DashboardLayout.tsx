import React, { type ReactNode } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopBar, { type BreadcrumbItem } from '../components/layout/TopBar';
import { useUIStore } from '../store/ui.store';

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
                <main id="dashboard-main-content" className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5 lg:p-6 custom-scrollbar">
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
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

