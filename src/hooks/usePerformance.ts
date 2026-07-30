import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kpiService } from '../services/kpiService';
import { pdcaService } from '../services/pdcaService';
import { useAuthStore } from '../store/auth.store';

export const useKPIStats = () => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['kpi-stats', user?.id],
        queryFn: () => kpiService.getDashboardMetrics(),
        enabled: !!user?.id,
        staleTime: 0,
    });
};

export const usePDCAActions = () => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['pdca-actions', user?.id],
        queryFn: () => pdcaService.getActions(),
        enabled: !!user?.id,
        staleTime: 0,
    });
};

export const useUpdatePDCAAction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) =>
            pdcaService.updateAction(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pdca-actions'] });
        },
    });
};
