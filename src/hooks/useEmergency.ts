import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyService } from '../services/emergencyService';

export const useDrills = () => {
    return useQuery({
        queryKey: ['drills'],
        queryFn: () => emergencyService.getDrills(),
    });
};

export const useRecordDrill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => emergencyService.recordDrill(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drills'] });
        },
    });
};
