import api from './api';
import authService from './auth.service';
import type { Case, CreateCaseDto, IncidentCategory } from './cases.service';

export interface EmployeeStats {
    activeCases: number;
    pendingActions: number;
    resolvedCases: number;
    activeCasesChange: string;
    pendingActionsChange: string;
    resolvedCasesChange: string;
}

export interface EmployeeCase extends Case {
    // Employee-specific extensions can go here
}

export interface Hearing {
    id: string;
    caseId: string;
    incidentNumber: string;
    scheduledAt: string;
    location: string;
    type: string;
    status: string;
}

class EmployeeService {
    /**
     * Get employee dashboard statistics
     * Falls back to calculating from cases if endpoint doesn't exist
     */
    async getEmployeeStats(): Promise<EmployeeStats> {
        try {
            const response = await api.get<EmployeeStats>('/cases/employee/stats');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching employee stats:', error);
            return {
                activeCases: 0,
                pendingActions: 0,
                resolvedCases: 0,
                activeCasesChange: '0%',
                pendingActionsChange: '0%',
                resolvedCasesChange: '0%'
            };
        }
    }

    /**
     * Get cases created by the current employee
     * Uses the general /cases endpoint with filtering
     */
    async getMyCases(params?: {
        status?: string;
        type?: string;
        categoryId?: string;
        severity?: string;
        take?: number;
        skip?: number;
    }): Promise<{ data: EmployeeCase[]; total: number }> {
        try {
            // Get current user from storage instead of fetching from API again
            const currentUser = authService.getStoredUser();
            const response = await api.get<{ data: EmployeeCase[]; total: number }>('/cases', {
                params: {
                    ...params,
                    reported_by: currentUser?.id,
                    severity: params?.severity || undefined,
                    categoryId: params?.categoryId || undefined,
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching employee cases:', error);
            throw error;
        }
    }

    /**
     * Get a specific case by ID (employee must be the reporter)
     */
    async getCaseById(id: string): Promise<EmployeeCase> {
        try {
            const response = await api.get<EmployeeCase>(`/cases/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Fallback to general cases endpoint
                const response = await api.get<EmployeeCase>(`/cases/${id}`);
                return response.data;
            }
            throw error;
        }
    }

    /**
     * Submit a new case as an employee
     */
    async submitCase(data: CreateCaseDto): Promise<Case> {
        try {
            const response = await api.post<Case>('/cases', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Fallback to general cases endpoint
                const response = await api.post<Case>('/cases', data);
                return response.data;
            }
            throw error;
        }
    }

    /**
     * Get upcoming hearings for employee's cases
     * Falls back to mock data if endpoint doesn't exist
     */
    async getUpcomingHearings(): Promise<Hearing[]> {
        try {
            const response = await api.get<Hearing[]>('/cases/hearings/upcoming');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching hearings:', error);
            return [];
        }
    }

    /**
     * Get available categories for case submission
     */
    async getCategories(): Promise<IncidentCategory[]> {
        const response = await api.get<IncidentCategory[]>('/cases/categories/list');
        return response.data;
    }

    /**
     * Upload evidence/document for a case
     */
    async uploadEvidence(caseId: string, file: File, description?: string): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        if (description) {
            formData.append('description', description);
        }

        try {
            const response = await api.post(`/cases/${caseId}/evidence`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Fallback to general cases endpoint
                const response = await api.post(`/cases/${caseId}/evidence`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            }
            throw error;
        }
    }

    /**
     * Add a comment/note to a case
     */
    async addComment(caseId: string, comment: string): Promise<any> {
        try {
            const response = await api.post(`/cases/${caseId}/comments`, {
                comment,
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Fallback to general activity endpoint
                const response = await api.post(`/cases/${caseId}/activity`, {
                    activityType: 'COMMENT',
                    description: comment,
                });
                return response.data;
            }
            throw error;
        }
    }

    /**
     * Get case activity timeline
     */
    async getCaseTimeline(caseId: string): Promise<any[]> {
        try {
            const response = await api.get(`/cases/${caseId}/timeline`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Fallback to general activity timeline
                const response = await api.get(`/cases/${caseId}/activity-timeline`);
                return response.data;
            }
            throw error;
        }
    }
}

export default new EmployeeService();
