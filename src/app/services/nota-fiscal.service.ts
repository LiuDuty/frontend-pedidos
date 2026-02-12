import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
        const url = search ? `${this.apiUrl}?search=${search}` : this.apiUrl;
        return this.http.get<NotaFiscal[]>(url);
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
