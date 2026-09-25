import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ViewerMetrics {
  totalReports: number;
  recentAnnouncements: number;
  systemStatus: 'Optimal' | 'Maintenance' | 'Degraded';
  activeProjects: number;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  category: 'Update' | 'Alert' | 'Maintenance';
  publishedDate: string;
  content: string;
  author: string;
}

export interface SharedReport {
  id: string;
  title: string;
  department: string;
  updatedAt: string;
  fileSize: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/viewer';

  getMetrics(): Observable<ViewerMetrics> {
    return this.http.get<ViewerMetrics>(`${this.apiUrl}/metrics`);
  }

  getAnnouncements(): Observable<SystemAnnouncement[]> {
    return this.http.get<SystemAnnouncement[]>(`${this.apiUrl}/announcements`);
  }

  getReports(): Observable<SharedReport[]> {
    return this.http.get<SharedReport[]>(`${this.apiUrl}/reports`);
  }
}