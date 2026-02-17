export interface Supplier {
    id: number | string;
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
    representativeName?: string;
    representativePhone?: string;
}

export interface Customer {
    id: number | string;
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

export interface Carrier {
    id: number | string;
    name: string;
    address?: string;
    number?: string;
    zipcode?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    cnpj?: string;
    contact?: string;
    state_registration?: string;
}

export interface OrderItem {
    id?: number;
    productName: string;
    productCode?: string;
    caseQuantity: number;
    weight: number;
    quantity: number;
    pricePerThousand: number;
    subtotal: number;
    unitPrice?: number;
    ipi: number;
    total: number;
    orderId?: number;
}

export interface Order {
    id?: string | number;
    orderNumber: string;
    orderDate: string;
    customerOc?: string;
    email?: string;
    deliveryDate?: string;

    // Entrega
    deliveryName?: string;
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryState?: string;
    deliveryCnpj?: string;
    deliveryIe?: string;
    deliveryZip?: string;
    deliveryPhone?: string;

    // Cobrança
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;

    carrier?: string;
    carrierPhone?: string;
    carrierContact?: string;
    carrierId?: string | number;
    freightType?: string;
    paymentTerms?: string;
    observation?: string;
    customerId: number | string;
    supplierId: number | string;
    isLegacy?: boolean;
    customer?: Customer;
    supplier?: Supplier;
    carrierObj?: Carrier;
    representativeName?: string;
    representativePhone?: string;
    customerName?: string;
    supplierName?: string;
    orderItems?: OrderItem[];
}
