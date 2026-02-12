import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaFiscal } from '../models/nota-fiscal.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotaFiscalService {
    private apiUrl = `${environment.apiUrl}/notas-fiscais`;
    private http = inject(HttpClient);

    getAll(search?: string): Observable<NotaFiscal[]> {
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        let url = this.apiUrl;
        const params: string[] = [];

        if (search) params.push(`search=${search}`);
        // Cache buster
        params.push(`t=${new Date().getTime()}`);

        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        return this.http.get<NotaFiscal[]>(url, { headers });
    }

    getById(id: number): Observable<NotaFiscal> {
        return this.http.get<NotaFiscal>(`${this.apiUrl}/${id}`);
    }

    create(nota: NotaFiscal): Observable<NotaFiscal> {
        return this.http.post<NotaFiscal>(this.apiUrl, nota);
    }

    update(id: number, nota: NotaFiscal): Observable<NotaFiscal> {
        return this.http.put<NotaFiscal>(`${this.apiUrl}/${id}`, nota);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
