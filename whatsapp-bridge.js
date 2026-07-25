/**
 * ONIGAMA FX - Smart WhatsApp Assistant Bridge (CommonJS Version)
 * This script connects your real WhatsApp account to the Onigama FX AI panel using @whiskeysockets/baileys.
 * 
 * Instructions:
 * 1. Create a clean folder on your PC and run:
 *    npm init -y
 *    npm install @whiskeysockets/baileys qrcode-terminal axios
 * 
 * 2. Save this file as `whatsapp-bridge.js` inside that folder.
 * 
 * 3. Run:
 *    node whatsapp-bridge.js
 * 
 * 4. Scan the QR code shown in your local terminal.
 */

// Pre-flight check of required dependencies
const requiredDeps = ['@whiskeysockets/baileys', 'qrcode-terminal', 'axios'];
const missingDeps = [];
for (const dep of requiredDeps) {
    try {
        require(dep);
    } catch (e) {
        missingDeps.push(dep);
    }
}

if (missingDeps.length > 0) {
    console.error('\n================================================================');
    console.error('❌ خطا: کتابخانه‌های مورد نیاز یافت نشدند!');
    console.error('----------------------------------------------------------------');
    console.error('لطفاً مطمئن شوید دستور زیر را در خط فرمان (Terminal / Command Prompt)');
    console.error('دقیقاً در پوشه‌ای که این فایل ذخیره شده است، اجرا کرده‌اید:');
    console.error(`\nnpm install ${missingDeps.join(' ')}\n`);
    console.error('مراحل اجرا:');
    console.error('1. cd "آدرس_پوشه‌ای_که_فایل_در_آن_است"');
    console.error(`2. npm install ${missingDeps.join(' ')}`);
    console.error('3. node whatsapp-bridge.js');
    console.error('================================================================\n');
    process.exit(1);
}

const makeWASocket = require('@whiskeysockets/baileys').default || require('@whiskeysockets/baileys');
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Configure your panel's API address.
// If running locally, http://127.0.0.1:3000.
// If running with the cloud development sandbox, use the URL below:
const PANEL_URL = process.env.PANEL_URL || 'https://ass.onigama.com';

// Helper function to log both locally in terminal and remotely to the admin panel dashboard
async function logToPanel(level, message) {
    const timestamp = new Date().toLocaleTimeString('fa-IR');
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    try {
        await axios.post(`${PANEL_URL}/api/logs`, {
            level: level,
            message: message,
            source: 'whatsapp-bridge'
        });
    } catch (e) {
        // Log the failure to local terminal so user knows why server is not getting logs
        console.error(`⚠️ خطای شبکه: امکان اتصال به پنل در آدرس (${PANEL_URL}) وجود ندارد. علت: ${e.message}`);
    }
}

// Function to recursively traverse the message object and extract any text content
function extractTextOfMessage(message) {
    if (!message) return "";
    if (typeof message === 'string') return message;
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;
    if (message.documentMessage?.caption) return message.documentMessage.caption;
    
    // Recursive search for any non-empty string fields
    for (const key of Object.keys(message)) {
        const val = message[key];
        if (typeof val === 'string' && val.length > 0 && !key.startsWith('_')) {
            return val;
        }
        if (typeof val === 'object' && val !== null) {
            const nested = extractTextOfMessage(val);
            if (nested) return nested;
        }
    }
    return "";
}

async function connectToWhatsApp() {
    await logToPanel('info', '🔄 در حال راه‌اندازی پل ارتباطی وب‌واتس‌اپ (WhatsApp Bridge)...');

    // Polling interval tracker
    let pollInterval = null;

    // Polling function to send admin/agent/async-AI messages to real WhatsApp clients
    let isPolling = false;
    const pollOutboundMessages = async () => {
        if (isPolling) return;
        isPolling = true;
        try {
            const response = await axios.get(`${PANEL_URL}/api/chats/poll-outbound`);
            const pendingMessages = response.data;
            
            if (Array.isArray(pendingMessages) && pendingMessages.length > 0) {
                const successfullySentIds = [];
                for (const pending of pendingMessages) {
                    try {
                        const targetJid = pending.whatsappJid 
                            ? pending.whatsappJid 
                            : (pending.customerPhone.includes('@') 
                                ? pending.customerPhone 
                                : `${pending.customerPhone.replace(/[\s+]/g, '')}@s.whatsapp.net`);
                        
                        await logToPanel('info', `📤 ارسال پیام کارشناس/هوش‌مصنوعی به ${targetJid}: "${pending.text.substring(0, 50)}..."`);
                        await sock.sendMessage(targetJid, { text: pending.text });
                        
                        successfullySentIds.push(pending.messageId);
                    } catch (sendErr) {
                        await logToPanel('error', `❌ خطا در ارسال پیام به ${pending.customerPhone}: ${sendErr.message}`);
                    }
                }
                
                if (successfullySentIds.length > 0) {
                    await axios.post(`${PANEL_URL}/api/chats/acknowledge-outbound`, {
                        messageIds: successfullySentIds
                    });
                }
            }
        } catch (pollErr) {
            // Panel connection issues can be logged silently
            console.error(`[Outbound Poll Error]: ${pollErr.message}`);
        } finally {
            isPolling = false;
        }
    };

    // 1. Setup session storage for authentication
    const { state, saveCreds } = await useMultiFileAuthState('whatsapp_session');

    // 2. Spawn WhatsApp socket
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // We will print it customized
        browser: ['Onigama Assistant', 'Safari', '3.0']
    });

    // Save credentials whenever they update
    sock.ev.on('creds.update', saveCreds);

    // 3. QR Code generation and handling
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            await logToPanel('warn', '🔑 کیوآرکد جدید در ترمینال سیستم محلی شما تولید شد. لطفاً آن را با گوشی اسکن کنید.');
            console.log('\n================================================================');
            console.log('👉 اسکن کیوآرکد برای اتصال دستیار هوشمند به واتس‌اپ اونیگاما اف‌ایکس');
            console.log('================================================================\n');
            qrcode.generate(qr, { small: true });
            console.log('\n================================================================');
            console.log('یک پیام به شماره خود بفرستید تا مطمئن شوید که چت ها کار می‌کنند.');
            console.log('================================================================\n');
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            const errMsg = lastDisconnect?.error?.message || 'قطع اتصال سوکت';
            await logToPanel('error', `❌ اتصال قطع شد. علت: ${errMsg}`);
            
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }

            if (shouldReconnect) {
                await logToPanel('warn', '🔄 در حال تلاش خودکار برای بازنشانی و اتصال مجدد...');
                connectToWhatsApp();
            } else {
                await logToPanel('error', '🛑 شما از اکانت خارج شدید (Logged Out). لطفاً پوشه "whatsapp_session" را حذف کرده و مجدد اسکریپت را اجرا کنید.');
            }
        } else if (connection === 'open') {
            await logToPanel('info', '✨🎉 اتصال با موفقیت برقرار شد! ربات پشتیبانی واتس‌اپ شما کاملاً آنلاین و فعال است.');
            
            if (pollInterval) {
                clearInterval(pollInterval);
            }
            // Start polling for outbound messages every 2.5 seconds
            pollInterval = setInterval(pollOutboundMessages, 2500);
        }
    });

    // 4. Receving real messages and syncing to panel + triggering Gemini
    sock.ev.on('messages.upsert', async (m) => {
        try {
            if (!m.messages || m.messages.length === 0) return;
            const msg = m.messages[0];
            const senderJid = msg.key?.remoteJid;
            if (!senderJid) return;

            // Support both standard s.whatsapp.net and modern lid JID identifiers
            const isValidJid = senderJid.endsWith('@s.whatsapp.net') || senderJid.endsWith('@lid');
            if (!isValidJid) return;

            const customerPhone = senderJid.split('@')[0];
            const myPhone = sock.user?.id ? sock.user.id.split(':')[0].split('@')[0] : '';

            // Skip messages sent by ourselves to other people, but allow messages sent to our own number (self-chat testing)
            if (msg.key.fromMe && customerPhone !== myPhone) {
                return;
            }
            
            // Extract message text dynamically and robustly
            let textMessage = extractTextOfMessage(msg.message);
            textMessage = textMessage.trim();

            if (textMessage) {
                const customerName = msg.pushName || `مشتری (${customerPhone})`;
                await logToPanel('info', `💬 دریافت پیام از [${customerName} - ${customerPhone}]: "${textMessage}"`);

                console.log(`[SYS] Sending webhook payload to ${PANEL_URL}/api/chats ...`);
                
                // Call the panel to register the message and get a synchronous AI reply in a single request!
                const response = await axios.post(`${PANEL_URL}/api/chats`, {
                    customerName: customerName,
                    customerPhone: customerPhone,
                    whatsappJid: senderJid,
                    firstMessage: textMessage,
                    sync: true
                });

                console.log(`[SYS] Panel response received:`, response.data);

                // If the panel generated an AI response, we send it back to the customer on WhatsApp!
                if (response.data && response.data.aiReply) {
                    const reply = response.data.aiReply;
                    await logToPanel('info', `🔮 پاسخ هوشمند هوش مصنوعی تولید شد: "${reply.substring(0, 50)}..."`);
                    
                    // Simulate a natural human delay before replying (e.g., 2.5 seconds)
                    console.log(`[SYS] Simulating typing delay (2.5s) before sending to ${senderJid}...`);
                    setTimeout(async () => {
                        try {
                            await sock.sendMessage(senderJid, { text: reply });
                            await logToPanel('info', `📤 پاسخ هوشمند با موفقیت به ${customerPhone} ارسال شد.`);
                        } catch (sendErr) {
                            await logToPanel('error', `❌ خطا در ارسال پاسخ به واتس‌اپ: ${sendErr.message}`);
                        }
                    }, 2500);
                } else {
                    const chatObj = response.data;
                    const statusStr = chatObj ? chatObj.status : 'نامشخص';
                    await logToPanel('info', `ℹ️ پیام در پنل ثبت شد. پاسخ خودکاری از سرور دریافت نشد (پاسخ خودکار غیرفعال است یا وضعیت گفتگو روی "${statusStr}" است).`);
                }
            }
        } catch (eventErr) {
            await logToPanel('error', `⚠️ خطا در پردازش رویداد پیام ورودی: ${eventErr.message}`);
        }
    });
}

// Start the bridge
connectToWhatsApp().catch(async (err) => {
    await logToPanel('error', `CRITICAL BRIDGE ERROR: ${err.message}`);
});
