import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeFilterParams } from '../models/employee.model';
import { PagedResult } from '../models/common.model';
import { asEmployeePage } from '../models/api-map';
import { ApiPage, EmployeeRecord } from '../models/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http: HttpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/employees`;

  getDirectory(pageSize = 100, pageIndex = 1): Observable<ApiPage<EmployeeRecord>> {
    const params = new HttpParams().set('pageIndex', String(pageIndex)).set('pageSize', String(pageSize));
    return this.http.get<unknown>(this.apiUrl, { params }).pipe(map((body) => asEmployeePage(body)));
  }

  getAllDirectory(): Observable<EmployeeRecord[]> {
    return this.getDirectory(100, 1).pipe(
      switchMap((first) => {
        const pages = Math.max(first.totalPages ?? 1, 1);
        if (pages === 1) {
          return of(first.items ?? []);
        }
        const rest = Array.from({ length: pages - 1 }, (_, index) => this.getDirectory(100, index + 2));
        return forkJoin(rest).pipe(map((more) => [first, ...more].flatMap((page) => page.items ?? [])));
      })
    );
  }

  addEmployee(body: {
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    hireDate: string;
    salary: number;
    departmentID: number;
    positionID: number;
    locationID: number;
  }): Observable<EmployeeRecord> {
    return this.http.post<EmployeeRecord>(this.apiUrl, body);
  }

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