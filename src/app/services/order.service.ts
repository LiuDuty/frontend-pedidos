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

    createSupplier(data: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.apiUrl}/suppliers`, data);
    }

    updateSupplier(id: number, data: Partial<Supplier>): Observable<Supplier> {
        return this.http.put<Supplier>(`${this.apiUrl}/suppliers/${id}`, data);
    }

    deleteSupplier(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/suppliers/${id}`);
    }

    uploadSupplierLogo(supplierId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('logo', file);
        return this.http.post(`${this.apiUrl}/suppliers/${supplierId}/logo`, formData);
    }

    getCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
    }

    createCustomer(data: Partial<Customer>): Observable<Customer> {
        return this.http.post<Customer>(`${this.apiUrl}/customers`, data);
    }

    updateCustomer(id: number, data: Partial<Customer>): Observable<Customer> {
        return this.http.put<Customer>(`${this.apiUrl}/customers/${id}`, data);
    }

    deleteCustomer(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/customers/${id}`);
    }

    getOrders(filters?: any): Observable<Order[]> {
        const params = { ...filters, _t: new Date().getTime() };
        return this.http.get<Order[]>(`${this.apiUrl}/orders`, { params });
    }

    getOrder(id: string | number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
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

    updateOrder(id: string | number, order: Order): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/orders/${id}`, order);
    }

    deleteOrder(id: string | number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/orders/${id}`);
    }
}
