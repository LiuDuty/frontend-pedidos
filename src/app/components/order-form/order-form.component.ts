import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';

import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { NotaFiscal } from '../../models/nota-fiscal.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule,
    MatButtonModule, MatIconModule, MatDatepickerModule,
    MatCardModule, MatTableModule, MatDividerModule,
    MatSnackBarModule, MatPaginatorModule
  ],
  providers: [provideNativeDateAdapter()],
  template: `
<div class="crud-container">
  <mat-card class="search-card">
    <mat-card-header>
      <mat-card-title>Gestão de Notas Fiscais</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div class="search-row">
        <mat-form-field appearance="outline" class="flex-grow">
          <mat-label>Pesquisar (Cliente, Produto, NF, Pedido)</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="loadNotas()">
          <button mat-icon-button matSuffix (click)="loadNotas()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="novo()">
          <mat-icon>add</mat-icon> Nova Nota
        </button>
      </div>
    </mat-card-content>
  </mat-card>

  <div class="content-layout">
    <!-- List Section -->
    <mat-card class="list-card" [class.hidden-mobile]="isFormVisible()">
      <div class="table-container">
        <table mat-table [dataSource]="dataSource" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let n"> {{n.id}} </td>
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

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Ações </th>
            <td mat-cell *matCellDef="let n">
              <button mat-icon-button color="primary" (click)="selecionar(n); $event.stopPropagation()">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="excluir(n.id); $event.stopPropagation()">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              (click)="selecionar(row)"
              class="clickable-row"
              [class.selected-row]="notaForm.get('id')?.value === row.id"></tr>
        </table>
      </div>
    </mat-card>

    <!-- Form Section -->
    <mat-card class="form-card" *ngIf="isFormVisible()">
      <mat-card-header>
        <button mat-icon-button (click)="cancelar()" class="mobile-only">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <mat-card-title>{{ notaForm.get('id')?.value ? 'Editar' : 'Nova' }} Nota</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="notaForm" class="nota-form">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Mês/Ano</mat-label>
              <input matInput formControlName="mes_ano" placeholder="EX: MARÇO 2014">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Cliente</mat-label>
              <input matInput formControlName="cliente" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Produto</mat-label>
              <input matInput formControlName="produto" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Pedido Nº</mat-label>
              <input matInput formControlName="pedido">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data Pedido</mat-label>
              <input matInput [matDatepicker]="dp1" formControlName="data_pedido">
              <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
              <mat-datepicker #dp1></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data Entrega</mat-label>
              <input matInput [matDatepicker]="dp2" formControlName="data_entrega">
              <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
              <mat-datepicker #dp2></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>NF</mat-label>
              <input matInput formControlName="nf">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Quantidade</mat-label>
              <input type="number" matInput formControlName="quantidade">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Unidade</mat-label>
              <input matInput formControlName="unidade">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Preço Unit.</mat-label>
              <input type="number" matInput formControlName="preco_unitario">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Valor Total</mat-label>
              <input type="number" matInput formControlName="valor_total">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Comissão</mat-label>
              <input type="number" matInput formControlName="comissao">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Observação</mat-label>
            <textarea matInput formControlName="observacao"></textarea>
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="cancelar()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="salvar()">
          {{ notaForm.get('id')?.value ? 'Atualizar' : 'Salvar' }}
        </button>
      </mat-card-actions>
    </mat-card>
  </div>
</div>
  `,
  styles: `
.crud-container {
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f5f5f5;
}

.search-card {
  flex-shrink: 0;
}

.search-row {
  display: flex;
  gap: 15px;
  align-items: center;
}

.content-layout {
  display: flex;
  gap: 20px;
  flex-grow: 1;
  min-height: 0;
  overflow: visible;
}

.list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.form-card {
  width: 500px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}

.table-container {
  overflow: auto;
}

.full-width {
  width: 100%;
}

.flex-grow {
  flex-grow: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.selected-row {
  background-color: #e3f2fd;
}

.clickable-row:hover {
  cursor: pointer;
  background-color: #fafafa;
}

.mobile-only {
  display: none;
}

@media (max-width: 900px) {
  .crud-container {
    padding: 0;
  }
  
  .search-card {
    border-radius: 0;
    margin-bottom: 0;
  }

  .content-layout {
    flex-direction: column;
    gap: 0;
  }

  .list-card.hidden-mobile {
    display: none;
  }

  .form-card {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    max-height: 100vh;
    z-index: 1000;
    margin: 0;
    border-radius: 0;
  }

  .mobile-only {
    display: inline-flex;
    margin-right: 8px;
  }
}
  `
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notaService = inject(NotaFiscalService);
  private snackBar = inject(MatSnackBar);

  searchQuery = '';
  dataSource = new MatTableDataSource<NotaFiscal>([]);
  isFormVisible = signal(false);
  displayedColumns: string[] = ['id', 'cliente', 'produto', 'nf', 'actions'];

  notaForm = this.fb.group({
    id: [null as number | null],
    mes_ano: [''],
    data_pedido: [null as any],
    data_entrega: [null as any],
    data_fatura: [null as any],
    cliente: ['', Validators.required],
    produto: ['', Validators.required],
    pedido: [''],
    oc_cliente: [''],
    quantidade: [null as number | null],
    unidade: [''],
    preco_unitario: [null as number | null],
    valor_total: [null as number | null],
    comissao: [null as number | null],
    nf: [''],
    saldo: [null as number | null],
    observacao: [''],
    origem: ['Principal']
  });

  ngOnInit() {
    this.loadNotas();
  }

  loadNotas() {
    this.notaService.getAll(this.searchQuery).subscribe({
      next: (res) => {
        console.log('Notas carregadas:', res.length);
        this.dataSource.data = res;
      },
      error: (err) => {
        console.error('Erro ao carregar notas:', err);
        this.snackBar.open('Erro ao carregar notas', 'OK');
      }
    });
  }

  novo() {
    this.notaForm.reset({ origem: 'Principal' });
    this.isFormVisible.set(true);
  }

  selecionar(nota: NotaFiscal) {
    const parsedNota = {
      ...nota,
      data_pedido: nota.data_pedido ? new Date(nota.data_pedido + 'T00:00:00') : null,
      data_entrega: nota.data_entrega ? new Date(nota.data_entrega + 'T00:00:00') : null,
      data_fatura: nota.data_fatura ? new Date(nota.data_fatura + 'T00:00:00') : null,
    };
    this.notaForm.patchValue(parsedNota);
    this.isFormVisible.set(true);
  }

  cancelar() {
    this.isFormVisible.set(false);
    this.notaForm.reset();
  }

  salvar() {
    if (this.notaForm.invalid) return;

    const rawData = this.notaForm.value;
    const formatDate = (date: any) => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    };

    const data: NotaFiscal = {
      ...rawData as any,
      data_pedido: formatDate(rawData.data_pedido),
      data_entrega: formatDate(rawData.data_entrega),
      data_fatura: formatDate(rawData.data_fatura),
    };

    const id = data.id;

    if (id) {
      this.notaService.update(id, data).subscribe({
        next: () => {
          this.snackBar.open('Nota atualizada com sucesso', 'OK', { duration: 3000 });
          this.loadNotas();
          this.isFormVisible.set(false);
        },
        error: (err) => this.snackBar.open('Erro ao atualizar: ' + err.message, 'Erro')
      });
    } else {
      this.notaService.create(data).subscribe({
        next: () => {
          this.snackBar.open('Nota criada com sucesso', 'OK', { duration: 3000 });
          this.loadNotas();
          this.isFormVisible.set(false);
        },
        error: (err) => this.snackBar.open('Erro ao criar: ' + err.message, 'Erro')
      });
    }
  }

  excluir(id: number) {
    if (!id) return;
    if (confirm('Deseja excluir esta nota?')) {
      this.notaService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Nota excluída', 'OK', { duration: 3000 });
          this.loadNotas();
          if (this.notaForm.get('id')?.value === id) {
            this.cancelar();
          }
        },
        error: (err) => this.snackBar.open('Erro ao excluir: ' + err.message, 'Erro')
      });
    }
  }
}
