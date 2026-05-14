
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

export interface OcrScanResponse {
    [key: string]: any;
}

export const invoiceService = {
    /**
     * Get all invoices with optional status filter
     */
    async getInvoices(status?: string) {
        const response = await api.get('/invoices', { params: { status } });
        return response.data;
    },

    /**
     * Get invoice by ID
     */
    async getInvoice(id: string) {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    /**
     * Create a new invoice
     */
    async createInvoice(data: any) {
        const response = await api.post('/invoices', data);
        return response.data;
    },

    /**
     * Approve an invoice
     */
    async approveInvoice(id: string) {
        const response = await api.put(`/invoices/${id}/approve`);
        return response.data;
    },

    /**
     * Reject an invoice with reason
     */
    async rejectInvoice(id: string, reason: string) {
        const response = await api.put(`/invoices/${id}/reject`, { reason });
        return response.data;
    },

    /**
     * Finalize an invoice
     */
    async finalizeInvoice(id: string) {
        const response = await api.put(`/invoices/${id}/finalize`);
        return response.data;
    },

    /**
     * Get invoice action history
     */
    async getHistory(id: string) {
        const response = await api.get(`/invoices/${id}/actions`);
        return response.data;
    },

    /**
     * Upload invoice file and run OCR scan to extract data
     */
    async ocrScan(file: File): Promise<OcrScanResponse> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<OcrScanResponse>('/ocr-scan', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Upload invoice file to storage
     */
    async uploadFile(file: File, invoiceId?: string): Promise<{ url: string; name: string; size: number; type: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const url = invoiceId ? `/invoices/upload?invoiceId=${invoiceId}` : '/invoices/upload';
        const response = await api.post<{ url: string; name: string; size: number; type: string }>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

