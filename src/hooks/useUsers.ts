import { useQuery } from '@tanstack/react-query';
import userService from '../services/userService';

export const useUsers = (filters?: any) => {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: () => userService.listFiltered(filters),
    });
};
