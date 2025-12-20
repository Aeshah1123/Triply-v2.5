# 🚀 دليل المطور السريع - نظام i18n في Triply

## 📋 جدول المحتويات
1. [البداية السريعة](#البداية-السريعة)
2. [إضافة ترجمات جديدة](#إضافة-ترجمات-جديدة)
3. [الوظائف المساعدة](#الوظائف-المساعدة)
4. [أمثلة عملية](#أمثلة-عملية)
5. [الأخطاء الشائعة](#الأخطاء-الشائعة)

---

## 🎯 البداية السريعة

### 1. استيراد الـ Hook:
```javascript
import { useLanguage } from '../contexts/LanguageContext.jsx';
```

### 2. استخدامه في المكون:
```javascript
function MyComponent() {
  const { t, language, toggleLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t("section.title")}</h1>
      <button onClick={toggleLanguage}>تبديل اللغة</button>
    </div>
  );
}
```

---

## ➕ إضافة ترجمات جديدة

### الخطوة 1: أضف في ar.js
```javascript
// src/i18n/ar.js
export const ar = {
  mySection: {
    title: "عنوان القسم",
    description: "وصف القسم",
    button: "زر الإجراء"
  }
};
```

### الخطوة 2: أضف في en.js
```javascript
// src/i18n/en.js
export const en = {
  mySection: {
    title: "Section Title",
    description: "Section Description",
    button: "Action Button"
  }
};
```

### الخطوة 3: استخدمها
```javascript
<h1>{t("mySection.title")}</h1>
<p>{t("mySection.description")}</p>
<button>{t("mySection.button")}</button>
```

---

## 🛠️ الوظائف المساعدة

### 1. formatCurrency - تنسيق العملات
```javascript
import { formatCurrency } from '../utils/translationHelpers.js';

// استخدام بسيط
formatCurrency(450, language)
// عربي: "450 ريال"
// English: "450 SAR"

// مع وحدة القياس
formatCurrency(hotel.price, language, 'perNight')
// عربي: "450 ريال/ليلة"
// English: "450 SAR/night"

// الوحدات المدعومة:
// 'perNight', 'perDay', 'perPerson', 'total'
```

### 2. translateDuration - ترجمة المدة
```javascript
import { translateDuration } from '../utils/translationHelpers.js';

translateDuration("ساعتان", language)
// عربي: "ساعتان"
// English: "2 hours"

translateDuration("3 أيام", language)
// عربي: "3 أيام"
// English: "3 days"
```

### 3. translateActivityDescription - ترجمة الأنشطة
```javascript
import { translateActivityDescription } from '../utils/translationHelpers.js';

translateActivityDescription("جولة سيرًا على الأقدام في المدينة القديمة", language)
// عربي: "جولة سيرًا على الأقدام في المدينة القديمة"
// English: "Walking tour in the old city"
```

### 4. Interpolation - إدراج المتغيرات
```javascript
// في ar.js:
budgetRemaining: "المتبقي من الميزانية: {{amount}} ريال"

// في en.js:
budgetRemaining: "Remaining budget: {{amount}} SAR"

// الاستخدام:
t("bookingDetails.budgetRemaining", { amount: 2000 })
// عربي: "المتبقي من الميزانية: 2000 ريال"
// English: "Remaining budget: 2000 SAR"
```

---

## 💡 أمثلة عملية

### مثال 1: نص بسيط
```javascript
<h1 className="text-2xl">{t("payment.title")}</h1>
```

### مثال 2: نص مع متغير
```javascript
<p>{t("booking.confirmation", { number: confirmationNumber })}</p>

// ar.js:
confirmation: "رقم التأكيد: {{number}}"

// en.js:
confirmation: "Confirmation Number: {{number}}"
```

### مثال 3: شرط مع ترجمة
```javascript
{days === 1 ? t("invoice.day") : t("invoice.days")}
```

### مثال 4: قائمة مترجمة
```javascript
const steps = [
  { id: 1, name: t("progress.destination"), desc: t("progress.destinationDesc") },
  { id: 2, name: t("progress.services"), desc: t("progress.servicesDesc") },
  { id: 3, name: t("progress.confirmation"), desc: t("progress.confirmationDesc") }
];
```

### مثال 5: نموذج كامل
```javascript
function BookingForm() {
  const { t, language } = useLanguage();
  
  return (
    <form>
      <label>{t("form.destination")}</label>
      <select>
        <option value="">{t("form.selectDestination")}</option>
        <option value="london">{t("destinations.london")}</option>
        <option value="paris">{t("destinations.paris")}</option>
      </select>
      
      <label>{t("form.budget")}</label>
      <input 
        type="number" 
        placeholder={t("form.budgetPlaceholder")}
      />
      
      <button>{t("form.submit")}</button>
    </form>
  );
}
```

---

## ⚠️ الأخطاء الشائعة

### ❌ خطأ 1: نسيان استيراد useLanguage
```javascript
// خطأ
function MyComponent() {
  return <h1>{t("title")}</h1>;  // ❌ t is not defined
}

// صحيح
import { useLanguage } from '../contexts/LanguageContext.jsx';

function MyComponent() {
  const { t } = useLanguage();
  return <h1>{t("title")}</h1>;  // ✅
}
```

### ❌ خطأ 2: مفتاح غير موجود
```javascript
// إذا كان المفتاح غير موجود، سيُرجع النظام المفتاح نفسه
t("nonexistent.key")  // يُرجع: "nonexistent.key"

// تأكد من إضافة المفتاح في ar.js و en.js أولاً
```

### ❌ خطأ 3: نسيان الـ interpolation params
```javascript
// ar.js:
message: "مرحباً {{name}}"

// خطأ:
t("message")  // "مرحباً {{name}}"

// صحيح:
t("message", { name: "أحمد" })  // "مرحباً أحمد"
```

### ❌ خطأ 4: استخدام نص ثابت بدلاً من الترجمة
```javascript
// خطأ:
<button>احجز الآن</button>  // ❌ نص ثابت

// صحيح:
<button>{t("booking.bookNow")}</button>  // ✅ ترجمة ديناميكية
```

---

## 📚 مرجع المفاتيح الشائعة

### Common (نصوص مشتركة)
```javascript
t("common.back")          // رجوع / Back
t("common.next")          // التالي / Next
t("common.confirm")       // تأكيد / Confirm
t("common.cancel")        // إلغاء / Cancel
t("common.save")          // حفظ / Save
t("common.edit")          // تعديل / Edit
t("common.delete")        // حذف / Delete
```

### Booking (الحجز)
```javascript
t("bookingDetails.destination")     // الوجهة / Destination
t("bookingDetails.category")        // الفئة / Category
t("bookingDetails.numberOfDays")    // عدد الأيام / Number of Days
t("bookingDetails.totalCost")       // التكلفة الإجمالية / Total Cost
```

### Payment (الدفع)
```javascript
t("payment.title")           // إتمام عملية الدفع / Complete Payment
t("payment.creditCard")      // بطاقة ائتمان / Credit Card
t("payment.payNow")          // ادفع الآن / Pay Now
```

### Invoice (الفاتورة)
```javascript
t("invoice.bookingInvoice")  // فاتورة الحجز / Booking Invoice
t("invoice.invoiceNumber")   // رقم الفاتورة / Invoice Number
t("invoice.total")           // الإجمالي / Total
```

---

## 🎨 نصائح للتصميم

### 1. استخدم dir المناسب
```javascript
<div dir={language === 'ar' ? 'rtl' : 'ltr'}>
  {/* المحتوى */}
</div>
```

### 2. الخطوط
```css
/* للعربية */
font-family: 'Cairo', 'Tajawal', sans-serif;

/* للإنجليزية */
font-family: 'Inter', 'Roboto', sans-serif;
```

### 3. التباعد
```javascript
// استخدم margin/padding بناءً على اللغة
className={language === 'ar' ? 'mr-2' : 'ml-2'}
```

---

## 🔍 اختبار الترجمة

### 1. اختبر كلا اللغتين:
- انقر على زر تبديل اللغة
- تأكد من ظهور جميع النصوص بشكل صحيح
- تحقق من اتجاه النص (RTL/LTR)

### 2. اختبر الـ Interpolation:
```javascript
console.log(t("message", { name: "Test" }));
```

### 3. اختبر العملات:
```javascript
console.log(formatCurrency(100, 'ar'));
console.log(formatCurrency(100, 'en'));
```

---

## 📝 Checklist للمطورين

قبل إضافة ميزة جديدة:
- [ ] هل جميع النصوص المرئية تستخدم `t()`؟
- [ ] هل أضفت المفاتيح في `ar.js` و `en.js`؟
- [ ] هل اختبرت التبديل بين اللغتين؟
- [ ] هل العملات تظهر بشكل صحيح؟
- [ ] هل اتجاه النص صحيح (RTL/LTR)؟

---

## 🆘 الدعم

عند مواجهة مشكلة:
1. تحقق من Console للأخطاء
2. تأكد من وجود المفتاح في ملفات الترجمة
3. راجع `LanguageContext.jsx` للتأكد من صحة الـ hook
4. راجع `I18N_COMPLETION_REPORT.md` للتفاصيل الكاملة

---

**💡 تذكر:** كل نص يراه المستخدم يجب أن يكون مترجماً!

**🎯 الهدف:** تجربة مستخدم سلسة بغض النظر عن اللغة المختارة.
