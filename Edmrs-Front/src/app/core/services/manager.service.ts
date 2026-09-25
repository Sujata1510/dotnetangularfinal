import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ManagerMetrics {
  teamSize: number;
  pendingApprovals: number;
  completedTasksThisMonth: number;
  overallPerformanceScore: number;
}

export interface PendingApproval {
  id: string;
  employeeName: string;
  requestType: 'Leave Request' | 'Data Change' | 'Report Access' | 'Equipment';
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/manager';

  getMetrics(): Observable<ManagerMetrics> {
    return this.http.get<ManagerMetrics>(`${this.apiUrl}/metrics`);
  }

  getPendingApprovals(): Observable<PendingApproval[]> {
    return this.http.get<PendingApproval[]>(`${this.apiUrl}/approvals`);
  }

  processApproval(approvalId: string, status: 'Approved' | 'Rejected'): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/approvals/${approvalId}`, { status });
  }
}