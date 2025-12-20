// أسعار تحويل العملات من الريال السعودي
// يتم تحديثها بشكل دوري

export const currencyRates = {
  // بالمفاتيح الإنجليزية
  'dubai': {
    currency: 'AED',
    symbol: 'درهم',
    rate: 0.98,
    flag: '🇦🇪'
  },
  'egypt': {
    currency: 'EGP',
    symbol: 'جنيه',
    rate: 8.25,
    flag: '🇪🇬'
  },
  'paris': {
    currency: 'EUR',
    symbol: 'يورو',
    rate: 0.24,
    flag: '🇫🇷'
  },
  'london': {
    currency: 'GBP',
    symbol: 'جنيه استرليني',
    rate: 0.21,
    flag: '🇬🇧'
  },
  'turkey': {
    currency: 'TRY',
    symbol: 'ليرة',
    rate: 7.85,
    flag: '🇹🇷'
  },
  // بالأسماء العربية الكاملة
  'دبي - الإمارات': {
    currency: 'AED',
    symbol: 'درهم',
    rate: 0.98,
    flag: '🇦🇪'
  },
  'دبي - الإمارات العربية المتحدة': {
    currency: 'AED',
    symbol: 'درهم',
    rate: 0.98,
    flag: '🇦🇪'
  },
  'القاهرة - مصر': {
    currency: 'EGP',
    symbol: 'جنيه',
    rate: 8.25,
    flag: '🇪🇬'
  },
  'باريس - فرنسا': {
    currency: 'EUR',
    symbol: 'يورو',
    rate: 0.24,
    flag: '🇫🇷'
  },
  'لندن - المملكة المتحدة': {
    currency: 'GBP',
    symbol: 'جنيه استرليني',
    rate: 0.21,
    flag: '🇬🇧'
  },
  'لندن - بريطانيا': {
    currency: 'GBP',
    symbol: 'جنيه استرليني',
    rate: 0.21,
    flag: '🇬🇧'
  },
  'إسطنبول - تركيا': {
    currency: 'TRY',
    symbol: 'ليرة',
    rate: 7.85,
    flag: '🇹🇷'
  },
  'default': {
    currency: 'SAR',
    symbol: 'ريال',
    rate: 1,
    flag: '🇸🇦'
  }
};

// دالة للحصول على معلومات العملة بناءً على الوجهة
export const getCurrencyInfo = (destination) => {
  // إذا كان destination عبارة عن object، استخرج الاسم
  let destinationName = typeof destination === 'string' 
    ? destination 
    : destination?.name || destination?.destination || '';
  
  console.log('🌍 Currency Info - Destination:', destination);
  console.log('📍 Destination Name:', destinationName);
  
  // تنظيف النص وإزالة الأيقونات
  destinationName = destinationName.replace(/[🇦🇪🇪🇬🇫🇷🇬🇧🇹🇷]/g, '').trim();
  
  // محاولة البحث بطرق مختلفة
  let currencyInfo = currencyRates[destinationName];
  
  // إذا لم يجد، ابحث في النص عن كلمات مفتاحية
  if (!currencyInfo) {
    if (destinationName.includes('دبي') || destinationName.includes('الإمارات') || destinationName.toLowerCase().includes('dubai')) {
      currencyInfo = currencyRates['dubai'];
    } else if (destinationName.includes('القاهرة') || destinationName.includes('مصر') || destinationName.toLowerCase().includes('egypt') || destinationName.toLowerCase().includes('cairo')) {
      currencyInfo = currencyRates['egypt'];
    } else if (destinationName.includes('باريس') || destinationName.includes('فرنسا') || destinationName.toLowerCase().includes('paris')) {
      currencyInfo = currencyRates['paris'];
    } else if (destinationName.includes('لندن') || destinationName.includes('بريطانيا') || destinationName.toLowerCase().includes('london')) {
      currencyInfo = currencyRates['london'];
    } else if (destinationName.includes('إسطنبول') || destinationName.includes('تركيا') || destinationName.toLowerCase().includes('turkey') || destinationName.toLowerCase().includes('istanbul')) {
      currencyInfo = currencyRates['turkey'];
    }
  }
  
  console.log('💱 Found Currency:', currencyInfo);
  
  // ابحث عن العملة المناسبة
  return currencyInfo || currencyRates['default'];
};

// دالة لتحويل المبلغ من الريال إلى العملة المحلية
export const convertCurrency = (amountInSAR, destination) => {
  const currencyInfo = getCurrencyInfo(destination);
  const convertedAmount = amountInSAR * currencyInfo.rate;
  
  return {
    amount: convertedAmount,
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    flag: currencyInfo.flag,
    formatted: `${convertedAmount.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })} ${currencyInfo.symbol}`
  };
};

// دالة لعرض كلا السعرين (ريال + عملة محلية) مع دعم اللغات
export const formatDualCurrency = (amountInSAR, destination, language = 'ar') => {
  // إذا لم يكن هناك destination، نرجع فقط المبلغ بالريال
  if (!destination) {
    const sarLabel = language === 'ar' ? 'ر.س' : 'SAR';
    return `${amountInSAR.toLocaleString('en-US')} ${sarLabel}`;
  }
  
  const currencyInfo = getCurrencyInfo(destination);
  
  // إذا كانت العملة هي الريال، أعرض الريال فقط
  if (currencyInfo.currency === 'SAR') {
    const sarLabel = language === 'ar' ? 'ر.س' : 'SAR';
    return `${amountInSAR.toLocaleString('en-US')} ${sarLabel}`;
  }
  
  const converted = convertCurrency(amountInSAR, destination);
  const sarLabel = language === 'ar' ? 'ر.س' : 'SAR';
  
  // إرجاع نص واحد يجمع العملتين
  return `${amountInSAR.toLocaleString('en-US')} ${sarLabel}`;
};
