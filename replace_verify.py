#!/usr/bin/env python3
# اسکریپت جایگزینی امن تابع handleVerifyLicense
# تابع قدیمی (با کلیدهای هاردکد) را با نسخه‌ای که به سرور وصل می‌شود عوض می‌کند.
# اجرا: python3 replace_verify.py

import sys

FILE = '/var/www/app.onigama/src/pages/SettingsPage.tsx'
NEW_FUNC_FILE = '/var/www/app.onigama/new_verify_license.txt'

with open(FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# پیدا کردن شروع تابع handleVerifyLicense
start = None
for i, l in enumerate(lines):
    if 'const handleVerifyLicense' in l:
        start = i
        break

if start is None:
    print("خطا: تابع handleVerifyLicense پیدا نشد!")
    sys.exit(1)

# پیدا کردن تابع بعدی (handleInstantUpgrade) = نقطه پایان
end = None
for i in range(start + 1, len(lines)):
    if 'const handleInstantUpgrade' in lines[i]:
        end = i
        break

if end is None:
    print("خطا: تابع handleInstantUpgrade (مرز پایان) پیدا نشد!")
    sys.exit(1)

print(f"تابع قدیمی: خط {start+1} تا {end} (شماره‌های انسانی)")
print(f"تعداد خطوطی که جایگزین می‌شوند: {end - start}")

# خواندن تابع جدید
with open(NEW_FUNC_FILE, 'r', encoding='utf-8') as f:
    new_func = f.read()
if not new_func.endswith('\n'):
    new_func += '\n'

# ساخت محتوای جدید: قبل از start + تابع جدید + از end به بعد
new_lines = lines[:start] + [new_func] + lines[end:]

# پشتیبان
import shutil
shutil.copy(FILE, FILE + '.before_verify_replace')
print(f"پشتیبان: {FILE}.before_verify_replace")

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✓ تابع با موفقیت جایگزین شد")
print("حالا چک کن: grep -n 'vipKeys\\|activateLicense' " + FILE)
