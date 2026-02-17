const fs = require('fs-extra');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, 'messages');
fs.ensureDirSync(MESSAGES_DIR);

const message = `🚀 *Deploy Concluído*

A funcionalidade de *Importar Itens de Pedidos Anteriores* foi implementada e enviada para produção com sucesso.

✅ Código Buildado
✅ Push realizado para o repositório
✅ Sistema atualizado`;

const timestamp = Date.now();
const filename = `msg_PENDING_${timestamp}.txt`;
const filepath = path.join(MESSAGES_DIR, filename);

fs.writeFileSync(filepath, message, 'utf8');
console.log(`Mensagem de notificação agendada para o WhatsApp via arquivo: ${filename}`);
