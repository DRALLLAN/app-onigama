# راهنمای دپلووی و راه‌اندازی زنده پلتفرم روی سرور هتزنر (Hetzner VPS)
### دامنه هدف: `ass.onigama.com`

این سند به شما کمک می‌کند تا این پنل پشتیبانی هوشمند (شبیه‌ساز + موتور هوش مصنوعی جمینای) را روی سرور اوبونتو (Hetzner) خود مستقر کرده و در صورت تمایل آن را با کتابخانه‌های واتس‌اپ نظیر **Baileys** یا **WPPConnect** به حساب واقعی واتس‌اپ متصل کنید.

---

## بخش ۱: پیش‌نیازهای سرور (Hetzner VPS)

یک سرور با سیستم‌عامل **Ubuntu 22.04 LTS** یا جدیدتر تهیه کنید و مراحل زیر را با دسترسی `root` یا کاربر دارای امتیازات `sudo` اجرا کنید.

### ۱. به‌روزرسانی پکیج‌های سیستم
```bash
sudo apt update && sudo apt upgrade -y
```

### ۲. نصب Node.js (نسخه ۲۰ یا بالاتر)
بهترین راه از طریق NodeSource است:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```
برای بررسی صحت نصب:
```bash
node -v
npm -v
```

### ۳. نصب PM2 (برای زنده نگه داشتن برنامه در پس‌زمینه)
```bash
sudo npm install pm2 -g
```

### ۴. نصب Nginx و ابزار Certbot (برای SSL رایگان)
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

---

## بخش ۲: کپی کردن پروژه و تنظیمات محیطی

پروژه را روی سرور خود آپلود یا کلون کنید. (مثلاً در مسیر `/var/www/onigama-assistant`):

```bash
mkdir -p /var/www/onigama-assistant
cd /var/www/onigama-assistant
```

### ۱. نصب وابستگی‌های پروژه
وارد پوشه پروژه شده و دستور زیر را اجرا کنید:
```bash
npm install
```

### ۲. تنظیم متغیرهای محیطی
یک فایل به نام `.env` در ریشه‌ی پروژه بسازید:
```bash
nano .env
```
محتوای زیر را قرار دهید و جایگذاری کنید:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(برای ذخیره در Nano دکمه `Ctrl+O` و سپس `Enter` و برای خروج `Ctrl+X` را بزنید)*

---

## بخش ۳: بیلد گرفتن (Build) و اجرای برنامه با PM2

برای کامپایل کدهای فرانت‌اند (Vite) و بک‌اند (Express به صورت باندل کلاینت) دستور زیرا را بزنید:

```bash
npm run build
```
این دستور پوشه `dist` را حاوی کدهای پروداکشن وب‌سایت و فایل `dist/server.cjs` برای بک‌اند تولید می‌کند.

### اجرا با PM2:
برای اینکه برنامه به صورت مداوم بالا بماند و با کرش کردن سرور به طور خودکار دوباره ری‌استارت شود:
```bash
pm2 start dist/server.cjs --name "onigama-assistant"
pm2 save
pm2 startup
```

---

## بخش ۴: پیکربندی Nginx برای دامنه `ass.onigama.com`

حالا باید وب‌سرور Nginx را طوری تنظیم کنیم که ترافیک ورودی به `ass.onigama.com` را روی پورت `3000` که برنامه‌مان در حال اجراست بفرستد.

### ۱. تنظیم رکورد DNS
ابتدا به ادمین پنل دامنه خود (کلودفلر یا ارائه‌دهنده دی‌ان‌اس) رفته و یک **A Record** برای ساب‌دامین `ass` بسازید که به آی‌پی سرور هتزنر (مثلا `12.34.56.78`) اشاره کند.

### ۲. ساخت کانفیگ دامنه در Nginx
```bash
sudo nano /etc/nginx/sites-available/ass.onigama.com
```

محتوای زیر را در آن قرار دهید:
```nginx
server {
    listen 80;
    server_name ass.onigama.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### ۳. فعال‌سازی پیکربندی و تست Nginx
```bash
sudo ln -s /etc/nginx/sites-available/ass.onigama.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### ۴. دریافت گواهی امنیتی SSL (HTTPS) رایگان
با استفاده از Let's Encrypt دامنه خود را امن کنید:
```bash
sudo certbot --nginx -d ass.onigama.com
```
*گزینه‌ها را دنبال کنید (ایمیل خود را وارد کرده و قوانین را تایید کنید). Certbot به طور خودکار کانفیگ Nginx را تبدیل به HTTPS (پورت ۴۴۳) خواهد کرد.*

حالا با باز کردن آدرس `https://ass.onigama.com` به پنل اونیگاما اف ایکس متصل خواهید شد! 🎉

---

## بخش ۵: وصل کردن واتس‌اپ واقعی به این بک‌اند (با استفاده از Baileys یا WPPConnect)

برای اینکه پیام‌های واقعی ورودی به واتس‌اپ شما به این پنل متصل شود و جمینای پاسخ دهد، شما به یک اسکریپت رانر ساده در کنار این پروژه نیاز دارید. ایده کلی به صورت زیر است:

یک اسکریپت سبک به نام `whatsapp-bridge.js` با یکی از کتابخانه‌ها (مثلاً `@whiskeysockets/baileys`) بسازید:

### نمونه کد ایده اتصال با Baileys:

```javascript
import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import axios from 'axios';

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true // کیوآرکد را در ترمینال سرور چاپ می‌کند تا اسکن کنید
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === 'notify') {
            const senderNumber = msg.key.remoteJid; // شماره مشتری
            const textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

            if (textMessage) {
                console.log(`پیام جدید از ${senderNumber}: ${textMessage}`);

                try {
                    // ۱. فرستادن پیام مشتری به بک‌اند پنل خودمان روی سرور
                    const response = await axios.post('http://127.0.0.1:3000/api/chats', {
                        customerName: msg.pushName || senderNumber.split('@')[0],
                        customerPhone: senderNumber.split('@')[0],
                        firstMessage: textMessage
                    });

                    // ۲. ارسال پیام جدید به صف گفتگوها تا جمینای پاسخ دهد
                    const chatResponse = await axios.post(`http://127.0.0.1:3000/api/chats/${response.data.id}/messages`, {
                        text: textMessage,
                        role: 'customer'
                    });

                    // ۳. گرفتن پاسخ تولید شده توسط هوش مصنوعی و ارسال آن به مشتری واتس‌اپ
                    // برای واقعی‌تر شدن، می‌توانید با چند ثانیه تاخیر ارسال کنید
                    setTimeout(async () => {
                        // دریافت آخرین وضعیت گفتگو و استخراج پیام پاسخ هوش مصنوعی (نقش 'ai')
                        const updatedChat = await axios.get('http://127.0.0.1:3000/api/chats');
                        const targetChat = updatedChat.data.find(c => c.customerPhone === senderNumber.split('@')[0]);
                        const lastMsg = targetChat.messages[targetChat.messages.length - 1];

                        if (lastMsg && lastMsg.role === 'ai') {
                            await sock.sendMessage(senderNumber, { text: lastMsg.text });
                            console.log(`پاسخ جمینای ارسال شد به ${senderNumber}`);
                        }
                    }, 5000);

                } catch (err) {
                    console.error('خطا در همگام‌سازی پیام با پنل پشتیبانی:', err.message);
                }
            }
        }
    });
}

connectToWhatsApp();
```

### مزایای این روش:
1. **عدم اختلال با ربات تلگرام**: از آنجایی که دامنه `ass.onigama.com` کاملا مستقل است و پورت اختصاصی دارد، هیچ تداخلی با ربات تلگرام شما روی `bot.onigama.com` رخ نخواهد داد.
2. **بررسی زنده ترافیک آنلاین**: شما می‌توانید با لپ‌تاپ یا گوشی وارد پنل `ass.onigama.com` شده، لیست چت‌های واتس‌اپ را زنده ببینید، نحوه پاسخگویی جمینای را زیر نظر بگیرید، وضعیت چت‌ها را به "نیاز به کارشناس" تغییر دهید و در صورت تمایل چت زنده را خودتان به دست بگیرید!
