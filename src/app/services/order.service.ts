import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, Supplier, Customer, Carrier } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    private getHeaders() {
        return new HttpHeaders({
            'X-Parse-Application-Id': (environment as any).appId,
            'X-Parse-REST-API-Key': (environment as any).restApiKey,
            'Content-Type': 'application/json'
        });
    }

    private mapNode(item: any): any {
        return {
            ...item,
            id: item.objectId
        };
    }

    getSuppliers(): Observable<Supplier[]> {
        return this.http.get<{ results: any[] }>(`${this.apiUrl}/Supplier`, { headers: this.getHeaders() }).pipe(
            map(res => res.results.map(item => this.mapNode(item)))
        );
    }

    createSupplier(data: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<any>(`${this.apiUrl}/Supplier`, data, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    updateSupplier(id: string, data: Partial<Supplier>): Observable<Supplier> {
        const { objectId, createdAt, updatedAt, id: _, ...updateData } = data as any;
        return this.http.put<any>(`${this.apiUrl}/Supplier/${id}`, updateData, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    deleteSupplier(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Supplier/${id}`, { headers: this.getHeaders() });
    }

    uploadSupplierLogo(supplierId: string, file: File): Observable<any> {
        return new Observable(observer => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result as string;
                // Usando Base64 para contornar a restrição de "Public File Upload" do Back4App
                this.updateSupplier(supplierId, { logo_filename: base64 } as any).subscribe({
                    next: res => {
                        observer.next(res);
                        observer.complete();
                    },
                    error: err => {
                        console.error('Erro ao salvar Base64:', err);
                        observer.error(err);
                    }
                });
            };
            reader.onerror = error => observer.error(error);
        });
    }

    getCustomers(): Observable<Customer[]> {
        return this.http.get<{ results: any[] }>(`${this.apiUrl}/Customer`, { headers: this.getHeaders() }).pipe(
            map(res => res.results.map(item => this.mapNode(item)))
        );
    }

    createCustomer(data: Partial<Customer>): Observable<Customer> {
        return this.http.post<any>(`${this.apiUrl}/Customer`, data, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    updateCustomer(id: string, data: Partial<Customer>): Observable<Customer> {
        const { objectId, createdAt, updatedAt, id: _, ...updateData } = data as any;
        return this.http.put<any>(`${this.apiUrl}/Customer/${id}`, updateData, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    deleteCustomer(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Customer/${id}`, { headers: this.getHeaders() });
    }

    getCarriers(): Observable<Carrier[]> {
        return this.http.get<{ results: any[] }>(`${this.apiUrl}/Carrier`, { headers: this.getHeaders() }).pipe(
            map(res => res.results.map(item => this.mapNode(item)))
        );
    }

    createCarrier(data: Partial<Carrier>): Observable<Carrier> {
        return this.http.post<any>(`${this.apiUrl}/Carrier`, data, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    updateCarrier(id: string, data: Partial<Carrier>): Observable<Carrier> {
        const { objectId, createdAt, updatedAt, id: _, ...updateData } = data as any;
        return this.http.put<any>(`${this.apiUrl}/Carrier/${id}`, updateData, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    deleteCarrier(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Carrier/${id}`, { headers: this.getHeaders() });
    }

    getOrders(filters?: any): Observable<Order[]> {
        let params = new HttpParams().set('order', '-createdAt').set('limit', '100');

        if (filters && Object.keys(filters).length > 0) {
            params = params.set('where', JSON.stringify(filters));
        }

        return this.http.get<{ results: any[] }>(`${this.apiUrl}/Order`, {
            headers: this.getHeaders(),
            params
        }).pipe(
            map(res => res.results.map(item => this.mapNode(item)))
        );
    }

    getOrder(id: string): Observable<Order> {
        return this.http.get<any>(`${this.apiUrl}/Order/${id}`, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    getNextOrderNumber(supplierId: string, customerId: string): Observable<{ nextNumber: string }> {
        // Lógica de "Próximo Número" no Parse precisa ser feita via Cloud Function ou Query
        // Por enquanto, vamos retornar um timestamp como fallback ou buscar o último
        let params = new HttpParams()
            .set('where', JSON.stringify({ supplierId, customerId }))
            .set('order', '-orderNumber')
            .set('limit', '1');

        return this.http.get<{ results: any[] }>(`${this.apiUrl}/Order`, {
            headers: this.getHeaders(),
            params
        }).pipe(
            map(res => {
                if (res.results.length > 0) {
                    const lastNum = parseInt(res.results[0].orderNumber);
                    return { nextNumber: (lastNum + 1).toString() };
                }
                return { nextNumber: '101' };
            })
        );
    }

    findOrder(orderNumber: string, supplierId: string, customerId: string): Observable<Order> {
        const where = { orderNumber, supplierId, customerId };
        let params = new HttpParams().set('where', JSON.stringify(where)).set('limit', '1');

        return this.http.get<{ results: any[] }>(`${this.apiUrl}/Order`, {
            headers: this.getHeaders(),
            params
        }).pipe(
            map(res => res.results.length > 0 ? this.mapNode(res.results[0]) : null),
            map(order => {
                if (!order) throw new Error('Pedido não encontrado');
                return order;
            })
        );
    }

    createOrder(order: Order): Observable<Order> {
        return this.http.post<any>(`${this.apiUrl}/Order`, order, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    updateOrder(id: string, order: Order): Observable<Order> {
        const { objectId, createdAt, updatedAt, id: _, ...updateData } = order as any;
        return this.http.put<any>(`${this.apiUrl}/Order/${id}`, updateData, { headers: this.getHeaders() }).pipe(
            map(item => this.mapNode(item))
        );
    }

    deleteOrder(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/Order/${id}`, { headers: this.getHeaders() });
    }
}
