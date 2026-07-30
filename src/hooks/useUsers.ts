import { useQuery } from '@tanstack/react-query';
import userService from '../services/userService';
import { useAuthStore } from '../store/auth.store';

export const useUsers = (filters?: any) => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['users', user?.id, filters],
        queryFn: () => userService.listFiltered(filters || {}),
        enabled: !!user?.id && (filters === undefined || Object.keys(filters).length > 0),
    });
};
