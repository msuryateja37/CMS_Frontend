import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';
import { useAuthStore } from '../store/auth.store';

export const useInvoices = (filters?: any) => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['invoices', user?.id, filters],
        queryFn: () => invoiceService.getInvoices(filters),
        enabled: !!user?.id,
        staleTime: 0,
    });
};

export const useInvoiceDetails = (id: string) => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['invoice', id, user?.id],
        queryFn: () => invoiceService.getInvoice(id),
        enabled: !!id && !!user?.id,
        staleTime: 0,
    });
};

export const useInvoiceActions = (id: string) => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['invoice-actions', id, user?.id],
        queryFn: () => invoiceService.getHistory(id),
        enabled: !!id && !!user?.id,
        staleTime: 0,
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
