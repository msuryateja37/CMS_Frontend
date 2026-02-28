import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';

export const useInvoices = (filters?: any) => {
    return useQuery({
        queryKey: ['invoices', filters],
        queryFn: () => invoiceService.getInvoices(filters),
    });
};

export const useInvoiceDetails = (id: string) => {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoiceService.getInvoice(id),
        enabled: !!id,
    });
};

export const useInvoiceActions = (id: string) => {
    return useQuery({
        queryKey: ['invoice-actions', id],
        queryFn: () => invoiceService.getHistory(id),
        enabled: !!id,
    });
};

export const useApproveInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => invoiceService.approveInvoice(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
        },
    });
};
