import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeFilterParams } from '../models/employee.model';
import { PagedResult } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http: HttpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7001/api/employees';

  getEmployees(params: EmployeeFilterParams): Observable<PagedResult<Employee>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.departmentId) {
      httpParams = httpParams.set('departmentId', params.departmentId.toString());
    }

    return this.http.get<PagedResult<Employee>>(this.apiUrl, { params: httpParams });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}