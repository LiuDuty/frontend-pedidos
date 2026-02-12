import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';

import { OrderService } from '../../services/order.service';
import { Order, OrderItem, Supplier, Customer } from '../../models/order.model';
import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { NotaFiscal } from '../../models/nota-fiscal.model';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatIconModule, MatDatepickerModule, MatCardModule,
    MatDividerModule, MatSnackBarModule, MatSelectModule
  ],
  providers: [provideNativeDateAdapter()],
  template: `
<div class="order-container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Emissão de Nota Fiscal / Pedido</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <form [formGroup]="orderForm">
        <!-- SEÇÃO: FORNECEDOR E CLIENTE -->
        <div class="row">
          <mat-form-field appearance="outline" class="col-8">
            <mat-label>Fornecedor</mat-label>
            <mat-select formControlName="supplierId" (selectionChange)="onSupplierSelect($event.value)">
              <mat-option *ngFor="let s of suppliers()" [value]="s.id">{{s.name}}</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="col-4 logo-container" *ngIf="selectedSupplier() && selectedSupplier()?.logo_filename">
            <img [src]="getLogoUrl()" alt="Logo do Fornecedor" class="supplier-logo" (error)="onLogoError($event)">
          </div>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="col-12">
            <mat-label>Cliente</mat-label>
            <mat-select formControlName="customerId" (selectionChange)="onCustomerSelect($event.value)">
              <mat-option *ngFor="let c of customers()" [value]="c.id">{{c.name}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- SEÇÃO: LOCAL DE ENTREGA -->
        <h4 class="section-title">Local de Entrega</h4>
        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Nome / Local</mat-label>
            <input matInput formControlName="deliveryName">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Endereço de Entrega</mat-label>
            <input matInput formControlName="deliveryAddress">
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Cidade</mat-label>
            <input matInput formControlName="deliveryCity">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-1">
            <mat-label>UF</mat-label>
            <input matInput formControlName="deliveryState">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>CNPJ</mat-label>
            <input matInput formControlName="deliveryCnpj">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Insc. Estadual</mat-label>
            <input matInput formControlName="deliveryIe">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>CEP</mat-label>
            <input matInput formControlName="deliveryZip">
          </mat-form-field>
        </div>

        <!-- SEÇÃO: PEDIDO -->
        <mat-divider></mat-divider>
        <div class="row" style="margin-top: 20px;">
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>Pedido Nº</mat-label>
            <input matInput formControlName="orderNumber" (blur)="onOrderNumberBlur()">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>Data do Pedido</mat-label>
            <input matInput [matDatepicker]="dp1" formControlName="orderDate">
            <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
            <mat-datepicker #dp1></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>O.C. do Cliente</mat-label>
            <input matInput formControlName="customerOc">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Condição de Pagamento</mat-label>
            <input matInput formControlName="paymentTerms">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>Frete</mat-label>
            <mat-select formControlName="freightType">
              <mat-option value="CIF">CIF</mat-option>
              <mat-option value="FOB">FOB</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- SEÇÃO: ITENS -->
        <h4 class="section-title">Produtos / Itens</h4>
        <div formArrayName="items">
          @for (item of items.controls; track $index) {
          <div [formGroupName]="$index" class="item-grid">
            <mat-form-field appearance="outline" class="prod-name">
              <mat-label>Produto</mat-label>
              <input matInput formControlName="productName">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="mini">
              <mat-label>Código</mat-label>
              <input matInput formControlName="productCode">
            </mat-form-field>

            <mat-form-field appearance="outline" class="mini">
              <mat-label>Cx.</mat-label>
              <input type="number" matInput formControlName="caseQuantity">
            </mat-form-field>

            <mat-form-field appearance="outline" class="mini">
              <mat-label>Peso</mat-label>
              <input type="number" matInput formControlName="weight">
            </mat-form-field>

            <mat-form-field appearance="outline" class="mini">
              <mat-label>Quant.</mat-label>
              <input type="number" matInput formControlName="quantity" (input)="calculateItem($index)">
            </mat-form-field>

            <mat-form-field appearance="outline" class="med">
              <mat-label>Preço / Mil</mat-label>
              <input type="number" matInput formControlName="pricePerThousand" (input)="calculateItem($index)">
            </mat-form-field>

            <mat-form-field appearance="outline" class="med">
              <mat-label>Subtotal</mat-label>
              <input type="number" matInput formControlName="subtotal" readonly>
            </mat-form-field>

            <mat-form-field appearance="outline" class="mini">
              <mat-label>IPI %</mat-label>
              <input type="number" matInput formControlName="ipi" (input)="calculateItem($index)">
            </mat-form-field>

            <mat-form-field appearance="outline" class="med">
              <mat-label>Total</mat-label>
              <input type="number" matInput formControlName="total" readonly>
            </mat-form-field>

            <button mat-icon-button color="warn" (click)="removeItem($index)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          }
        </div>
        <button mat-stroked-button color="primary" (click)="addItem()">
          <mat-icon>add</mat-icon> Adicionar Linha
        </button>

        <mat-divider style="margin: 20px 0;"></mat-divider>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observações</mat-label>
          <textarea matInput formControlName="observation" rows="3"></textarea>
        </mat-form-field>

      </form>
    </mat-card-content>

    <mat-card-actions align="end">
      <button mat-raised-button (click)="novo()">Novo Pedido</button>
      <button mat-raised-button color="primary" (click)="gravar()" [disabled]="orderForm.invalid">Gravar</button>
      <button mat-raised-button color="accent" (click)="atualizar()" [disabled]="!orderForm.get('id')?.value || orderForm.get('isLegacy')?.value">Atualizar</button>
      <button mat-raised-button color="warn" (click)="excluir()" [disabled]="!orderForm.get('id')?.value || orderForm.get('isLegacy')?.value">Excluir</button>
    </mat-card-actions>
  </mat-card>
</div>
  `,
  styles: `
.order-container { padding: 20px; max-width: 1300px; margin: 0 auto; }
.row { display: flex; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; }
.col-1 { width: calc(8.33% - 10px); }
.col-2 { width: calc(16.66% - 10px); }
.col-3 { width: calc(25% - 10px); }
.col-4 { width: calc(33.33% - 10px); }
.col-6 { width: calc(50% - 10px); }
.col-8 { width: calc(66.66% - 10px); }
.col-12 { width: 100%; }

.section-title { margin: 15px 0 10px 0; color: #3f51b5; border-bottom: 1px solid #eee; padding-bottom: 5px; }
.logo-container { height: 75px; display: flex; justify-content: center; align-items: center; border: 1px dashed #ccc; }
.supplier-logo { max-width: 90%; max-height: 90%; }

.item-grid { display: flex; gap: 8px; align-items: center; margin-bottom: 5px; }
.prod-name { flex-grow: 1; min-width: 250px; }
.mini { width: 85px; }
.med { width: 120px; }
.full-width { width: 100%; }

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .order-container { padding: 10px; }
  
  /* Make all columns full width on mobile */
  .col-1, .col-2, .col-3, .col-4, .col-6, .col-8 { 
    width: 100%; 
    min-width: 100%;
  }
  
  /* Increase spacing between rows */
  .row { 
    gap: 0; 
    margin-bottom: 10px; 
  }
  
  /* Better spacing for form fields */
  mat-form-field {
    margin-bottom: 8px;
  }
  
  /* Stack item grid vertically */
  .item-grid { 
    flex-direction: column; 
    gap: 0;
    align-items: stretch;
  }
  
  .prod-name, .mini, .med { 
    width: 100%; 
    min-width: 100%;
  }
  
  /* Larger touch targets for buttons */
  button {
    min-height: 44px;
    margin: 4px 0;
  }
  
  /* Hide logo container on very small screens */
  .logo-container {
    display: none;
  }
  
  /* Section titles more prominent */
  .section-title {
    font-size: 16px;
    margin: 20px 0 15px 0;
    font-weight: 500;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .order-container { padding: 5px; }
  
  mat-card {
    padding: 12px !important;
  }
  
  mat-card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  mat-card-actions button {
    width: 100%;
  }
}
`
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private notaService = inject(NotaFiscalService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderForm = this.fb.group({
    id: [null as string | number | null],
    orderNumber: ['', Validators.required],
    orderDate: [new Date().toISOString(), Validators.required],
    customerOc: [''],
    email: [''],
    deliveryDate: [null as string | null],
    deliveryName: [''],
    deliveryAddress: [''],
    deliveryCity: [''],
    deliveryState: [''],
    deliveryCnpj: [''],
    deliveryIe: [''],
    deliveryZip: [''],
    deliveryPhone: [''],
    billingAddress: [''],
    billingCity: [''],
    billingState: [''],
    billingZip: [''],
    paymentTerms: [''],
    freightType: ['FOB'],
    carrier: [''],
    carrierPhone: [''],
    carrierContact: [''],
    observation: [''],
    customerId: [null as number | null, Validators.required],
    supplierId: [null as number | null, Validators.required],
    isLegacy: [false],
    items: this.fb.array([])
  });

  suppliers = signal<Supplier[]>([]);
  customers = signal<Customer[]>([]);
  selectedSupplier = signal<Supplier | null>(null);

  ngOnInit() {
    this.orderService.getSuppliers().subscribe(res => this.suppliers.set(res));
    this.orderService.getCustomers().subscribe(res => this.customers.set(res));

    // Check if navigating from history page with a selected nota
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;

    if (state && state['selectedNota']) {
      const nota: NotaFiscal = state['selectedNota'];
      this.loadNotaIntoForm(nota);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrder(id).subscribe(res => this.loadOrder(res));
    } else {
      this.addItem();
    }
  }

  loadNotaIntoForm(nota: NotaFiscal) {
    // Convert nota fiscal data to order form format
    // This is a simplified mapping - adjust as needed
    this.orderForm.patchValue({
      orderNumber: nota.pedido || '',
      orderDate: nota.data_pedido || new Date().toISOString(),
      deliveryDate: nota.data_entrega,
      deliveryName: nota.cliente
    });

    // Add a single item with the nota data
    this.addItem();
    const item = this.items.at(0);
    item.patchValue({
      productName: nota.produto,
      quantity: nota.quantidade || 0,
      pricePerThousand: nota.preco_unitario || 0,
      subtotal: nota.valor_total || 0,
      total: nota.valor_total || 0
    });

    this.snackBar.open(`Nota ${nota.nf} carregada do histórico`, 'OK', { duration: 3000 });
  }

  get items() { return this.orderForm.get('items') as FormArray; }

  addItem() {
    const item = this.fb.group({
      productName: ['', Validators.required],
      productCode: [''],
      caseQuantity: [0],
      weight: [0],
      quantity: [0],
      pricePerThousand: [0],
      subtotal: [{ value: 0, disabled: false }],
      ipi: [0],
      total: [{ value: 0, disabled: false }]
    });
    this.items.push(item);
  }

  removeItem(i: number) { this.items.removeAt(i); }

  calculateItem(i: number) {
    const group = this.items.at(i);
    const qty = group.get('quantity')?.value || 0;
    const priceM = group.get('pricePerThousand')?.value || 0;
    const ipi = group.get('ipi')?.value || 0;

    const subtotal = (qty * priceM) / 1000;
    const total = subtotal + (subtotal * ipi / 100);

    group.patchValue({
      subtotal: parseFloat(subtotal.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }, { emitEvent: false });
  }

  onSupplierSelect(id: number) {
    const s = this.suppliers().find(x => x.id === id);
    this.selectedSupplier.set(s || null);
    this.checkNextNumber();
  }

  getLogoUrl(): string {
    const filename = this.selectedSupplier()?.logo_filename;
    if (!filename) return '';
    // Point to backend static file server
    return `${environment.baseUrl}/logos/${filename}`;
  }

  onLogoError(event: Event) {
    // Hide image if it fails to load
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onCustomerSelect(id: number) {
    const c = this.customers().find(x => x.id === id);
    if (c) {
      this.orderForm.patchValue({
        deliveryName: c.name,
        deliveryAddress: c.address,
        deliveryCity: c.city,
        deliveryState: c.state,
        deliveryZip: c.zipcode,
        billingAddress: c.address
      });
    }
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
    const num = this.orderForm.get('orderNumber')?.value;
    const sId = this.orderForm.get('supplierId')?.value;
    const cId = this.orderForm.get('customerId')?.value;
    if (num && sId && cId) {
      this.orderService.findOrder(num, sId, cId).subscribe({
        next: (o) => this.loadOrder(o),
        error: () => this.orderForm.get('id')?.setValue(null)
      });
    }
  }

  loadOrder(o: Order) {
    this.orderForm.patchValue({
      id: o.id,
      orderNumber: o.orderNumber,
      orderDate: o.orderDate,
      customerOc: o.customerOc,
      paymentTerms: o.paymentTerms,
      freightType: o.freightType,
      observation: o.observation,
      customerId: o.customerId,
      supplierId: o.supplierId,
      isLegacy: !!o.isLegacy,
      deliveryName: o.deliveryName,
      deliveryAddress: o.deliveryAddress,
      deliveryCity: o.deliveryCity,
      deliveryState: o.deliveryState,
      deliveryCnpj: o.deliveryCnpj,
      deliveryIe: o.deliveryIe,
      deliveryZip: o.deliveryZip,
      deliveryPhone: o.deliveryPhone,
      billingAddress: o.billingAddress
    });
    this.selectedSupplier.set(o.supplier || null);
    this.items.clear();
    o.orderItems?.forEach(i => {
      const g = this.fb.group({
        productName: [i.productName, Validators.required],
        productCode: [i.productCode],
        caseQuantity: [i.caseQuantity],
        weight: [i.weight],
        quantity: [i.quantity],
        pricePerThousand: [i.pricePerThousand],
        subtotal: [i.subtotal],
        ipi: [i.ipi],
        total: [i.total]
      });
      this.items.push(g);
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
    const data = this.orderForm.getRawValue() as any;
    this.orderService.createOrder(data).subscribe({
      next: (res) => { this.loadOrder(res); this.snackBar.open('Gravado!', 'OK', { duration: 2000 }); },
      error: (e) => this.snackBar.open('Erro: ' + e.error.error, 'Fechar')
    });
  }

  atualizar() {
    const id = this.orderForm.get('id')?.value;
    const data = this.orderForm.getRawValue() as any;
    this.orderService.updateOrder(id!, data).subscribe({
      next: (res) => { this.loadOrder(res); this.snackBar.open('Atualizado!', 'OK', { duration: 2000 }); },
      error: (e) => this.snackBar.open('Erro: ' + e.error.error, 'Fechar')
    });
  }

  excluir() {
    const id = this.orderForm.get('id')?.value;
    if (confirm('Excluir?')) {
      this.orderService.deleteOrder(id!).subscribe(() => { this.novo(); this.snackBar.open('Excluído', 'OK', { duration: 2000 }); });
    }
  }
}
