import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import InvoiceList from '../../components/invoice/InvoiceList';
import InvoiceAdminReview from '../../components/invoice/InvoiceAdminReview';
import { MOCK_INVOICES } from '../../data/invoiceMockData';

const AdminInvoiceList: React.FC = () => {
    return (
        <DashboardLayout
            title="Invoice Management"
            description="Review and approve submitted utility invoices"
            breadcrumbs={[
                { label: 'Dashboard', path: '/admin/dashboard' },
                { label: 'Invoice Management' },
            ]}
        >
            <InvoiceList role="admin" />
        </DashboardLayout>
    );
};

const AdminInvoiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const invoice = MOCK_INVOICES.find(inv => inv.id === id) || MOCK_INVOICES[0];

    return (
        <DashboardLayout
            title={`Review Invoice #${invoice.invoiceNumber}`}
            description={`${invoice.landlordName} — ${invoice.billingMonth}`}
            breadcrumbs={[
                { label: 'Dashboard', path: '/admin/dashboard' },
                { label: 'Invoice Management', path: '/admin/invoice-management' },
                { label: `Invoice #${invoice.invoiceNumber}` },
            ]}
        >
            <InvoiceAdminReview invoice={invoice} />
        </DashboardLayout>
    );
};

export { AdminInvoiceList, AdminInvoiceDetail };
