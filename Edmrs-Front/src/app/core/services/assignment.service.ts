import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { asAssignments } from '../models/api-map';
import { AssignmentRecord } from '../models/warehouse.model';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/employeeprojects`;

  getAll(): Observable<AssignmentRecord[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(map((body) => asAssignments(body)));
  }

  getByProject(projectId: number): Observable<AssignmentRecord[]> {
    return this.http.get<unknown>(`${this.apiUrl}/project/${projectId}`).pipe(map((body) => asAssignments(body)));
  }

  assign(body: {
    employeeID: number;
    projectID: number;
    role: string;
    allocationPercentage: number;
    startDate: string;
    endDate: string | null;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/assign`, body);
  }
}
