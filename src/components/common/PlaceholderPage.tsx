import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

interface PlaceholderPageProps {
    title: string;
    description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
    return (
        <DashboardLayout title={title} description={description || 'Page under construction'}>
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                <p className="text-gray-500">This feature is coming soon.</p>
            </div>
        </DashboardLayout>
    );
};

export default PlaceholderPage;
