
import api from './api';

export const securityService = {
    async getStats() {
        const response = await api.get('/security/stats');
        return response.data;
    },

    async getIncidents() {
        const response = await api.get('/security/incidents');
        return response.data;
    },

    async getTrends() {
        const response = await api.get('/security/charts/trends');
        return response.data;
    },

    async getSeverity() {
        const response = await api.get('/security/charts/severity');
        return response.data;
    },

    async createIncident(data: any) {
        const response = await api.post('/security/incidents', data);
        return response.data;
    }
};
