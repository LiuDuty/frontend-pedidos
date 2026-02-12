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
import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { NotaFiscal } from '../../models/nota-fiscal.model';

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
      <mat-card-title>Histórico de Notas Fiscais</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <!-- Filtros -->
      <form [formGroup]="filterForm" (ngSubmit)="search()" class="filter-form">
        <div class="row">
          <mat-form-field appearance="outline" class="flex-grow">
            <mat-label>Pesquisar (Cliente, Produto, NF, Pedido)</mat-label>
            <input matInput formControlName="query" placeholder="Digite para buscar...">
          </mat-form-field>
          <div class="btns">
            <button mat-raised-button color="primary" type="submit">Pesquisar</button>
            <button mat-button type="button" (click)="clear()">Limpar</button>
          </div>
        </div>
      </form>

      <mat-divider style="margin: 20px 0;"></mat-divider>

      <!-- Resultados -->
      <div class="results-info">
        <p>Total de registros: {{ notas().length }}</p>
      </div>
      
      <table mat-table [dataSource]="notas()" class="mat-elevation-z0 clickable-table">
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="viewNota(row)"></tr>
        
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef> ID </th>
          <td mat-cell *matCellDef="let n"> {{n.id}} </td>
        </ng-container>

        <ng-container matColumnDef="mes_ano">
          <th mat-header-cell *matHeaderCellDef> Mês/Ano </th>
          <td mat-cell *matCellDef="let n"> {{n.mes_ano}} </td>
        </ng-container>

        <ng-container matColumnDef="cliente">
          <th mat-header-cell *matHeaderCellDef> Cliente </th>
          <td mat-cell *matCellDef="let n"> {{n.cliente}} </td>
        </ng-container>

        <ng-container matColumnDef="produto">
          <th mat-header-cell *matHeaderCellDef> Produto </th>
          <td mat-cell *matCellDef="let n"> {{n.produto}} </td>
        </ng-container>

        <ng-container matColumnDef="nf">
          <th mat-header-cell *matHeaderCellDef> NF </th>
          <td mat-cell *matCellDef="let n"> {{n.nf}} </td>
        </ng-container>

        <ng-container matColumnDef="pedido">
          <th mat-header-cell *matHeaderCellDef> Pedido </th>
          <td mat-cell *matCellDef="let n"> {{n.pedido}} </td>
        </ng-container>

        <ng-container matColumnDef="valor_total">
          <th mat-header-cell *matHeaderCellDef> Valor Total </th>
          <td mat-cell *matCellDef="let n"> {{n.valor_total | currency:'BRL'}} </td>
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
  private notaService = inject(NotaFiscalService);
  private router = inject(Router);

  notas = signal<NotaFiscal[]>([]);

  displayedColumns = ['id', 'mes_ano', 'cliente', 'produto', 'nf', 'pedido', 'valor_total'];

  filterForm = this.fb.group({
    query: ['']
  });

  ngOnInit() {
    this.search();
  }

  search() {
    const query = this.filterForm.value.query || '';
    this.notaService.getAll(query).subscribe({
      next: (res) => {
        console.log('Notas carregadas no histórico:', res.length);
        this.notas.set(res);
      },
      error: (err) => {
        console.error('Erro ao carregar histórico:', err);
        this.notas.set([]);
      }
    });
  }

  clear() {
    this.filterForm.reset();
    this.search();
  }

  viewNota(nota: NotaFiscal) {
    // Navigate to order-form with the nota loaded
    this.router.navigate(['/order-form'], {
      state: { selectedNota: nota }
    });
  }
}
