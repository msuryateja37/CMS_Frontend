import React, { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar, { type BreadcrumbItem } from '../../../components/layout/TopBar';

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
}

const EmployeeLayout: React.FC<DashboardLayoutProps> = ({
    children,
    title,
    description,
    breadcrumbs,
    headerContent,
    actionButton
}) => {
    return (
        <div className="flex h-screen bg-subtle-grey overflow-hidden font-sans text-dark-grey">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 custom-scrollbar">
                    <TopBar
                        title={title}
                        description={description}
                        breadcrumbs={breadcrumbs}
                        actionButton={actionButton}
                    >
                        {headerContent}
                    </TopBar>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;

