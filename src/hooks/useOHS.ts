import { useQuery } from '@tanstack/react-query';
import { ohsService } from '../services/ohsService';

export const useInspections = (params?: any) => {
    return useQuery({
        queryKey: ['inspections', params],
        queryFn: () => ohsService.getInspections(params),
    });
};

export const useRisks = () => {
    return useQuery({
        queryKey: ['risks'],
        queryFn: () => ohsService.getRisks(),
    });
};

export const useHazards = () => {
    return useQuery({
        queryKey: ['hazards'],
        queryFn: () => ohsService.getHazards(),
    });
};

export const useJSAs = () => {
    return useQuery({
        queryKey: ['jsas'],
        queryFn: () => ohsService.getJSAs(),
    });
};

export const useOHSStats = () => {
    return useQuery({
        queryKey: ['ohs-stats'],
        queryFn: () => ohsService.getStats(),
    });
};
