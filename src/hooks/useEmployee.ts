import { useQuery } from '@tanstack/react-query';
import employeeService from '../services/employeeService';

export const useEmployeeStats = () => {
    return useQuery({
        queryKey: ['employee-stats'],
        queryFn: () => employeeService.getEmployeeStats(),
    });
};

export const useMyCases = (params?: {
    take?: number;
    skip?: number;
    status?: string;
    categoryId?: string;
    severity?: string;
}) => {
    return useQuery({
        queryKey: ['my-cases', params],
        queryFn: () => employeeService.getMyCases(params),
    });
};
