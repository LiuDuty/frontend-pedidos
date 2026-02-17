import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { OrderService } from '../../services/order.service';
import { Carrier } from '../../models/order.model';

@Component({
    selector: 'app-carrier-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        MatTableModule, MatButtonModule, MatIconModule, MatInputModule,
        MatFormFieldModule, MatCardModule, MatSnackBarModule, MatDividerModule
    ],
    template: `
<div class="container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Gerenciar Transportadoras</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <!-- Formulario de Cadastro/Edição -->
      <form [formGroup]="carrierForm" (ngSubmit)="save()" class="edit-form">
        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Nome da Transportadora</mat-label>
            <input matInput formControlName="name">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>CNPJ</mat-label>
            <input matInput formControlName="cnpj">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Insc. Estadual</mat-label>
            <input matInput formControlName="state_registration">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Endereço</mat-label>
            <input matInput formControlName="address">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>Nº</mat-label>
            <input matInput formControlName="number">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-4">
            <mat-label>Bairro</mat-label>
            <input matInput formControlName="neighborhood">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="col-4">
            <mat-label>Cidade</mat-label>
            <input matInput formControlName="city">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>UF</mat-label>
            <input matInput formControlName="state">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>CEP</mat-label>
            <input matInput formControlName="zipcode">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="phone">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Contato</mat-label>
            <input matInput formControlName="contact">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>E-mail</mat-label>
            <input matInput formControlName="email">
          </mat-form-field>
        </div>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="carrierForm.invalid">
            {{ carrierForm.get('id')?.value ? 'Atualizar' : 'Cadastrar' }}
          </button>
          <button mat-button type="button" (click)="reset()">Limpar</button>
        </div>
      </form>

      <mat-divider style="margin: 20px 0;"></mat-divider>

      <!-- Tabela de Listagem -->
      <table mat-table [dataSource]="carriers()" class="mat-elevation-z0 clickable-table">
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="edit(row)"></tr>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Transportadora </th>
          <td mat-cell *matCellDef="let c"> {{c.name}} </td>
        </ng-container>

        <ng-container matColumnDef="city">
          <th mat-header-cell *matHeaderCellDef> Cidade/UF </th>
          <td mat-cell *matCellDef="let c"> {{c.city}}/{{c.state}} </td>
        </ng-container>

        <ng-container matColumnDef="cnpj">
          <th mat-header-cell *matHeaderCellDef> CNPJ </th>
          <td mat-cell *matCellDef="let c"> {{c.cnpj}} </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Ações </th>
          <td mat-cell *matCellDef="let c">
            <button mat-icon-button color="primary" (click)="edit(c)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="delete(c.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>
      </table>
    </mat-card-content>
  </mat-card>
</div>
  `,
    styles: `
.container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.edit-form { margin-bottom: 20px; }
.row { display: flex; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; }
.col-2 { width: calc(16.66% - 10px); }
.col-3 { width: calc(25% - 10px); }
.col-4 { width: calc(33.33% - 10px); }
.col-6 { width: calc(50% - 10px); }
.actions { display: flex; gap: 10px; margin-top: 10px; }
table { width: 100%; margin-top: 20px; }
.clickable-table tr[mat-row] { cursor: pointer; }
.clickable-table tr[mat-row]:hover { background: #f5f5f5; }
  `
})
export class CarrierListComponent implements OnInit {
    private fb = inject(FormBuilder);
    private orderService = inject(OrderService);
    private snackBar = inject(MatSnackBar);

    carriers = signal<Carrier[]>([]);
    displayedColumns = ['name', 'city', 'cnpj', 'actions'];

    carrierForm = this.fb.group({
        id: [null as string | null],
        name: ['', Validators.required],
        address: [''],
        number: [''],
        zipcode: [''],
        neighborhood: [''],
        city: [''],
        state: [''],
        phone: [''],
        contact: [''],
        email: [''],
        cnpj: [''],
        state_registration: ['']
    });

    ngOnInit() {
        this.load();
    }

    load() {
        this.orderService.getCarriers().subscribe(res => this.carriers.set(res));
    }

    save() {
        const data = this.carrierForm.getRawValue() as Carrier;
        if (data.id) {
            this.orderService.updateCarrier(String(data.id), data).subscribe(() => {
                this.snackBar.open('Transportadora atualizada!', 'OK', { duration: 2000 });
                this.reset();
                this.load();
            });
        } else {
            this.orderService.createCarrier(data).subscribe(() => {
                this.snackBar.open('Transportadora cadastrada!', 'OK', { duration: 2000 });
                this.reset();
                this.load();
            });
        }
    }

    edit(c: Carrier) {
        this.carrierForm.patchValue({
            ...c,
            id: c.id ? String(c.id) : null
        } as any);
    }

    delete(id: any) {
        if (confirm('Deseja excluir esta transportadora?')) {
            this.orderService.deleteCarrier(id).subscribe(() => {
                this.snackBar.open('Transportadora excluída', 'OK', { duration: 2000 });
                this.load();
            });
        }
    }

    reset() {
        this.carrierForm.reset();
    }
}
