import { Routes } from '@angular/router';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';

export const routes: Routes = [
    { path: '', redirectTo: 'order-form', pathMatch: 'full' },
    { path: 'order-form', component: OrderFormComponent },
    { path: 'order-form/:id', component: OrderFormComponent },
    { path: 'suppliers', component: SupplierListComponent },
    { path: 'customers', component: CustomerListComponent },
    { path: 'history', component: OrderHistoryComponent }
];
