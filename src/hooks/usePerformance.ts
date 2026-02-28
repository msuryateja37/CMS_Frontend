import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kpiService } from '../services/kpiService';
import { pdcaService } from '../services/pdcaService';

export const useKPIStats = () => {
    return useQuery({
        queryKey: ['kpi-stats'],
        queryFn: () => kpiService.getDashboardMetrics(),
    });
};

export const usePDCAActions = () => {
    return useQuery({
        queryKey: ['pdca-actions'],
        queryFn: () => pdcaService.getActions(),
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
