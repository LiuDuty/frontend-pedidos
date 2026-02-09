import { Component, OnInit, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { OrderService } from '../../services/order.service';
import { Order, OrderItem, Supplier, Customer } from '../../models/order.model';
import { Observable, map, startWith, of, switchMap } from 'rxjs';

@Component({
    selector: 'app-order-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        MatAutocompleteModule, MatInputModule, MatFormFieldModule,
        MatButtonModule, MatIconModule, MatDatepickerModule,
        MatCardModule, MatTableModule, MatDividerModule,
        MatSnackBarModule, MatDialogModule
    ],
    providers: [provideNativeDateAdapter()],
    template: `
<div class="order-container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Sistema de Nota de Pedido</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <form [formGroup]="orderForm">
        <!-- Fornecedor Section -->
        <div class="section-row">
          <mat-form-field appearance="outline" class="flex-grow">
            <mat-label>Fornecedor</mat-label>
            <input type="text" matInput formControlName="supplierName" [matAutocomplete]="autoSupp">
            <mat-autocomplete #autoSupp="matAutocomplete" (optionSelected)="onSupplierSelected($event.option.value)">
              @for (supplier of filteredSuppliers | async; track supplier.id) {
                <mat-option [value]="supplier">{{supplier.name}}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
          
          <div class="logo-container" *ngIf="selectedSupplier()">
             <img [src]="'assets/logo/' + selectedSupplier()?.logo_filename" alt="Logo" class="supplier-logo">
          </div>
        </div>

        <!-- Cliente Section -->
        <div class="section-row">
          <mat-form-field appearance="outline" class="flex-grow">
            <mat-label>Cliente</mat-label>
            <input type="text" matInput formControlName="customerName" [matAutocomplete]="autoCli">
            <mat-autocomplete #autoCli="matAutocomplete" (optionSelected)="onCustomerSelected($event.option.value)">
              @for (customer of filteredCustomers | async; track customer.id) {
                <mat-option [value]="customer">{{customer.name}}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
        </div>

        <!-- Pedido Section -->
        <div class="section-row">
          <mat-form-field appearance="outline">
            <mat-label>Pedido Nº</mat-label>
            <input matInput formControlName="orderNumber" (blur)="onOrderNumberBlur()">
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Data do Pedido</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="orderDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>O.C. do Cliente</mat-label>
            <input matInput formControlName="customerOc">
          </mat-form-field>
        </div>

        <mat-divider></mat-divider>

        <h3>Itens do Pedido</h3>
        <div formArrayName="items">
          @for (item of items.controls; track $index) {
          <div [formGroupName]="$index" class="item-row">
            <mat-form-field appearance="outline">
              <mat-label>Produto</mat-label>
              <input matInput formControlName="productName">
            </mat-form-field>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>Código</mat-label>
              <input matInput formControlName="productCode">
            </mat-form-field>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>Cant. Caixas</mat-label>
              <input type="number" matInput formControlName="caseQuantity">
            </mat-form-field>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>Peso (KG)</mat-label>
              <input type="number" matInput formControlName="weight">
            </mat-form-field>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>Quantidade</mat-label>
              <input type="number" matInput formControlName="quantity">
            </mat-form-field>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>Preço Unit.</mat-label>
              <input type="number" matInput formControlName="unitPrice">
            </mat-form-field>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>IPI %</mat-label>
              <input type="number" matInput formControlName="ipi">
            </mat-form-field>

            <button mat-icon-button color="warn" (click)="removeItem($index)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          }
        </div>
        <button mat-stroked-button color="primary" (click)="addItem()">
          <mat-icon>add</mat-icon> Adicionar Item
        </button>

        <mat-divider style="margin: 20px 0;"></mat-divider>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observação</mat-label>
          <textarea matInput formControlName="observation"></textarea>
        </mat-form-field>

      </form>
    </mat-card-content>
    
    <mat-card-actions align="end">
      <button mat-raised-button (click)="novo()">Novo</button>
      <button mat-raised-button color="primary" (click)="gravar()">Gravar</button>
      <button mat-raised-button color="accent" (click)="atualizar()">Atualizar</button>
      <button mat-raised-button color="warn" (click)="excluir()">Excluir</button>
    </mat-card-actions>
  </mat-card>
</div>
  `,
    styles: `
.order-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-row {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  align-items: center;
}

.flex-grow {
  flex-grow: 1;
}

.logo-container {
  width: 150px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.supplier-logo {
  max-width: 100%;
  max-height: 100%;
}

.item-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.small-field {
  width: 100px;
}

.full-width {
  width: 100%;
}

mat-divider {
  margin: 15px 0;
}
  `
})
export class OrderFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private orderService = inject(OrderService);
    private snackBar = inject(MatSnackBar);

    orderForm = this.fb.group({
        id: [null as number | null],
        orderNumber: ['', Validators.required],
        orderDate: [new Date().toISOString(), Validators.required],
        customerOc: [''],
        email: [''],
        deliveryDate: [null as string | null],
        deliveryAddress: [''],
        deliveryCity: [''],
        deliveryState: [''],
        deliveryCnpj: [''],
        deliveryIe: [''],
        deliveryZip: [''],
        deliveryPhone: [''],
        billingAddress: [''],
        carrier: [''],
        carrierPhone: [''],
        carrierContact: [''],
        freightType: ['CIF'],
        paymentTerms: [''],
        observation: [''],
        customerId: [null as number | null, Validators.required],
        supplierId: [null as number | null, Validators.required],
        supplierName: ['', Validators.required],
        customerName: ['', Validators.required],
        items: this.fb.array([])
    });

    suppliers = signal<Supplier[]>([]);
    customers = signal<Customer[]>([]);

    filteredSuppliers!: Observable<Supplier[]>;
    filteredCustomers!: Observable<Customer[]>;

    selectedSupplier = signal<Supplier | null>(null);

    ngOnInit() {
        this.orderService.getSuppliers().subscribe(res => this.suppliers.set(res));
        this.orderService.getCustomers().subscribe(res => this.customers.set(res));

        this.filteredSuppliers = this.orderForm.get('supplierName')!.valueChanges.pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : (value as any)?.name),
            map(name => name ? this._filterSuppliers(name) : this.suppliers().slice())
        );

        this.filteredCustomers = this.orderForm.get('customerName')!.valueChanges.pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : (value as any)?.name),
            map(name => name ? this._filterCustomers(name) : this.customers().slice())
        );

        this.addItem();
    }

    get items() {
        return this.orderForm.get('items') as FormArray;
    }

    addItem() {
        const itemForm = this.fb.group({
            productName: ['', Validators.required],
            productCode: [''],
            caseQuantity: [0],
            weight: [0],
            quantity: [0],
            unitPrice: [0, Validators.required],
            ipi: [0]
        });
        this.items.push(itemForm);
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    private _filterSuppliers(value: string): Supplier[] {
        const filterValue = value.toLowerCase();
        return this.suppliers().filter(s => s.name.toLowerCase().includes(filterValue));
    }

    private _filterCustomers(value: string): Customer[] {
        const filterValue = value.toLowerCase();
        return this.customers().filter(c => c.name.toLowerCase().includes(filterValue));
    }

    onSupplierSelected(supplier: Supplier) {
        this.selectedSupplier.set(supplier);
        this.orderForm.patchValue({
            supplierId: supplier.id,
            supplierName: supplier.name
        });
        this.checkNextNumber();
    }

    onCustomerSelected(customer: Customer) {
        this.orderForm.patchValue({
            customerId: customer.id,
            customerName: customer.name
        });
        this.checkNextNumber();
    }

    checkNextNumber() {
        const sId = this.orderForm.get('supplierId')?.value;
        const cId = this.orderForm.get('customerId')?.value;
        if (sId && cId && !this.orderForm.get('id')?.value) {
            this.orderService.getNextOrderNumber(sId, cId).subscribe(res => {
                this.orderForm.patchValue({ orderNumber: res.nextNumber });
            });
        }
    }

    onOrderNumberBlur() {
        const orderNumber = this.orderForm.get('orderNumber')?.value;
        const sId = this.orderForm.get('supplierId')?.value;
        const cId = this.orderForm.get('customerId')?.value;

        if (orderNumber && sId && cId) {
            this.orderService.findOrder(orderNumber, sId, cId).subscribe({
                next: (order) => {
                    this.loadOrder(order);
                    this.snackBar.open('Pedido carregado do histórico', 'OK', { duration: 3000 });
                },
                error: () => {
                    this.orderForm.get('id')?.setValue(null);
                }
            });
        }
    }

    loadOrder(order: Order) {
        this.orderForm.patchValue({
            id: order.id,
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            customerOc: order.customerOc,
            email: order.email,
            deliveryDate: order.deliveryDate,
            deliveryAddress: order.deliveryAddress,
            deliveryCity: order.deliveryCity,
            deliveryState: order.deliveryState,
            deliveryCnpj: order.deliveryCnpj,
            deliveryIe: order.deliveryIe,
            deliveryZip: order.deliveryZip,
            deliveryPhone: order.deliveryPhone,
            billingAddress: order.billingAddress,
            carrier: order.carrier,
            carrierPhone: order.carrierPhone,
            carrierContact: order.carrierContact,
            freightType: order.freightType,
            paymentTerms: order.paymentTerms,
            observation: order.observation,
            customerId: order.customerId,
            supplierId: order.supplierId,
            supplierName: order.supplier?.name || '',
            customerName: order.customer?.name || ''
        });

        this.selectedSupplier.set(order.supplier || null);

        this.items.clear();
        order.orderItems?.forEach(item => {
            const itemForm = this.fb.group({
                productName: [item.productName, Validators.required],
                productCode: [item.productCode],
                caseQuantity: [item.caseQuantity],
                weight: [item.weight],
                quantity: [item.quantity],
                unitPrice: [item.unitPrice, Validators.required],
                ipi: [item.ipi]
            });
            this.items.push(itemForm);
        });
    }

    novo() {
        this.orderForm.reset({
            orderDate: new Date().toISOString(),
            freightType: 'CIF'
        });
        this.items.clear();
        this.addItem();
        this.selectedSupplier.set(null);
    }

    gravar() {
        if (this.orderForm.invalid) {
            this.snackBar.open('Preencha os campos obrigatórios (Forn, Cli e Nº)', 'Erro', { duration: 3000 });
            return;
        }

        const { supplierName, customerName, ...orderData } = this.orderForm.value as any;
        this.orderService.createOrder(orderData).subscribe({
            next: (res) => {
                this.loadOrder(res);
                this.snackBar.open('Pedido gravado com sucesso', 'OK', { duration: 3000 });
            },
            error: (err) => this.snackBar.open('Erro ao gravar: ' + err.error.error, 'Erro')
        });
    }

    atualizar() {
        const id = this.orderForm.get('id')?.value;
        if (!id) {
            this.snackBar.open('Pedido não existe no histórico. Use Gravar.', 'Aviso', { duration: 3000 });
            return;
        }

        const { supplierName, customerName, ...orderData } = this.orderForm.value as any;
        this.orderService.updateOrder(id, orderData).subscribe({
            next: (res) => {
                this.loadOrder(res);
                this.snackBar.open('Pedido atualizado com sucesso', 'OK', { duration: 3000 });
            },
            error: (err) => this.snackBar.open('Erro ao atualizar: ' + err.error.error, 'Erro')
        });
    }

    excluir() {
        const id = this.orderForm.get('id')?.value;
        if (!id) return;

        if (confirm('Tem certeza que deseja excluir este pedido?')) {
            this.orderService.deleteOrder(id).subscribe({
                next: () => {
                    this.novo();
                    this.snackBar.open('Pedido excluído com sucesso', 'OK', { duration: 3000 });
                },
                error: (err) => this.snackBar.open('Erro ao excluir: ' + err.error.error, 'Erro')
            });
        }
    }
}
