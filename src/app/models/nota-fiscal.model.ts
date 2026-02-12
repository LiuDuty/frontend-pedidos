export interface NotaFiscal {
    id?: number;
    mes_ano?: string;
    data_pedido?: string;
    data_entrega?: string;
    data_fatura?: string;
    cliente: string;
    produto: string;
    pedido?: string;
    oc_cliente?: string;
    quantidade?: number;
    unidade?: string;
    preco_unitario?: number;
    valor_total?: number;
    comissao?: number;
    nf?: string;
    saldo?: number;
    observacao?: string;
    origem?: string;
    created_at?: string;
}
