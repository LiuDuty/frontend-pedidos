import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, Supplier, Customer } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getSuppliers(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(`${this.apiUrl}/suppliers`);
    }

    getCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
    }

    getNextOrderNumber(supplierId: number, customerId: number): Observable<{ nextNumber: string }> {
        return this.http.get<{ nextNumber: string }>(`${this.apiUrl}/orders/next-number`, {
            params: { supplierId, customerId }
        });
    }

    findOrder(orderNumber: string, supplierId: number, customerId: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/orders/find`, {
            params: { orderNumber, supplierId, customerId }
        });
    }

    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(`${this.apiUrl}/orders`, order);
    }

    updateOrder(id: number, order: Order): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/orders/${id}`, order);
    }

    deleteOrder(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/orders/${id}`);
    }
}
