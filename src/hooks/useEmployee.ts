import { useQuery } from '@tanstack/react-query';
import employeeService from '../services/employeeService';
import { useAuthStore } from '../store/auth.store';

export const useEmployeeStats = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['employee-stats', user?.id],
        queryFn: () => employeeService.getEmployeeStats(),
        enabled: !!user?.id,
    });
};

export const useMyCases = (params?: {
    take?: number;
    skip?: number;
    status?: string;
    categoryId?: string;
    severity?: string;
}) => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['my-cases', user?.id, params],
        queryFn: () => employeeService.getMyCases(params),
        enabled: !!user?.id,
    });
};
