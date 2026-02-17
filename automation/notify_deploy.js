const { sendStatus } = require('./whatsapp_sender.js');

const message = `🚀 *Deploy Concluído*

A funcionalidade de *Importar Itens de Pedidos Anteriores* foi implementada e enviada para produção com sucesso.

✅ Código Buildado
✅ Push realizado para o repositório
✅ Sistema atualizado`;

async function notify() {
    console.log('Iniciando notificação de status...');
    const result = await sendStatus(message);
    if (result) {
        console.log('Notificação enviada com sucesso!');
        process.exit(0);
    } else {
        console.error('Falha ao enviar notificação.');
        process.exit(1);
    }
}

notify();
