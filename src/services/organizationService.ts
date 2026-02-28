import api from './api';

export interface Province {
    id: string;
    name: string;
}

export interface Building {
    id: string;
    name: string;
    provinceId: string;
    postalCode?: string;
    address?: string;
}

export interface Department {
    id: string;
    name: string;
    buildingId: string;
}

class OrganizationService {
    /**
     * Get all provinces
     */
    async getProvinces(): Promise<Province[]> {
        const response = await api.get<Province[]>('/org/provinces');
        return response.data;
    }

    /**
     * Get buildings, optionally filtered by provinceId
     */
    async getBuildings(provinceId?: string): Promise<Building[]> {
        const params = provinceId ? { provinceId } : {};
        const response = await api.get<Building[]>('/org/buildings', { params });
        return response.data;
    }

    /**
     * Get departments, optionally filtered by buildingId
     */
    async getDepartments(buildingId?: string): Promise<Department[]> {
        const params = buildingId ? { buildingId } : {};
        const response = await api.get<Department[]>('/org/departments', { params });
        return response.data;
    }
}

export default new OrganizationService();
