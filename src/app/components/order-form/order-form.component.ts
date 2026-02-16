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
import { MatMenuModule } from '@angular/material/menu';

import { OrderService } from '../../services/order.service';
import { Order, OrderItem, Supplier, Customer } from '../../models/order.model';
import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { NotaFiscal } from '../../models/nota-fiscal.model';
import { environment } from '../../../environments/environment';
import { PdfService } from '../../services/pdf.service';


@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatIconModule, MatDatepickerModule, MatCardModule,
    MatDividerModule, MatSnackBarModule, MatSelectModule,
    MatMenuModule
  ],
  providers: [provideNativeDateAdapter()],
  template: `
<div class="order-container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Marcann - Emissão de Notas & Pedidos</mat-card-title>
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

        <h4 class="section-title">Dados do Fornecedor</h4>
        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="supplierName">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-4">
            <mat-label>CNPJ</mat-label>
            <input matInput formControlName="supplierCnpj">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>IE</mat-label>
            <input matInput formControlName="supplierIe">
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Endereço</mat-label>
            <input matInput formControlName="supplierAddress">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>Cidade</mat-label>
            <input matInput formControlName="supplierCity">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>E-mail</mat-label>
            <input matInput formControlName="supplierEmail">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>Fone</mat-label>
            <input matInput formControlName="supplierPhone">
          </mat-form-field>
        </div>

        <h4 class="section-title">Dados do Cliente</h4>
        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="customerName">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>CNPJ</mat-label>
            <input matInput formControlName="customerCnpj">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>IE</mat-label>
            <input matInput formControlName="customerIe">
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline" class="col-4">
            <mat-label>Endereço</mat-label>
            <input matInput formControlName="customerAddress">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-4">
            <mat-label>Contato</mat-label>
            <input matInput formControlName="customerContact">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-4">
            <mat-label>E-mail</mat-label>
            <input matInput formControlName="customerEmail">
          </mat-form-field>
        </div>

        <!-- SEÇÃO: LOCAL DE ENTREGA -->
        <h4 class="section-title">Local de Entrega</h4>
        <div class="row">
          <mat-form-field appearance="outline" class="col-8">
            <mat-label>Endereço de Entrega (Acima/Outro)</mat-label>
            <input matInput formControlName="deliveryAddress">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-4">
            <mat-label>Cidade</mat-label>
            <input matInput formControlName="deliveryCity">
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline" class="col-1">
            <mat-label>UF</mat-label>
            <input matInput formControlName="deliveryState">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>CNPJ Entrega</mat-label>
            <input matInput formControlName="deliveryCnpj">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Insc. Estadual</mat-label>
            <input matInput formControlName="deliveryIe">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Bairro</mat-label>
            <input matInput formControlName="deliveryBairro">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-2">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="deliveryPhone">
          </mat-form-field>
        </div>

        <h4 class="section-title">Transportadora</h4>
        <div class="row">
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Nome da Transportadora</mat-label>
            <input matInput formControlName="carrierName">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="carrierPhone">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-3">
            <mat-label>Contato</mat-label>
            <input matInput formControlName="carrierContact">
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
      <button mat-button color="accent" (click)="createFiveTestRecords()">Gerar 5 Pedidos Teste</button>
      <button mat-button color="accent" (click)="createTestRecord()">Modelo Imagem</button>
      <button mat-raised-button (click)="novo()">Novo Pedido</button>
      <button mat-raised-button color="primary" (click)="gravar()" [disabled]="orderForm.invalid">Gravar</button>
      <button mat-raised-button color="accent" (click)="atualizar()" [disabled]="!orderForm.get('id')?.value">Atualizar</button>
      <button mat-raised-button color="warn" [matMenuTriggerFor]="pdfMenu">
        <mat-icon>picture_as_pdf</mat-icon> PDF
      </button>
      <mat-menu #pdfMenu="matMenu">
        <button mat-menu-item (click)="generatePDF('preview')">
          <mat-icon>visibility</mat-icon>
          <span>Visualizar PDF</span>
        </button>
        <button mat-menu-item (click)="generatePDF('download')" [disabled]="!orderForm.get('id')?.value">
          <mat-icon>download</mat-icon>
          <span>Baixar PDF</span>
        </button>
        <button mat-menu-item (click)="generatePDF('share')" [disabled]="!orderForm.get('id')?.value">
          <mat-icon>share</mat-icon>
          <span>Compartilhar PDF</span>
        </button>
      </mat-menu>
      <button mat-button color="warn" (click)="excluir()" [disabled]="!orderForm.get('id')?.value">Excluir</button>
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

  .supplier-logo {
    max-width: 180px;
    max-height: 100px;
    object-fit: contain;
    border: 1px solid #eee;
    padding: 5px;
    background: white;
  }
  
  .logo-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px;
  }

  mat-card {
    padding: 24px !important;
  }

  @media (max-width: 480px) {
    .order-container { padding: 5px; }
    mat-card { padding: 12px !important; }
    mat-card-actions {
      flex-direction: column;
      gap: 8px;
    }
    mat-card-actions button { width: 100%; }
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
  private pdfService = inject(PdfService);

  orderForm = this.fb.group({
    id: [null as string | null],
    orderNumber: ['', Validators.required],
    orderDate: [new Date().toISOString(), Validators.required],
    customerOc: [''],
    email: [''],
    deliveryDate: [null as string | null],
    paymentTerms: [''],
    freightType: ['FOB'],
    observation: [''],
    customerId: [null as string | null, Validators.required],
    supplierId: [null as string | null, Validators.required],
    // Fornecedor Detalhado
    supplierName: [''],
    supplierAddress: [''],
    supplierNumber: [''],
    supplierZip: [''],
    supplierBairro: [''],
    supplierCity: [''],
    supplierState: [''],
    supplierCnpj: [''],
    supplierIe: [''],
    supplierEmail: [''],
    supplierPhone: [''],
    representativeName: [''],
    representativePhone: [''],
    // Cliente Detalhado
    customerName: [''],
    customerAddress: [''],
    customerNumber: [''],
    customerZip: [''],
    customerBairro: [''],
    customerCity: [''],
    customerState: [''],
    customerCnpj: [''],
    customerIe: [''],
    customerContact: [''],
    customerEmail: [''],
    // Entrega
    deliveryName: [''],
    deliveryAddress: [''],
    deliveryCity: [''],
    deliveryState: [''],
    deliveryBairro: [''],
    deliveryPhone: [''],
    deliveryCnpj: [''],
    deliveryIe: [''],
    deliveryZip: [''],
    // Transporte
    carrierName: [''],
    carrierPhone: [''],
    carrierContact: [''],
    // Cobrança
    billingAddress: [''],
    billingCity: [''],
    billingState: [''],
    billingZip: [''],
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

    if (state && state['selectedOrder']) {
      this.loadOrder(state['selectedOrder']);
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

  onSupplierSelect(id: any) {
    if (!id) return;

    // Busca os dados atualizados do fornecedor para garantir que o logo (ou novos dados) apareçam
    this.orderService.getSuppliers().subscribe(suppliers => {
      const s = suppliers.find(x => String(x.id) === String(id));
      this.selectedSupplier.set(s || null);
      if (s) {
        this.orderForm.patchValue({
          supplierName: s.name,
          supplierAddress: s.address,
          supplierNumber: s.number,
          supplierZip: s.zipcode,
          supplierBairro: s.neighborhood,
          supplierCity: s.city,
          supplierState: s.state,
          supplierCnpj: s.cnpj || '',
          supplierIe: s.state_registration || '',
          supplierEmail: s.email || '',
          supplierPhone: s.phone || '',
          representativeName: s.representativeName || '',
          representativePhone: s.representativePhone || ''
        });
      }
    });
    this.checkNextNumber();
  }

  getLogoUrl(): string {
    const logo = this.selectedSupplier()?.logo_filename;
    if (!logo) return '';
    // Se for Base64 (começa com data:image) ou uma URL completa, retorna direto
    if (logo.startsWith('data:image') || logo.startsWith('http')) {
      return logo;
    }
    // Fallback para URLs antigas se houver
    return logo;
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
        customerName: c.name,
        customerAddress: c.address,
        customerNumber: c.number,
        customerZip: c.zipcode,
        customerBairro: c.neighborhood,
        customerCity: c.city,
        customerState: c.state,
        customerCnpj: c.cnpj,
        customerIe: c.state_registration,
        customerContact: (c as any).contact,
        customerEmail: c.email,
        // Default delivery as well
        deliveryName: c.name,
        deliveryAddress: c.address,
        deliveryCity: c.city,
        deliveryState: c.state,
        deliveryZip: c.zipcode,
        deliveryCnpj: c.cnpj,
        deliveryIe: c.state_registration,
        deliveryBairro: c.neighborhood,
        deliveryPhone: c.phone,
        billingAddress: c.address,
        billingCity: c.city,
        billingState: c.state,
        billingZip: c.zipcode
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
      id: o.id ? String(o.id) : null,
      orderNumber: o.orderNumber,
      orderDate: o.orderDate,
      customerOc: o.customerOc,
      paymentTerms: o.paymentTerms,
      freightType: o.freightType,
      observation: o.observation,
      customerId: o.customerId ? String(o.customerId) : null,
      supplierId: o.supplierId ? String(o.supplierId) : null,
      isLegacy: !!o.isLegacy,
      // Fornecedor
      supplierName: (o as any).supplierName,
      supplierAddress: (o as any).supplierAddress,
      supplierNumber: (o as any).supplierNumber,
      supplierZip: (o as any).supplierZip,
      supplierBairro: (o as any).supplierBairro,
      supplierCity: (o as any).supplierCity,
      supplierState: (o as any).supplierState,
      supplierCnpj: (o as any).supplierCnpj,
      supplierIe: (o as any).supplierIe,
      supplierEmail: (o as any).supplierEmail,
      supplierPhone: (o as any).supplierPhone,
      // Cliente
      customerName: (o as any).customerName,
      customerAddress: (o as any).customerAddress,
      customerNumber: (o as any).customerNumber,
      customerZip: (o as any).customerZip,
      customerBairro: (o as any).customerBairro,
      customerCity: (o as any).customerCity,
      customerState: (o as any).customerState,
      customerCnpj: (o as any).customerCnpj,
      customerIe: (o as any).customerIe,
      customerContact: (o as any).customerContact,
      customerEmail: (o as any).customerEmail,
      // Entrega
      deliveryName: o.deliveryName,
      deliveryAddress: o.deliveryAddress,
      deliveryCity: o.deliveryCity,
      deliveryState: o.deliveryState,
      deliveryCnpj: o.deliveryCnpj,
      deliveryIe: o.deliveryIe,
      deliveryZip: o.deliveryZip,
      deliveryPhone: o.deliveryPhone,
      deliveryBairro: (o as any).deliveryBairro,
      // Transporte
      carrierName: (o as any).carrierName,
      carrierPhone: (o as any).carrierPhone,
      carrierContact: (o as any).carrierContact,
      // Cobrança
      billingAddress: o.billingAddress,
      billingCity: (o as any).billingCity,
      billingState: (o as any).billingState,
      billingZip: (o as any).billingZip
    });
    this.selectedSupplier.set(o.supplier || null);

    // Se o pedido tiver um ID de fornecedor mas não o objeto completo, tenta carregar para mostrar o logo
    if (!o.supplier && o.supplierId) {
      this.orderService.getSuppliers().subscribe(suppliers => {
        const found = suppliers.find(s => String(s.id) === String(o.supplierId));
        if (found) this.selectedSupplier.set(found);
      });
    }

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

  createTestRecord() {
    this.novo();
    this.orderForm.patchValue({
      orderNumber: '185',
      orderDate: new Date('2025-08-08').toISOString(),
      customerOc: '36335',
      deliveryDate: new Date('2025-08-28').toISOString(),
      paymentTerms: '28/35/42/49/56 DIAS DA DATA DE FATURAMENTO, LÍQUIDO.',
      freightType: 'CIF',
      supplierName: 'CCS IND. E COM. DE EMBALAGENS PLASTICAS LTDA.',
      supplierCnpj: '80.130.487/0001-66',
      supplierIe: '251.553.949',
      supplierAddress: 'RODOVIA SC 443, KM 03',
      supplierNumber: 'S/N',
      supplierZip: '88820-000',
      supplierBairro: 'PRESIDENTE VARGAS',
      supplierCity: 'IÇARA',
      supplierState: 'SC',
      supplierEmail: 'ccs.emb@terra.com.br',
      supplierPhone: '48 3462-1864/1462',
      customerName: 'PRODUTOS ALIMENTICIOS SUPERBOM IND. E COM. LTDA.',
      customerCnpj: '53.135.232/0001-13',
      customerIe: '100.014.624.117',
      customerContact: 'JOÃO GOMES',
      customerEmail: 'compras.01@superbom.com.br',
      deliveryName: 'PRODUTOS ALIMENTICIOS SUPERBOM IND. E COM. LTDA.',
      deliveryAddress: 'RUA DOMINGOS PEIXOTO DA SILVA, 245',
      deliveryCity: 'SÃO PAULO',
      deliveryState: 'SP',
      deliveryCnpj: '53.135.232/0001-13',
      deliveryIe: '100.014.624.117',
      deliveryBairro: 'CAPÃO REDONDO',
      deliveryPhone: '11 2842-1807',
      deliveryZip: '05868-680',
      carrierName: '',
      representativeName: 'MARCIO FERNANDES LUCCHESE',
      representativePhone: 'CEL. 11 94972-4778',
      observation: 'REEMBALAGEM RETORNÁVEL PARA TRANSPORTE E ARMAZENAMENTO: CAIXAS DE PAPELÃO.\n\nA MERCADORIA SOMENTE SERÁ ACEITA SE O NUMERO DA ORDEM DE COMPRA ESTIVER DESTACADO NA NOTA FISCAL.'
    });

    this.items.clear();
    const testItems = [
      { name: 'FRASCO 200 G', code: '', qty: 36, price: 678.80, ipi: 0 },
      { name: 'TAMPA TIPO CONE', code: '', qty: 36, price: 287.20, ipi: 0 },
      { name: 'SOBRE-TAMPA TRANSPARENTE', code: '', qty: 36, price: 234.15, ipi: 0 },
      { name: 'MÃO-DE-OBRA PARA APLICAÇÃO DE SELOS E MONTAGEM DE TAMPAS', code: '', qty: 36, price: 116.25, ipi: 0 }
    ];

    testItems.forEach(i => {
      const g = this.fb.group({
        productName: [i.name, Validators.required],
        productCode: [i.code],
        caseQuantity: [1],
        weight: [0],
        quantity: [i.qty],
        pricePerThousand: [i.price],
        subtotal: [i.qty * i.price],
        ipi: [i.ipi],
        total: [i.qty * i.price]
      });
      this.items.push(g);
    });

    this.snackBar.open('Dados fiéis carregados! Agora clique em Preview PDF (Paisagem).', 'OK', { duration: 3000 });
  }

  createFiveTestRecords() {
    this.snackBar.open('Gerando 5 pedidos de teste...', 'Aguarde');
    const baseNum = Math.floor(Math.random() * 1000);

    for (let i = 1; i <= 5; i++) {
      const orderNum = (baseNum + i).toString();
      const mockOrder: any = {
        orderNumber: orderNum,
        orderDate: new Date().toISOString(),
        customerOc: 'OC-' + orderNum,
        supplierName: 'FORNECEDOR TESTE ' + i,
        customerName: 'CLIENTE TESTE ' + i,
        deliveryName: 'CLIENTE TESTE ' + i,
        deliveryCity: 'SÃO PAULO',
        deliveryState: 'SP',
        paymentTerms: '30 DIAS',
        freightType: 'CIF',
        items: [
          { productName: 'PRODUTO A', quantity: 10, pricePerThousand: 100, subtotal: 1000, ipi: 0, total: 1000 },
          { productName: 'PRODUTO B', quantity: 20, pricePerThousand: 50, subtotal: 1000, ipi: 0, total: 1000 }
        ]
      };

      this.orderService.createOrder(mockOrder).subscribe();
    }

    setTimeout(() => {
      this.snackBar.open('5 Pedidos gerados com sucesso! Verifique o Histórico.', 'OK', { duration: 4000 });
    }, 2000);
  }

  generatePDF(action: 'preview' | 'download' | 'share' = 'download') {
    const data = this.orderForm.getRawValue();
    this.pdfService.generateOrderPDF(data, action);
  }

  excluir() {
    const id = this.orderForm.get('id')?.value;
    if (confirm('Excluir?')) {
      this.orderService.deleteOrder(id!).subscribe(() => { this.novo(); this.snackBar.open('Excluído', 'OK', { duration: 2000 }); });
    }
  }
}
