import api from './api';

export const operationsService = {
    async getEquipment() {
        const response = await api.get('/operations/equipment');
        return response.data;
    },

    async getInspections() {
        const response = await api.get('/operations/inspections');
        return response.data;
    },

    async getDrills() {
        const response = await api.get('/operations/drills');
        return response.data;
    },

    async getAudits() {
        const response = await api.get('/operations/audits');
        return response.data;
    },

    async getPermits() {
        const response = await api.get('/operations/permits');
        return response.data;
    }
};
