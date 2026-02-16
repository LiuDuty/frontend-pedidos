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
import { Supplier } from '../../models/order.model';

@Component({
  selector: 'app-supplier-list',
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
      <mat-card-title>Gerenciar Fornecedores</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <!-- Formulario de Cadastro/Edição -->
      <form [formGroup]="supplierForm" (ngSubmit)="save()" class="edit-form">
        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Nome do Fornecedor</mat-label>
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
            <mat-label>E-mail</mat-label>
            <input matInput formControlName="email">
          </mat-form-field>
          <div class="col-6 logo-upload-section">
            <label for="logo-upload" class="upload-button" mat-raised-button color="accent">
              <mat-icon>cloud_upload</mat-icon>
              Carregar Logo
            </label>
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/*" 
              (change)="onFileSelected($event)"
              style="display: none;">
            <div *ngIf="logoPreview()" class="logo-preview">
              <img [src]="logoPreview()" alt="Preview do Logo">
              <button mat-icon-button (click)="clearLogo()" type="button">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <small *ngIf="supplierForm.get('logo_filename')?.value" class="current-logo">
              Logo atual: {{supplierForm.get('logo_filename')?.value}}
            </small>
          </div>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Nome do Representante</mat-label>
            <input matInput formControlName="representativeName">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Telefone do Representante</mat-label>
            <input matInput formControlName="representativePhone">
          </mat-form-field>
        </div>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="supplierForm.invalid">
            {{ supplierForm.get('id')?.value ? 'Atualizar' : 'Cadastrar' }}
          </button>
          <button mat-button type="button" (click)="reset()">Limpar</button>
          <button mat-button color="accent" type="button" (click)="fillCCSData()">Preencher Dados CCS</button>
        </div>
      </form>

      <mat-divider style="margin: 20px 0;"></mat-divider>

      <!-- Tabela de Listagem -->
      <table mat-table [dataSource]="suppliers()" class="mat-elevation-z0 clickable-table">
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="edit(row)"></tr>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Fornecedor </th>
          <td mat-cell *matCellDef="let s"> {{s.name}} </td>
        </ng-container>

        <ng-container matColumnDef="city">
          <th mat-header-cell *matHeaderCellDef> Cidade/UF </th>
          <td mat-cell *matCellDef="let s"> {{s.city}}/{{s.state}} </td>
        </ng-container>

        <ng-container matColumnDef="cnpj">
          <th mat-header-cell *matHeaderCellDef> CNPJ </th>
          <td mat-cell *matCellDef="let s"> {{s.cnpj}} </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Ações </th>
          <td mat-cell *matCellDef="let s">
            <button mat-icon-button color="primary" (click)="edit(s)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="delete(s.id)">
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
.logo-upload-section { display: flex; flex-direction: column; gap: 10px; }
.upload-button { cursor: pointer; display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; background: #ff4081; color: white; border-radius: 4px; }
.upload-button:hover { background: #f50057; }
.logo-preview { position: relative; width: 150px; height: 150px; border: 2px dashed #ccc; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
.logo-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.logo-preview button { position: absolute; top: -10px; right: -10px; background: white; }
.current-logo { color: #666; font-size: 12px; }
  `
})
export class SupplierListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  suppliers = signal<Supplier[]>([]);
  displayedColumns = ['name', 'city', 'cnpj', 'actions'];
  logoPreview = signal<string | null>(null);
  selectedFile: File | null = null;

  supplierForm = this.fb.group({
    id: [null as string | null],
    name: ['', Validators.required],
    logo_filename: [''],
    address: [''],
    number: [''],
    zipcode: [''],
    neighborhood: [''],
    city: [''],
    state: [''],
    phone: [''],
    cnpj: [''],
    state_registration: [''],
    email: [''],
    representativeName: [''],
    representativePhone: ['']
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.orderService.getSuppliers().subscribe(res => this.suppliers.set(res));
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  clearLogo() {
    this.selectedFile = null;
    this.logoPreview.set(null);
    const input = document.getElementById('logo-upload') as HTMLInputElement;
    if (input) input.value = '';
  }

  save() {
    const data = this.supplierForm.getRawValue() as Supplier;

    const saveCallback = {
      next: (supplier: any) => {
        const sid = supplier.id || data.id;
        if (this.selectedFile && sid) {
          this.orderService.uploadSupplierLogo(String(sid), this.selectedFile).subscribe({
            next: (res) => {
              this.snackBar.open('Fornecedor e logo salvos!', 'OK', { duration: 2000 });
              this.reset();
              this.load();
            },
            error: (err) => this.snackBar.open('Erro upload: ' + err.message, 'OK', { duration: 3000 })
          });
        } else {
          this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 2000 });
          this.reset();
          this.load();
        }
      },
      error: (err: any) => this.snackBar.open('Erro: ' + err.message, 'OK', { duration: 3000 })
    };

    if (data.id) {
      this.orderService.updateSupplier(String(data.id), data).subscribe(saveCallback);
    } else {
      this.orderService.createSupplier(data).subscribe(saveCallback);
    }
  }

  edit(s: Supplier) {
    this.supplierForm.patchValue({
      ...s,
      id: s.id ? String(s.id) : null
    } as any);
    if (s.logo_filename) {
      this.logoPreview.set(s.logo_filename);
    } else {
      this.logoPreview.set(null);
    }
  }

  delete(id: any) {
    if (confirm('Deseja excluir este fornecedor?')) {
      this.orderService.deleteSupplier(id).subscribe(() => {
        this.snackBar.open('Fornecedor excluído', 'OK', { duration: 2000 });
        this.load();
      });
    }
  }

  reset() {
    this.supplierForm.reset();
    this.clearLogo();
  }

  fillCCSData() {
    this.supplierForm.patchValue({
      name: 'CCS IND. E COM. DE EMBALAGENS PLASTICAS LTDA.',
      cnpj: '80.130.487/0001-66',
      state_registration: '251.553.949',
      address: 'RODOVIA SC 443, KM 03',
      number: 'S/N',
      neighborhood: 'PRESIDENTE VARGAS',
      city: 'IÇARA',
      state: 'SC',
      zipcode: '88820-000',
      phone: '48 3462-1864/1462',
      email: 'ccs.emb@terra.com.br',
      representativeName: 'MARCIO FERNANDES LUCCHESE',
      representativePhone: 'CEL. 11 94972-4778'
    });
    this.snackBar.open('Dados CCS carregados no formulário!', 'OK', { duration: 3000 });
  }
}
