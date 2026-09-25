import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { asLookupList } from '../models/api-map';
import { LookupDto } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http: HttpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/lookups`;

  getDepartments(): Observable<LookupDto[]> {
    return this.http.get<unknown>(`${this.apiUrl}/departments`).pipe(map((body) => asLookupList(body)));
  }

  getPositions(): Observable<LookupDto[]> {
    return this.http.get<unknown>(`${this.apiUrl}/positions`).pipe(map((body) => asLookupList(body)));
  }

  getLocations(): Observable<LookupDto[]> {
    return this.http.get<unknown>(`${this.apiUrl}/locations`).pipe(map((body) => asLookupList(body)));
  }

  getClients(): Observable<LookupDto[]> {
    return this.http.get<unknown>(`${this.apiUrl}/clients`).pipe(map((body) => asLookupList(body)));
  }
}