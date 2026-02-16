import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    private snackBar = inject(MatSnackBar);

    generateOrderPDF(data: any, action: 'preview' | 'download' | 'share' = 'download') {
        const doc = new jsPDF('l', 'mm', 'a4'); // LANDSCAPE

        // Configurações Globais
        const bgColor = [217, 234, 247];
        const margin = 10;
        const pageWidth = 297; // Landscape width
        let currentY = 10;

        // --- CABEÇALHO ---
        doc.setDrawColor(0);
        doc.setLineWidth(0.4);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 28);

        // Tenta obter o logo do objeto de dados primeiro (Base64)
        const logoData = data.supplier?.logo_filename || data.logo_filename;
        const logoImg = document.querySelector('.supplier-logo') as HTMLImageElement;

        let logoUsed = false;

        if (logoData && (logoData.startsWith('data:image') || logoData.startsWith('http'))) {
            try {
                doc.addImage(logoData, 'PNG', margin + 5, currentY + 2, 45, 24);
                logoUsed = true;
            } catch (e) {
                console.warn('Erro ao carregar logo dos dados:', e);
            }
        }

        if (!logoUsed && logoImg && logoImg.complete && logoImg.naturalWidth !== 0 && logoImg.style.display !== 'none') {
            try {
                doc.addImage(logoImg, 'PNG', margin + 5, currentY + 2, 45, 24);
                logoUsed = true;
            } catch (e) {
                console.warn('Erro ao carregar logo do DOM:', e);
            }
        }

        if (!logoUsed) {
            doc.setFontSize(26);
            doc.setFont('helvetica', 'bold');
            doc.text('Marcann', margin + 10, currentY + 18);
        }

        doc.setFontSize(10);
        doc.text('M F LUCCHESE ASSESSORIA E CONSULTORIA EMPRESARIAL LTDA.', pageWidth / 2, currentY + 12, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text('SÃO PAULO - SP', pageWidth / 2, currentY + 18, { align: 'center' });

        const repX = 220;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Representante:', repX, currentY + 6);
        doc.setLineWidth(0.2);

        // Nome do Representante - Fundo Azul
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(repX, currentY + 7, 55, 6, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.text(String(data.representativeName || ''), repX + 2, currentY + 11.5);

        // Telefone do Representante - Fundo Azul
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(repX, currentY + 13, 55, 6, 'FD');
        doc.text(String(data.representativePhone || ''), repX + 2, currentY + 17.5);

        currentY += 32;

        const drawCell = (x: number, y: number, w: number, h: number, label: string, value: any, fillVal: boolean = true) => {
            doc.setDrawColor(0);
            doc.setLineWidth(0.2);
            doc.rect(x, y, w, h);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text(label.toUpperCase(), x + 1.5, y + 3.5);
            if (fillVal) {
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                doc.rect(x + 0.2, y + 4.5, w - 0.4, h - 4.7, 'F');
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text(String(value || ''), x + w / 2, y + h - 1.5, { align: 'center' });
            }
        };

        // --- FORNECEDOR ---
        const colW = (pageWidth - 2 * margin);
        drawCell(margin, currentY, colW * 0.4, 10, 'FORNECEDOR', data.supplierName);
        drawCell(margin + colW * 0.4, currentY, colW * 0.35, 10, 'ENDEREÇO', data.supplierAddress);
        drawCell(margin + colW * 0.75, currentY, colW * 0.05, 10, 'NUMERO', data.supplierNumber);
        drawCell(margin + colW * 0.8, currentY, colW * 0.2, 10, 'CEP', data.supplierZip);
        currentY += 10;

        drawCell(margin, currentY, colW * 0.2, 10, 'BAIRRO', data.supplierBairro);
        drawCell(margin + colW * 0.2, currentY, colW * 0.2, 10, 'CIDADE', data.supplierCity);
        drawCell(margin + colW * 0.4, currentY, colW * 0.04, 10, 'UF', data.supplierState);
        drawCell(margin + colW * 0.44, currentY, colW * 0.3, 10, 'E-MAIL', data.supplierEmail);
        drawCell(margin + colW * 0.74, currentY, colW * 0.26, 10, 'TELEFONE', data.supplierPhone);
        currentY += 10;

        drawCell(margin + colW * 0.2, currentY, colW * 0.15, 8, 'CNPJ', data.supplierCnpj);
        drawCell(margin + colW * 0.35, currentY, colW * 0.4, 8, 'INSCRIÇÃO ESTADUAL', data.supplierIe);
        currentY += 10;

        // --- CLIENTE ---
        drawCell(margin, currentY, colW * 0.4, 10, 'CLIENTE', data.customerName);
        drawCell(margin + colW * 0.4, currentY, colW * 0.35, 10, 'ENDEREÇO', data.deliveryAddress);
        drawCell(margin + colW * 0.75, currentY, colW * 0.05, 10, 'NUMERO', '245');
        drawCell(margin + colW * 0.8, currentY, colW * 0.2, 10, 'CEP', data.deliveryZip);
        currentY += 10;

        drawCell(margin, currentY, colW * 0.2, 10, 'BAIRRO', data.deliveryBairro);
        drawCell(margin + colW * 0.2, currentY, colW * 0.2, 10, 'CIDADE', data.deliveryCity);
        drawCell(margin + colW * 0.4, currentY, colW * 0.04, 10, 'UF', data.deliveryState);
        drawCell(margin + colW * 0.44, currentY, colW * 0.4, 10, 'E-MAIL Nfe', data.customerEmail);
        drawCell(margin + colW * 0.84, currentY, colW * 0.16, 10, 'TELEFONE', data.deliveryPhone);
        currentY += 10;

        drawCell(margin, currentY, colW * 0.2, 8, 'CNPJ', data.customerCnpj);
        drawCell(margin + colW * 0.2, currentY, colW * 0.15, 8, 'INSCRIÇÃO ESTADUAL', data.customerIe);
        drawCell(margin + colW * 0.35, currentY, colW * 0.35, 8, 'CONTATO', data.customerContact);
        drawCell(margin + colW * 0.7, currentY, colW * 0.3, 8, 'E-MAIL', data.customerEmail);
        currentY += 10;

        // --- PEDIDO ---
        const oD = data.orderDate ? new Date(data.orderDate).toLocaleDateString() : '';
        const dD = data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString() : '';

        drawCell(margin, currentY, colW * 0.08, 8, 'PEDIDO', data.orderNumber);
        drawCell(margin + colW * 0.08, currentY, colW * 0.1, 8, 'DATA DO PEDIDO', oD);
        drawCell(margin + colW * 0.18, currentY, colW * 0.45, 8, 'ORDEM DE COMPRA DO CLIENTE', data.customerOc);
        drawCell(margin + colW * 0.63, currentY, colW * 0.37, 8, 'DATA DE ENTREGA NO CLIENTE', dD);
        currentY += 10;

        // --- ENTREGA ---
        drawCell(margin, currentY, colW * 0.15, 8, 'ENDEREÇO DE ENTREGA', '');
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin + colW * 0.15 + 0.2, currentY + 4.2, colW * 0.4 - 0.4, 3.6, 'F');
        doc.text('ACIMA', margin + colW * 0.35, currentY + 7, { align: 'center' });
        drawCell(margin + colW * 0.55, currentY, colW * 0.4, 8, 'CIDADE', data.deliveryCity);
        drawCell(margin + colW * 0.95, currentY, colW * 0.05, 8, 'UF', data.deliveryState);
        currentY += 8;

        drawCell(margin, currentY, colW * 0.2, 8, 'CNPJ', data.deliveryCnpj);
        drawCell(margin + colW * 0.2, currentY, colW * 0.25, 8, 'INSCRIÇÃO ESTADUAL', data.deliveryIe);
        drawCell(margin + colW * 0.45, currentY, colW * 0.3, 8, 'BAIRRO', data.deliveryBairro);
        drawCell(margin + colW * 0.75, currentY, colW * 0.2, 8, 'TELEFONE', data.deliveryPhone);
        drawCell(margin + colW * 0.95, currentY, colW * 0.05, 8, 'UF', data.deliveryState);
        currentY += 8;

        drawCell(margin, currentY, colW * 0.45, 8, 'TRANSPORTADORA', data.carrierName);
        drawCell(margin + colW * 0.45, currentY, colW * 0.25, 8, 'TELEFONE', data.carrierPhone);
        drawCell(margin + colW * 0.7, currentY, colW * 0.3, 8, 'CONTATO', data.carrierContact);
        currentY += 10;

        // --- COBRANÇA ---
        drawCell(margin, currentY, colW * 0.15, 8, 'ENDEREÇO DE COBRANÇA', '');
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin + colW * 0.15 + 0.2, currentY + 4.2, colW * 0.4 - 0.4, 3.6, 'F');
        doc.text('O MESMO', margin + colW * 0.35, currentY + 7, { align: 'center' });
        drawCell(margin + colW * 0.55, currentY, colW * 0.4, 8, 'CIDADE', data.deliveryCity);
        drawCell(margin + colW * 0.95, currentY, colW * 0.05, 8, 'UF', data.deliveryState);
        currentY += 10;

        // --- FRETE / PAGAMENTO ---
        doc.rect(margin, currentY, pageWidth - 2 * margin, 8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('FRETE', margin + 3, currentY + 5.5);
        doc.text('CIF', margin + 20, currentY + 5.5);
        doc.rect(margin + 28, currentY + 1.5, 5, 5);
        if (data.freightType === 'CIF') { doc.setFont('helvetica', 'bold'); doc.text('X', margin + 29.5, currentY + 5.2); doc.setFont('helvetica', 'normal'); }
        doc.text('FOB', margin + 45, currentY + 5.5);
        doc.rect(margin + 53, currentY + 1.5, 5, 5);
        if (data.freightType === 'FOB') { doc.setFont('helvetica', 'bold'); doc.text('X', margin + 54.5, currentY + 5.2); doc.setFont('helvetica', 'normal'); }
        doc.text('CONDIÇÃO DE PAGAMENTO', margin + 75, currentY + 5.5);
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin + 120, currentY + 1, colW - 120, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text(String(data.paymentTerms || ''), margin + 180, currentY + 5.5, { align: 'center' });
        currentY += 12;

        const items = data.items || data.orderItems || [];
        const tItems = items.map((i: any) => [
            i.quantity,
            'MIL',
            i.productName,
            i.pricePerThousand.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            i.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            (i.ipi || 0),
            '0,00',
            (i.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['QUANTIDADE', 'UND', 'PRODUTO', 'PREÇO/UND (R$)', 'SUB TOTAL (R$)', 'IPI (%)', 'VALOR IPI (%)', 'TOTAL/ITEM (R$)']],
            body: tItems,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1, textColor: 0, lineColor: 0, lineWidth: 0.25 },
            headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 20, halign: 'center' },
                1: { cellWidth: 10, halign: 'center' },
                2: { cellWidth: 'auto' },
                3: { halign: 'right', cellWidth: 35 },
                4: { halign: 'right', cellWidth: 35 },
                5: { halign: 'center', cellWidth: 15 },
                6: { halign: 'right', cellWidth: 25 },
                7: { halign: 'right', cellWidth: 35 }
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 2;

        const itemCount = items.length;
        if (itemCount > 4 && currentY > 165) {
            doc.addPage();
            currentY = 10;
        } else if (currentY > 185) {
            doc.addPage();
            currentY = 10;
        }

        const tot = items.reduce((acc: number, item: any) => acc + (item.total || 0), 0);
        doc.setFont('helvetica', 'bold');
        doc.rect(margin + colW * 0.75, currentY, colW * 0.25, 8);
        doc.setFontSize(8);
        doc.text('TOTAL/CONJUNTO (R$)', margin + colW * 0.76, currentY + 5.5);
        doc.setFontSize(10);
        doc.text(tot.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), margin + colW * 0.99, currentY + 5.5, { align: 'right' });

        currentY += 12;
        doc.rect(margin, currentY, pageWidth - 2 * margin, 25);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVAÇÕES', margin + 2, currentY + 5);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const obsText = data.observation || '';
        const splitObs = doc.splitTextToSize(obsText, pageWidth - 2 * margin - 5);
        doc.text(splitObs, margin + 2, currentY + 10);

        if (action === 'preview') {
            window.open(doc.output('bloburl'), '_blank');
        } else if (action === 'share') {
            const blob = doc.output('blob');
            const filename = `Pedido_${data.orderNumber}_MF_Lucchese.pdf`;
            const file = new File([blob], filename, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: `Pedido ${data.orderNumber}`,
                    text: `Segue em anexo o pedido ${data.orderNumber} da Marcann.`
                }).catch(err => {
                    if (err.name !== 'AbortError') {
                        this.snackBar.open('Erro ao compartilhar: ' + err.message, 'OK');
                    }
                });
            } else {
                this.snackBar.open('Seu navegador não suporta compartilhamento de arquivos.', 'OK', { duration: 3000 });
            }
        } else {
            doc.save(`Pedido_${data.orderNumber}_MF_Lucchese.pdf`);
        }
    }
}
