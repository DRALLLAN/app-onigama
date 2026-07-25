#!/usr/bin/env python3
# اضافه کردن useEffect چک خودکار لایسنس، قبل از اولین useEffect موجود
# اجرا: python3 add_license_check.py

import sys, shutil

FILE = '/var/www/app.onigama/src/pages/SettingsPage.tsx'
SNIPPET_FILE = '/var/www/app.onigama/license_check_effect.txt'

with open(FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# پیدا کردن اولین useEffect که برای PWA است (با کامنت display-mode)
target = None
for i, l in enumerate(lines):
    if 'useEffect(() => {' in l:
        # چک کن خط بعدی کامنت display-mode باشد (تا useEffect درست را بگیریم)
        if i + 1 < len(lines) and 'display-mode' in lines[i + 1]:
            target = i
            break

if target is None:
    print("خطا: useEffect هدف (PWA) پیدا نشد!")
    sys.exit(1)

print(f"useEffect هدف در خط {target+1} است")
print(f"کد جدید قبل از آن اضافه می‌شود")

with open(SNIPPET_FILE, 'r', encoding='utf-8') as f:
    snippet = f.read()
if not snippet.endswith('\n'):
    snippet += '\n'

# درج قبل از target
new_lines = lines[:target] + [snippet] + lines[target:]

shutil.copy(FILE, FILE + '.before_license_check')
print(f"پشتیبان: {FILE}.before_license_check")

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✓ useEffect چک خودکار لایسنس اضافه شد")
