import { useQuery } from '@tanstack/react-query';
import { ohsService } from '../services/ohsService';
import { useAuthStore } from '../store/auth.store';

export const useInspections = (params?: any) => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['inspections', user?.id, params],
        queryFn: () => ohsService.getInspections(params),
        enabled: !!user?.id,
    });
};

export const useRisks = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['risks', user?.id],
        queryFn: () => ohsService.getRisks(),
        enabled: !!user?.id,
    });
};

export const useHazards = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['hazards', user?.id],
        queryFn: () => ohsService.getHazards(),
        enabled: !!user?.id,
    });
};

export const useJSAs = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['jsas', user?.id],
        queryFn: () => ohsService.getJSAs(),
        enabled: !!user?.id,
    });
};

export const useOHSStats = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['ohs-stats', user?.id],
        queryFn: () => ohsService.getStats(),
        enabled: !!user?.id,
    });
};
