
import api from './api';

export const kpiService = {
    async getDashboardMetrics() {
        const response = await api.get('/kpi/metrics/dashboard');
        return response.data;
    },

    async getMetricsByPriority() {
        const response = await api.get('/kpi/metrics/priority');
        return response.data;
    }
};
