import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatCardModule, MatDividerModule
  ],
  template: `
<div class="container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Histórico de Pedidos</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <form [formGroup]="filterForm" (ngSubmit)="search()" class="filter-form">
        <div class="row">
          <mat-form-field appearance="outline" class="flex-grow">
            <mat-label>Pesquisar Pedido</mat-label>
            <input matInput formControlName="query" placeholder="Nº Pedido, Cliente ou Fornecedor...">
          </mat-form-field>
          <div class="btns">
            <button mat-raised-button color="primary" type="submit">Pesquisar</button>
            <button mat-button type="button" (click)="clear()">Limpar</button>
          </div>
        </div>
      </form>

      <mat-divider style="margin: 20px 0;"></mat-divider>

      <div class="results-info">
        <p>Total de registros: {{ orders().length }}</p>
      </div>
      
      <table mat-table [dataSource]="orders()" class="mat-elevation-z0 clickable-table">
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="viewOrder(row)"></tr>
        
        <ng-container matColumnDef="orderNumber">
          <th mat-header-cell *matHeaderCellDef> Nº Pedido </th>
          <td mat-cell *matCellDef="let o"> {{o.orderNumber}} </td>
        </ng-container>

        <ng-container matColumnDef="orderDate">
          <th mat-header-cell *matHeaderCellDef> Data </th>
          <td mat-cell *matCellDef="let o"> {{o.orderDate | date:'dd/MM/yyyy'}} </td>
        </ng-container>

        <ng-container matColumnDef="customerName">
          <th mat-header-cell *matHeaderCellDef> Cliente </th>
          <td mat-cell *matCellDef="let o"> {{o.customerName || o.customer?.name}} </td>
        </ng-container>

        <ng-container matColumnDef="supplierName">
          <th mat-header-cell *matHeaderCellDef> Fornecedor </th>
          <td mat-cell *matCellDef="let o"> {{o.supplierName || o.supplier?.name}} </td>
        </ng-container>

        <ng-container matColumnDef="customerOc">
          <th mat-header-cell *matHeaderCellDef> O.C. Cliente </th>
          <td mat-cell *matCellDef="let o"> {{o.customerOc}} </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Ações </th>
          <td mat-cell *matCellDef="let o">
            <button mat-icon-button color="primary">
              <mat-icon>visibility</mat-icon>
            </button>
          </td>
        </ng-container>
      </table>
    </mat-card-content>
  </mat-card>
</div>
  `,
  styles: `
.container { padding: 20px; max-width: 1400px; margin: 0 auto; }
.filter-form { margin-bottom: 20px; }
.row { display: flex; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; align-items: center; }
.flex-grow { flex-grow: 1; }
.btns { display: flex; gap: 10px; }
.results-info { margin: 10px 0; font-size: 14px; color: #666; }
table { width: 100%; margin-top: 20px; }
.clickable-table tr[mat-row] { cursor: pointer; }
.clickable-table tr[mat-row]:hover { background: #f5f5f5; }
  `
})
export class OrderHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  displayedColumns = ['orderNumber', 'orderDate', 'customerName', 'supplierName', 'customerOc', 'actions'];

  filterForm = this.fb.group({
    query: ['']
  });

  ngOnInit() {
    this.search();
  }

  search() {
    const q = this.filterForm.value.query || '';
    let filter: any = {};
    if (q) {
      filter = {
        "$or": [
          { "orderNumber": { "$regex": q, "$options": "i" } },
          { "customerName": { "$regex": q, "$options": "i" } },
          { "supplierName": { "$regex": q, "$options": "i" } }
        ]
      };
    }
    this.orderService.getOrders(filter).subscribe({
      next: (res) => {
        this.orders.set(res);
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos:', err);
        this.orders.set([]);
      }
    });
  }

  clear() {
    this.filterForm.reset();
    this.search();
  }

  viewOrder(order: Order) {
    this.router.navigate(['/order-form'], {
      state: { selectedOrder: order }
    });
  }
}
