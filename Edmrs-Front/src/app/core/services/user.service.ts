import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRecord } from '../models/warehouse.model';

type Row = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<UserRecord[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(map((body) => asUsers(body)));
  }

  addUser(body: { fullName: string; email: string; password: string; role: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, body);
  }

  updateUser(id: number, body: { fullName: string; email: string; role: string }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, body);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/active`, { isActive });
  }
}

function asUsers(raw: unknown): UserRecord[] {
  return (Array.isArray(raw) ? raw : []).map((item) => {
    const row = item as Row;
    return {
      id: Number(row['id'] ?? row['Id'] ?? 0),
      fullName: String(row['fullName'] ?? row['FullName'] ?? ''),
      email: String(row['email'] ?? row['Email'] ?? ''),
      role: String(row['role'] ?? row['Role'] ?? ''),
      isActive: Boolean(row['isActive'] ?? row['IsActive']),
      createdDate: String(row['createdDate'] ?? row['CreatedDate'] ?? '')
    };
  });
}
