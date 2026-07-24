import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0, // Always consider query stale so fresh data is fetched on mount
            gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnMount: 'always',
        },
    },
});

export const clearAppCache = () => {
    queryClient.clear();
};
