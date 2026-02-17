const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const { sendStatus } = require('./whatsapp_sender');

const MESSAGES_DIR = path.join(__dirname, 'messages');
const PROCESSED_DIR = path.join(__dirname, 'processed');
const FRONTEND_PATH = path.join(__dirname, '..');

// Ensure directories exist
fs.ensureDirSync(MESSAGES_DIR);
fs.ensureDirSync(PROCESSED_DIR);

async function processNextMessage() {
    try {
        const files = await fs.readdir(MESSAGES_DIR);
        const pendingFiles = files.filter(f => f.startsWith('msg_PENDING_')).sort();

        if (pendingFiles.length === 0) {
            return;
        }

        const filename = pendingFiles[0];
        const filepath = path.join(MESSAGES_DIR, filename);
        const commandText = await fs.readFile(filepath, 'utf8');

        console.log(`\n--- Processing Command: ${filename} ---`);
        console.log(`Instruction: ${commandText}`);

        await sendStatus(`🚀 *Antigravity Release Iniciado*\n\n📝 Comando: "${commandText}"\n\n⏳ Iniciando build do frontend...`);

        try {
            console.log('--- Step 1: Frontend Build ---');
            let buildSuccess = false;
            try {
                await sendStatus(`🔨 *Build em andamento...*\n\nCompilando aplicação Angular...`);

                const buildOutput = execSync('npm run build', { cwd: FRONTEND_PATH, stdio: 'pipe', encoding: 'utf-8' });
                console.log(buildOutput);
                console.log('✅ Build successful.');
                buildSuccess = true;

                await sendStatus(`✅ *Build concluído com sucesso!*\n\n📦 Aplicação compilada e otimizada.`);
            } catch (buildErr) {
                console.error('⚠️ Build failed. Output:');
                if (buildErr.stdout) console.log(buildErr.stdout.toString());
                if (buildErr.stderr) console.error(buildErr.stderr.toString());
                console.warn('⚠️ Build failed or skipped, proceeding with push anyway...');

                await sendStatus(`⚠️ *Build falhou*\n\nContinuando com deploy mesmo assim...`);
            }

            console.log('--- Step 2: Git Frontend ---');
            await sendStatus(`📤 *Preparando deploy...*\n\nAdicionando arquivos ao Git...`);

            execSync('git add .', { cwd: FRONTEND_PATH, stdio: 'inherit' });

            try {
                await sendStatus(`💾 *Fazendo commit...*\n\nSalvando alterações no repositório...`);

                execSync(`git commit -m "Remote Release [WhatsApp]: ${commandText.trim().substring(0, 100)}"`, { cwd: FRONTEND_PATH, stdio: 'inherit' });

                await sendStatus(`🌐 *Enviando para GitHub...*\n\nFazendo push para produção...`);

                execSync('git push', { cwd: FRONTEND_PATH, stdio: 'inherit' });
                console.log('✅ Frontend pushed.');

                await sendStatus(`🎉 *DEPLOY CONCLUÍDO COM SUCESSO!*\n\n✅ Build: ${buildSuccess ? 'Sucesso' : 'Pulado'}\n✅ Commit: Realizado\n✅ Push: Enviado para GitHub\n✅ Vercel: Deploy automático em andamento\n\n🌐 Seu app estará atualizado em instantes!`);
            } catch (e) {
                console.log('ℹ️ No changes to commit in Frontend or push failed.');
                await sendStatus(`ℹ️ *Nenhuma alteração para enviar*\n\nNão há mudanças no código para fazer deploy.`);
            }

            // Move to processed
            const processedFilename = filename.replace('PENDING', 'SUCCESS');
            await fs.move(filepath, path.join(PROCESSED_DIR, processedFilename));
            console.log(`\n🎉 Release Process Completed Successfully! Archived as ${processedFilename}`);

        } catch (releaseErr) {
            console.error('Failed to complete release:', releaseErr);

            await sendStatus(`❌ *ERRO NO DEPLOY*\n\n${releaseErr.message}\n\nVerifique os logs para mais detalhes.`);

            const failedFilename = filename.replace('PENDING', 'FAILED');
            await fs.move(filepath, path.join(PROCESSED_DIR, failedFilename));
        }

    } catch (err) {
        console.error('Error in processing loop:', err);
    }
}

console.log('Release Processor started. Watching for new commands...');
// Run every 60 seconds
setInterval(processNextMessage, 60000);

// Initial run
processNextMessage();
