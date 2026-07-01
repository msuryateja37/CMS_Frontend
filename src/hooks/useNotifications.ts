import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notification.service';

export const useNotifications = () => {
    const queryClient = useQueryClient();

    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
        refetchInterval: 5000, // Refetch every 5 seconds for immediate popups
    });

    const unreadCountQuery = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => notificationService.getUnreadCount(),
        refetchInterval: 5000, // Refetch every 5 seconds
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
            queryClient.setQueryData(['notifications', 'unread-count'], 0);
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
