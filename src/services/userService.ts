import api from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    employeeNumber?: string;
    departmentId?: string;
    provinceId?: string;
    department?: {
        id: string;
        name: string;
    };
    province?: {
        id: string;
        name: string;
    };
    ticketCount?: number;
}

class UserService {
    async listFiltered(params: { provinceId?: string; departmentId?: string; role?: string }): Promise<User[]> {
        const response = await api.get<User[]>('/users/filter', { params });
        return response.data;
    }
}

export default new UserService();
