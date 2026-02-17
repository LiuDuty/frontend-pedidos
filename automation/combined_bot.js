const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_NUMBER = '5511975040117';
const TARGET_JID = `${TARGET_NUMBER}@c.us`;
const MESSAGES_DIR = path.join(__dirname, 'messages');
const PROCESSED_DIR = path.join(__dirname, 'processed');
const FRONTEND_PATH = path.join(__dirname, '..');
const QR_IMAGE_PATH = path.join(__dirname, 'qrcode.png');

fs.ensureDirSync(MESSAGES_DIR);
fs.ensureDirSync(PROCESSED_DIR);

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    console.log('\n--- NOVO QR CODE GERADO! ---');
    try {
        await QRCode.toFile(QR_IMAGE_PATH, qr);
        console.log('✅ QR Code salvo em qrcode.png');
    } catch (err) {
        console.error('Erro ao gerar QR:', err);
    }
});

client.on('ready', () => {
    console.log('\n✅ BOT CONECTADO E PRONTO!');
    if (fs.existsSync(QR_IMAGE_PATH)) fs.unlinkSync(QR_IMAGE_PATH);

    // Inicia o loop do processador apenas quando o cliente estiver pronto
    startProcessor();
});

async function handleMessage(msg) {
    console.log(`📩 Mensagem recebida de: ${msg.from} [Me: ${msg.fromMe}]`);

    // Suporte para mensagens diretas e grupos onde o número alvo está
    const isFromTarget = (msg.from.includes(TARGET_NUMBER) || msg.author?.includes(TARGET_NUMBER)) && !msg.fromMe;

    if (isFromTarget) {
        const timestamp = Date.now();
        const filename = `msg_PENDING_${timestamp}.txt`;
        await fs.writeFile(path.join(MESSAGES_DIR, filename), msg.body, 'utf8');
        console.log(`🎯 COMANDO ALVO DETECTADO: "${msg.body}"`);
        await client.sendMessage(msg.from, `🚀 Antigravity: Comando agendado!`);
    }
}

client.on('message', handleMessage);
client.on('message_create', (msg) => {
    // message_create pega mensagens enviadas por VOCÊ também, mas handleMessage filtra !msg.fromMe
    if (msg.fromMe && msg.to === TARGET_JID) {
        // Log opcional para monitorar o que sai do bot
    }
});

async function sendStatus(message) {
    try {
        await client.sendMessage(TARGET_JID, message);
        console.log(`✅ Status enviado: ${message.substring(0, 50)}...`);
    } catch (err) {
        console.error('Erro ao enviar status:', err.message);
    }
}

async function processNextMessage() {
    try {
        const files = await fs.readdir(MESSAGES_DIR);
        const pendingFiles = files.filter(f => f.startsWith('msg_PENDING_')).sort();

        if (pendingFiles.length === 0) return;

        const filename = pendingFiles[0];
        const filepath = path.join(MESSAGES_DIR, filename);
        const commandText = await fs.readFile(filepath, 'utf8');

        console.log(`\n--- Processando: ${filename} ---`);

        await sendStatus(`🚀 *Deploy Iniciado*\n\n📝 Comando: "${commandText}"`);

        try {
            console.log('Buildando frontend...');
            execSync('npm run build', { cwd: FRONTEND_PATH, stdio: 'inherit' });

            console.log('Enviando para o Git...');
            execSync('git add .', { cwd: FRONTEND_PATH });
            // Escapa aspas para não quebrar o comando de commit
            const safeMsg = commandText.trim().replace(/"/g, '\\"').substring(0, 100);
            execSync(`git commit -m "Auto Release: ${safeMsg}"`, { cwd: FRONTEND_PATH });
            execSync('git push', { cwd: FRONTEND_PATH });

            await sendStatus(`🎉 *DEPLOY CONCLUÍDO COM SUCESSO!*\n\n✅ Build: OK\n✅ Push: OK`);

            const processedFilename = filename.replace('PENDING', 'SUCCESS');
            await fs.move(filepath, path.join(PROCESSED_DIR, processedFilename));
        } catch (err) {
            console.error('Erro no processamento:', err.message);
            await sendStatus(`❌ *ERRO NO DEPLOY*\n\n${err.message}`);
            const failedFilename = filename.replace('PENDING', 'FAILED');
            await fs.move(filepath, path.join(PROCESSED_DIR, failedFilename));
        }
    } catch (err) {
        console.error('Erro no loop do processador:', err);
    }
}

function startProcessor() {
    console.log('Processador de comandos ativado...');
    setInterval(processNextMessage, 30000);
    processNextMessage();
}

client.initialize();
