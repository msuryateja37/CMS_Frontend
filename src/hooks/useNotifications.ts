import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(s => s.user);

    const notificationsQuery = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => notificationService.getNotifications(),
        enabled: !!user?.id,
        refetchInterval: 5000,
    });

    const unreadCountQuery = useQuery({
        queryKey: ['notifications', 'unread-count', user?.id],
        queryFn: () => notificationService.getUnreadCount(),
        enabled: !!user?.id,
        refetchInterval: 5000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.setQueryData(['notifications', 'unread-count', user?.id], 0);
        },
    });

    return {
        notifications: notificationsQuery.data || [],
        unreadCount: unreadCountQuery.data || 0,
        isLoading: notificationsQuery.isLoading,
        isError: notificationsQuery.isError,
        fetchNotifications: () => notificationsQuery.refetch(),
        markAsRead: markAsReadMutation.mutateAsync,
        markAllAsRead: markAllAsReadMutation.mutateAsync,
    };
};
