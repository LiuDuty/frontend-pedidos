export interface Supplier {
    id: number;
    name: string;
    logo_filename?: string;
    address?: string;
    number?: string;
    zipcode?: string;
    po_box?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    phone?: string;
    cnpj?: string;
    state_registration?: string;
    email?: string;
}

export interface Customer {
    id: number;
    name: string;
    address?: string;
    number?: string;
    zipcode?: string;
    po_box?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    phone?: string;
    contact?: string;
    email?: string;
    cnpj?: string;
    state_registration?: string;
}

export interface OrderItem {
    id?: number;
    productName: string;
    productCode?: string;
    caseQuantity: number;
    weight: number;
    quantity: number;
    unitPrice: number;
    ipi: number;
    orderId?: number;
}

export interface Order {
    id?: number;
    orderNumber: string;
    orderDate: string;
    customerOc?: string;
    email?: string;
    deliveryDate?: string;
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryState?: string;
    deliveryCnpj?: string;
    deliveryIe?: string;
    deliveryZip?: string;
    deliveryPhone?: string;
    billingAddress?: string;
    carrier?: string;
    carrierPhone?: string;
    carrierContact?: string;
    freightType?: string;
    paymentTerms?: string;
    observation?: string;
    customerId: number;
    supplierId: number;
    customer?: Customer;
    supplier?: Supplier;
    orderItems?: OrderItem[];
}
