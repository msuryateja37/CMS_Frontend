
import api from './api';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    vendorName: string;
    amount: number;
    receivedDate: string;
    status: string;
    documentPath?: string;
    progress?: number;
}

export const invoiceService = {
    async getInvoices(status?: string) {
        const response = await api.get('/invoices', { params: { status } });
        return response.data;
    },

    async getInvoice(id: string) {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    async createInvoice(data: any) {
        const response = await api.post('/invoices', data);
        return response.data;
    },

    async approveInvoice(id: string) {
        const response = await api.put(`/invoices/${id}/approve`);
        return response.data;
    },

    async rejectInvoice(id: string, reason: string) {
        const response = await api.put(`/invoices/${id}/reject`, { reason });
        return response.data;
    },

    async finalizeInvoice(id: string) {
        const response = await api.put(`/invoices/${id}/finalize`);
        return response.data;
    },

    async getHistory(id: string) {
        const response = await api.get(`/invoices/${id}/actions`);
        return response.data;
    }
};
