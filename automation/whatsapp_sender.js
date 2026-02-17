const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const TARGET_NUMBER = '5511975040117';
const TARGET_JID = `${TARGET_NUMBER}@c.us`;

let clientInstance = null;
let isReady = false;

function initializeClient() {
    if (clientInstance) return clientInstance;

    clientInstance = new Client({
        authStrategy: new LocalAuth({
            dataPath: path.join(__dirname, '.wwebjs_auth')
        }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    clientInstance.on('ready', () => {
        isReady = true;
        console.log('📱 WhatsApp Sender ready!');
    });

    clientInstance.on('disconnected', () => {
        isReady = false;
        console.log('📱 WhatsApp Sender disconnected.');
    });

    clientInstance.initialize();
    return clientInstance;
}

async function sendStatus(message) {
    try {
        if (!clientInstance) {
            initializeClient();
        }

        // Wait for client to be ready (max 30 seconds)
        let attempts = 0;
        while (!isReady && attempts < 60) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

        if (!isReady) {
            console.error('❌ WhatsApp client not ready after 30s');
            return false;
        }

        await clientInstance.sendMessage(TARGET_JID, message);
        console.log(`✅ Status sent: ${message.substring(0, 50)}...`);
        return true;
    } catch (error) {
        console.error('❌ Error sending WhatsApp message:', error.message);
        return false;
    }
}

module.exports = { sendStatus, initializeClient };
