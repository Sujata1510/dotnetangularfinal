import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LookupDto } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http: HttpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7001/api/lookups';

  getDepartments(): Observable<LookupDto[]> {
    return this.http.get<LookupDto[]>(`${this.apiUrl}/departments`);
  }

  getPositions(): Observable<LookupDto[]> {
    return this.http.get<LookupDto[]>(`${this.apiUrl}/positions`);
  }

  getLocations(): Observable<LookupDto[]> {
    return this.http.get<LookupDto[]>(`${this.apiUrl}/locations`);
  }

  getClients(): Observable<LookupDto[]> {
    return this.http.get<LookupDto[]>(`${this.apiUrl}/clients`);
  }
}