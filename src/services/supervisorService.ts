import api from './api';
import authService from './auth.service';
import type { Case } from './cases.service';

export interface SupervisorStats {
    pendingReview: number;
    escalatedToInvestigation: number;
    resolvedThisMonth: number;
    slaAtRisk: number;
    casesByType: {
        grievances: number;
        disciplinary: number;
    };
    avgResponseTime: number;
}

class SupervisorService {
    /**
     * Get cases assigned to supervisor for review
     * Filters cases assigned to the current authenticated supervisor
     */
    async getCasesForReview(params?: {
        status?: string;
        priorityLevel?: string;
        type?: string;
        categoryId?: string;
        take?: number;
        skip?: number;
    }): Promise<{ data: Case[]; total: number }> {
        // Get current user from token via backend
        const currentUser = await authService.getCurrentUser();

        const response = await api.get<{ data: Case[]; total: number }>('/cases', {
            params: {
                ...params,
                assignedToId: currentUser.id, // Filter by current supervisor
            },
        });
        return response.data;
    }

    /**
     * Get supervisor dashboard statistics
     */
    async getSupervisorStats(): Promise<SupervisorStats> {
        try {
            // Get KPI metrics from backend
            const metricsResponse = await api.get('/cases/metrics/kpi');
            const metrics = metricsResponse.data;

            // Get all cases to calculate supervisor-specific stats
            const casesResponse = await api.get<{ data: Case[]; total: number }>('/cases');
            const { data: cases } = casesResponse.data;

            // Calculate stats
            const pendingReview = cases.filter(
                (c) => c.status === 'OPEN' || c.status === 'UNDER_REVIEW'
            ).length;

            const escalatedToInvestigation = cases.filter((c) => c.isEscalated).length;

            // Cases resolved this month
            const thisMonth = new Date();
            thisMonth.setDate(1);
            const resolvedThisMonth = cases.filter((c) => {
                return (
                    c.status === 'CLOSED' &&
                    new Date(c.updatedAt) >= thisMonth
                );
            }).length;

            // SLA at risk (cases past due date)
            const now = new Date();
            const slaAtRisk = cases.filter((c) => {
                if (!c.dueDate) return false;
                return new Date(c.dueDate) < now && c.status !== 'CLOSED';
            }).length;

            // Cases by type
            const grievances = cases.filter((c) => c.type === 'GRIEVANCE').length;
            const disciplinary = cases.filter((c) => c.type === 'DISCIPLINARY').length;

            return {
                pendingReview,
                escalatedToInvestigation,
                resolvedThisMonth,
                slaAtRisk,
                casesByType: {
                    grievances,
                    disciplinary,
                },
                avgResponseTime: metrics.avgResponseTime || 2.3,
            };
        } catch (error) {
            console.error('Error fetching supervisor stats:', error);
            throw error;
        }
    }


    // Resolve a case

    async resolveCase(caseId: string): Promise<Case> {
        const response = await api.put<Case>(`/cases/${caseId}/close`);
        return response.data;
    }


    // Escalate a case

    async escalateCase(caseId: string): Promise<Case> {
        const response = await api.put<Case>(`/cases/${caseId}/escalate`);
        return response.data;
    }


    //Update case status

    async updateCaseStatus(caseId: string, status: string): Promise<Case> {
        const response = await api.put<Case>(`/cases/${caseId}/status`, { status });
        return response.data;
    }
}

export default new SupervisorService();
