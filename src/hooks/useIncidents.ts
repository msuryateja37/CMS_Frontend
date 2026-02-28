import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import casesService from '../services/cases.service';
import type { CreateCaseDto } from '../services/cases.service';

export const useIncidents = (filters?: any) => {
    return useQuery({
        queryKey: ['incidents', filters],
        queryFn: () => casesService.getCases(filters),
    });
};

export const useCaseDetails = (id: string) => {
    return useQuery({
        queryKey: ['case', id],
        queryFn: () => casesService.getCaseById(id),
        enabled: !!id,
    });
};

export const useCreateCase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCaseDto) => casesService.createCase(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
        },
    });
};

export const useUpdateCaseStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            casesService.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
        },
    });
};

export const useAssignCase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, userId }: { id: string, userId: string }) =>
            casesService.assignCase(id, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
        },
    });
};
export const useCaseTimeline = (id: string) => {
    return useQuery({
        queryKey: ['case-timeline', id],
        queryFn: () => casesService.getActivityTimeline(id),
        enabled: !!id,
    });
};
