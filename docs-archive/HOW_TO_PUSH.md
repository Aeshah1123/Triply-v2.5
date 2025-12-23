# 🚀 تعليمات رفع التغييرات إلى GitHub

## المشكلة:
المستودع على GitHub يحتوي على كود قديم ولا يظهر التحديثات الجديدة (الترجمة الثنائية)

## ✅ الحل:

افتح **Terminal** جديد وقم بتنفيذ الأوامر التالية:

```bash
# 1. الانتقال لمجلد المشروع
cd /Users/samalruhili/Downloads/Triply-v2.3-master

# 2. التأكد من الفرع الحالي
git branch

# 3. إضافة جميع التغييرات
git add -A

# 4. عمل commit
git commit -m "feat: Complete bilingual support (Arabic/English) with AI translations"

# 5. رفع التغييرات بالقوة
git push origin main --force
```

---

## 🔍 إذا كان الفرع الحالي هو master:

```bash
cd /Users/samalruhili/Downloads/Triply-v2.3-master

# تبديل إلى main
git checkout -b main

# إضافة التغييرات
git add -A

# عمل commit
git commit -m "feat: Complete bilingual support (Arabic/English) with AI translations"

# رفع إلى main
git push -u origin main --force

# حذف master القديم من GitHub
git push origin --delete master
```

---

## 📋 بعد الرفع:

1. تحديث الصفحة: https://github.com/Ya-az/Triply-v2.3
2. تفعيل GitHub Pages من Settings → Pages
3. اختيار Source: **GitHub Actions**

---

## ⚡ الطريقة السريعة (نسخ ولصق):

```bash
cd /Users/samalruhili/Downloads/Triply-v2.3-master && git add -A && git commit -m "feat: Complete bilingual support" && git push origin main --force
```

---

**ملاحظة:** استخدم `--force` فقط إذا كنت متأكد أنك تريد الكتابة فوق الكود القديم في GitHub.
