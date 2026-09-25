import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { asProjectPage } from '../models/api-map';
import { ApiPage, ProjectRecord } from '../models/warehouse.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  getProjects(pageSize = 100, pageIndex = 1): Observable<ApiPage<ProjectRecord>> {
    const params = new HttpParams().set('pageIndex', String(pageIndex)).set('pageSize', String(pageSize));
    return this.http.get<unknown>(this.apiUrl, { params }).pipe(map((body) => asProjectPage(body)));
  }

  createProject(body: {
    projectCode: string;
    projectName: string;
    clientID: number;
    departmentID: number;
    startDate: string;
    endDate: string | null;
    budget: number;
    status: string;
  }): Observable<ProjectRecord> {
    return this.http.post<ProjectRecord>(this.apiUrl, body);
  }

  updateProject(
    id: number,
    body: { projectName: string; endDate: string | null; status: string }
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, {
      projectName: body.projectName,
      projectCode: '',
      clientID: 0,
      departmentID: 0,
      startDate: '0001-01-01',
      endDate: body.endDate,
      budget: 0,
      status: body.status
    });
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllProjects(): Observable<ProjectRecord[]> {
    return this.getProjects(100, 1).pipe(
      switchMap((first) => {
        const pages = Math.max(first.totalPages ?? 1, 1);
        if (pages === 1) {
          return of(first.items ?? []);
        }
        const rest = Array.from({ length: pages - 1 }, (_, index) => this.getProjects(100, index + 2));
        return forkJoin(rest).pipe(map((more) => [first, ...more].flatMap((page) => page.items ?? [])));
      })
    );
  }
}
