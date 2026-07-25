#!/usr/bin/env python3
# خنثی‌سازی تابع handleInstantUpgrade (که رایگان VIP می‌داد)
# اجرا: python3 replace_instant.py

import sys, shutil

FILE = '/var/www/app.onigama/src/pages/SettingsPage.tsx'
NEW_FUNC_FILE = '/var/www/app.onigama/new_instant_upgrade.txt'

with open(FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# شروع تابع
start = None
for i, l in enumerate(lines):
    if 'const handleInstantUpgrade' in l:
        start = i
        break
if start is None:
    print("خطا: handleInstantUpgrade پیدا نشد!")
    sys.exit(1)

# پایان = تابع بعدی (handleDowngradeToFree)
end = None
for i in range(start + 1, len(lines)):
    if 'const handleDowngradeToFree' in lines[i]:
        end = i
        break
if end is None:
    print("خطا: handleDowngradeToFree (مرز پایان) پیدا نشد!")
    sys.exit(1)

print(f"تابع قدیمی: خط {start+1} تا {end} (انسانی)")
print(f"تعداد خطوط جایگزین‌شونده: {end - start}")

with open(NEW_FUNC_FILE, 'r', encoding='utf-8') as f:
    new_func = f.read()
if not new_func.endswith('\n'):
    new_func += '\n'

new_lines = lines[:start] + [new_func] + lines[end:]

shutil.copy(FILE, FILE + '.before_instant_replace')
print(f"پشتیبان: {FILE}.before_instant_replace")

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✓ تابع handleInstantUpgrade خنثی شد")
