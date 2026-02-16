import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { NotaFiscal } from '../models/nota-fiscal.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotaFiscalService {
    private apiUrl = `${environment.apiUrl}/NotaFiscal`;
    private http = inject(HttpClient);

    private getHeaders() {
        return new HttpHeaders({
            'X-Parse-Application-Id': (environment as any).appId,
            'X-Parse-REST-API-Key': (environment as any).restApiKey,
            'Content-Type': 'application/json'
        });
    }

    getAll(search?: string): Observable<NotaFiscal[]> {
        let params = new HttpParams();

        if (search) {
            // Lógica de busca do Parse (Procura em múltiplos campos)
            const where = {
                "$or": [
                    { "cliente": { "$regex": search, "$options": "i" } },
                    { "produto": { "$regex": search, "$options": "i" } },
                    { "nf": { "$regex": search, "$options": "i" } }
                ]
            };
            params = params.set('where', JSON.stringify(where));
        }

        // Ordenar por data de criação decrescente
        params = params.set('order', '-createdAt');
        // Limite maior para exibir mais dados
        params = params.set('limit', '1000');

        return this.http.get<{ results: any[] }>(this.apiUrl, {
            headers: this.getHeaders(),
            params
        }).pipe(
            map(response => response.results.map(item => this.mapNode(item)))
        );
    }

    private mapNode(item: any): NotaFiscal {
        return {
            ...item,
            id: item.objectId, // Mapeia objectId para id
            created_at: item.createdAt // Mapeia createdAt para created_at
        };
    }

    getById(id: string): Observable<NotaFiscal> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    create(nota: NotaFiscal): Observable<any> {
        return this.http.post(this.apiUrl, nota, { headers: this.getHeaders() });
    }

    update(id: string, nota: NotaFiscal): Observable<any> {
        // Remove campos internos do Parse antes de enviar update
        const { objectId, createdAt, updatedAt, id: _, ...data } = nota as any;
        return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
