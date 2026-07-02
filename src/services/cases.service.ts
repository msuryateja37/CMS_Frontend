import api from './api';

export interface CreateCaseDto {
  type?: string;
  categoryId?: string;
  severity?: string;
  severityLevel?: string;
  priorityLevel?: string;
  description?: string;
  occurredAt?: string;
  dueDate?: string;
  instructions?: string;
  buildingId?: string;
  departmentId?: string;
  provinceId?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  peopleImpacted?: number;
  impactedPeople?: Array<{
    id?: string;
    name: string;
    email: string;
    phone?: string;
  }>;
  immediateActions?: string[];
  otherActions?: string;
  status?: string;
  media?: Array<{ url: string; type: string }>;
}

export interface Case {
  id: string;
  incidentNumber: string;
  type: string;
  severity?: string;
  severityLevel?: string;
  priorityLevel?: string;
  status: string;
  description?: string;
  occurredAt?: string;
  dueDate?: string;
  isEscalated: boolean;
  createdAt: string;
  updatedAt: string;
  category: string; // Changed from object to string
  reportedBy?: {
    id: string;
    fullName: string; // Backend sends 'name' but renamed to fullName? No, backend sends name. Frontend likely maps it or service needs update.
    // Wait, backend 'reportedBy' uses User which has 'name'. Frontend uses 'fullName'.
    // Let's check backend return. Backend returns 'name'. 
    // We should probably stick to what backend sends 'name', 'email'.
    // But existing frontend code uses fullName. I should probably keep it compatible or update frontend code.
    // Let's check backend 'getById' -> includes reportedBy: true. User model has 'name'.
    // So backend returns 'name'. Frontend expects 'fullName'.
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string; // User model has name
    email: string;
  };
  building?: {
    id: string;
    name: string;
    province?: { // Nested province
      id: string;
      name: string;
    };
  };
  department?: {
    id: string;
    name: string;
  };
  location?: string;
  // Province is nested in building in our new backend logic, but might be direct if updated.
  // Backend getById doesn't include direct province relation (User has it, Building has it).
  // We'll use building.province.

  peopleImpacted?: number;
  latitude?: number;
  longitude?: number;
  immediateActions?: string;
  otherActions?: string;
  evidence?: CaseEvidence[]; // Mapped from media
  correctiveActions?: Array<{
    id: string;
    actionText: string;
    status?: string;
    dueDate?: string | null;
    completedAt?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt?: string;
  }>;
  approvals?: CaseApproval[];

  incidentPlan?: string;

  // For Timeline
  statusLogs?: Array<{
    id: string;
    oldStatus: string;
    newStatus: string;
    changedAt: string;
    changedBy: {
      id: string;
      name: string;
    };
  }>;

  // Comments
  comments?: Array<{
    id: string;
    comment: string;
    user: { id: string; name: string; email?: string };
    createdAt: string;
  }>;
}

export interface CaseApprovalAttachment {
  id: string;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
  createdAt: string;
}

export interface CaseApproval {
  id: string;
  roleName: string;
  recommenderName?: string | null;
  recommendationText?: string | null;
  createdAt: string;
  updatedAt?: string;
  attachments: CaseApprovalAttachment[];
  uploadedBy?: { id: string; name: string; email?: string };
}

export interface CaseEvidence {
  id: string;
  fileUrl: string;
  fileType: string;
  uploaderRole?: string;
  fileName?: string;
  storagePath?: string;
  createdAt: string;
}

export interface IncidentCategory {
  id: string;
  name: string;
  caseType?: string;
  description?: string;
}

export interface KpiMetrics {
  totalCases: number;
  openCases: number;
  closedCases: number;
  resolvedCases: number;
  pendingCases: number;
  criticalCases: number;
  escalatedCases: number;
  avgResolutionTime?: number;
}

class CasesService {
  /**
   * Create a new case/incident
   */
  async createCase(data: CreateCaseDto): Promise<Case> {
    const response = await api.post<Case>('/cases', data);
    return response.data;
  }

  /**
   * Get all cases with optional filters
   */
  async getCases(params?: {
    status?: string;
    buildingId?: string;
    departmentId?: string;
    categoryId?: string;
    provinceId?: string;
    isEscalated?: boolean;
    priorityLevel?: string;
    assignedToId?: string;
    reported_by?: string;
    type?: string;
    take?: number;
    skip?: number;
  }): Promise<{ data: Case[]; total: number }> {
    const response = await api.get<{ data: Case[]; total: number }>('/cases', { params });
    return response.data;
  }

  /**
   * Get case by ID
   */
  async getCaseById(id: string): Promise<Case> {
    const response = await api.get<Case>(`/cases/${id}`);
    return response.data;
  }

  /**
   * Get KPI metrics
   */
  async getKpiMetrics(): Promise<KpiMetrics> {
    const response = await api.get<KpiMetrics>('/cases/metrics/kpi');
    return response.data;
  }

  /**
   * Get all incident categories
   */
  async getCategories(): Promise<IncidentCategory[]> {
    const response = await api.get<IncidentCategory[]>('/cases/categories/list');
    return response.data;
  }

  /**
   * Update case status
   */
  async updateStatus(id: string, status: string): Promise<Case> {
    const response = await api.put<Case>(`/cases/${id}/status`, { status });
    return response.data;
  }

  /**
   * Update case details (general)
   */
  async update(id: string, data: any): Promise<Case> {
    const response = await api.put<Case>(`/cases/${id}`, data);
    return response.data;
  }

  /**
   * Assign case to user
   */
  async assignCase(id: string, assignedToId: string): Promise<Case> {
    const response = await api.put<Case>(`/cases/${id}/assign`, { assignedToId });
    return response.data;
  }

  /**
   * OHS practitioner pulls a case out of their province pool.
   */
  async pickupCase(id: string): Promise<Case> {
    const response = await api.put<Case>(`/cases/${id}/pickup`);
    return response.data;
  }

  /**
   * Close case
   */
  async closeCase(id: string): Promise<Case> {
    const response = await api.put<Case>(`/cases/${id}/close`);
    return response.data;
  }

  /**
   * Add evidence to case
   */
  async addEvidence(id: string, evidenceData: any): Promise<any> {
    const response = await api.post(`/cases/${id}/evidence`, evidenceData);
    return response.data;
  }

  /**
   * Get case activity timeline
   */
  async getActivityTimeline(id: string): Promise<any[]> {
    const response = await api.get(`/cases/${id}/activity-timeline`);
    return response.data;
  }

  /**
   * Add activity to case
   */
  async addActivity(id: string, activityType: string, description: string): Promise<any> {
    const response = await api.post(`/cases/${id}/activity`, {
      activityType,
      description,
    });
    return response.data;
  }

  async addCorrectiveAction(id: string, actionText: string): Promise<any> {
    const response = await api.post(`/cases/${id}/corrective-actions`, { actionText });
    return response.data;
  }

  async updateCorrectiveAction(
    id: string,
    actionId: string,
    data: {
      actionText?: string;
      status?: string;
      dueDate?: string | null;
      notes?: string | null;
      completedAt?: string | null;
    },
  ): Promise<any> {
    const response = await api.patch(
      `/cases/${id}/corrective-actions/${actionId}`,
      data,
    );
    return response.data;
  }

  /**
   * Add approval / recommendation record (one or more files per submission).
   */
  async addApproval(
    id: string,
    approvalData: {
      roleName: string;
      recommenderName?: string;
      recommendationText?: string;
      files: Array<{ fileUrl: string; fileName?: string; fileType?: string }>;
    },
  ): Promise<CaseApproval> {
    const response = await api.post<CaseApproval>(`/cases/${id}/approvals`, approvalData);
    return response.data;
  }

  async updateApproval(
    id: string,
    approvalId: string,
    data: { recommenderName?: string; recommendationText?: string },
  ): Promise<CaseApproval> {
    const response = await api.put<CaseApproval>(
      `/cases/${id}/approvals/${approvalId}`,
      data,
    );
    return response.data;
  }

  async addApprovalAttachment(
    id: string,
    approvalId: string,
    body: { fileUrl: string; fileName?: string; fileType?: string },
  ): Promise<CaseApprovalAttachment> {
    const response = await api.post<CaseApprovalAttachment>(
      `/cases/${id}/approvals/${approvalId}/attachments`,
      body,
    );
    return response.data;
  }

  async deleteApprovalAttachment(
    id: string,
    approvalId: string,
    attachmentId: string,
  ): Promise<void> {
    await api.delete(
      `/cases/${id}/approvals/${approvalId}/attachments/${attachmentId}`,
    );
  }

  async deleteApproval(id: string, approvalId: string): Promise<void> {
    await api.delete(`/cases/${id}/approvals/${approvalId}`);
  }

  /**
   * Add a comment to a case
   */
  async addComment(id: string, comment: string): Promise<any> {
    const response = await api.post(`/cases/${id}/comments`, { comment });
    return response.data;
  }

  /**
   * Get comments for a case
   */
  async getComments(id: string): Promise<any[]> {
    const response = await api.get(`/cases/${id}/comments`);
    return response.data;
  }

  /**
   * Escalate case to a peer practitioner
   */
  async escalateCase(id: string, assignedToId: string, reason: string): Promise<Case> {
    const response = await api.put<Case>(`/cases/${id}/escalate`, { assignedToId, reason });
    return response.data;
  }

  /**
   * Get SLA tracking data
   */
  async getSlaTracking(): Promise<any[]> {
    const response = await api.get('/cases/sla/tracking');
    return response.data;
  }

  /**
   * Upload file to Azure Blob Storage via backend
   */
  async uploadFile(file: File, incidentId?: string): Promise<{ url: string; name: string; size: number; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const url = incidentId ? `/cases/upload?incidentId=${incidentId}` : '/cases/upload';
    const response = await api.post<{ url: string; name: string; size: number; type: string }>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get Annexure 1 details for a case
   */
  async getAnnexureOne(id: string): Promise<any> {
    const response = await api.get(`/cases/${id}/annexure1`);
    return response.data;
  }

  /**
   * Update/save Annexure 1 details for a case
   */
  async updateAnnexureOne(id: string, data: any): Promise<any> {
    const response = await api.put(`/cases/${id}/annexure1`, data);
    return response.data;
  }
}

export default new CasesService();
