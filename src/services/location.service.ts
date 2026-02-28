import api from './api';

export interface Province {
    id: string;
    name: string;
}

export interface Building {
    id: string;
    name: string;
    address?: string;
    postalCode?: string;
    provinceId: string;
}

export interface  User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    departmentId?: string;
    provinceId?: string;
    department?: {
        id: string;
        name: string;
    };
}

class LocationService {
    /**
     * Get all provinces
     */
    async getProvinces(): Promise<Province[]> {
        const response = await api.get<Province[]>('/org/provinces');
        return response.data;
    }

    /**
     * Get buildings by province ID
     */
    async getBuildingsByProvince(provinceId: string): Promise<Building[]> {
        const response = await api.get<Building[]>(`/org/provinces/${provinceId}/buildings`);
        return response.data;
    }

    /**
     * Get all buildings
     */
    async getAllBuildings(): Promise<Building[]> {
        const response = await api.get<Building[]>('/org/buildings');
        return response.data;
    }

    /**
     * Get users by province ID
     */
    async getUsersByProvince(provinceId: string): Promise<User[]> {
        const response = await api.get<User[]>(`/users/province/${provinceId}`);
        return response.data;
    }

    /**
     * Get all users
     */
    async getAllUsers(): Promise<User[]> {
        const response = await api.get<any>('/users');
        // The backend returns paginated data, so we need to extract items
        return response.data.items || response.data;
    }
}

export default new LocationService();
