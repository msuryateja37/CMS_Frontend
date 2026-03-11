import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityService } from '../services/securityService';

export const useSecurityStats = () => {
    return useQuery({
        queryKey: ['security-stats'],
        queryFn: () => securityService.getStats(),
    });
};

export const useSecurityIncidents = () => {
    return useQuery({
        queryKey: ['security-incidents'],
        queryFn: () => securityService.getIncidents(),
    });
};

export const useSecurityTrends = () => {
    return useQuery({
        queryKey: ['security-trends'],
        queryFn: () => securityService.getTrends(),
    });
};

export const useSecuritySeverity = () => {
    return useQuery({
        queryKey: ['security-severity'],
        queryFn: () => securityService.getSeverity(),
    });
};

export const useCreateSecurityIncident = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => securityService.createIncident(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-incidents'] });
            queryClient.invalidateQueries({ queryKey: ['security-stats'] });
        },
    });
};
