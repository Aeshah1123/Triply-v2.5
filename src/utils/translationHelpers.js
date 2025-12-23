/**
 * دوال مساعدة للترجمة
 * تحتوي على ترجمات للوجهات، الفئات، وعناصر مشتركة أخرى
 */

// ترجمة أسماء الوجهات
export const getDestinationName = (destinationKey, language = 'ar') => {
  const destinations = {
    ar: {
      'london': 'لندن 🇬🇧',
      'paris': 'باريس 🇫🇷',
      'turkey': 'إسطنبول 🇹🇷',
      'dubai': 'دبي 🇦🇪',
      'egypt': 'القاهرة 🇪🇬',
      'istanbul': 'إسطنبول 🇹🇷',
      'cairo': 'القاهرة 🇪🇬'
    },
    en: {
      'london': 'London 🇬🇧',
      'paris': 'Paris 🇫🇷',
      'turkey': 'Istanbul 🇹🇷',
      'dubai': 'Dubai 🇦🇪',
      'egypt': 'Cairo 🇪🇬',
      'istanbul': 'Istanbul 🇹🇷',
      'cairo': 'Cairo 🇪🇬'
    }
  };

  return destinations[language]?.[destinationKey?.toLowerCase()] || destinationKey;
};

// ترجمة أسماء الفئات
export const getCategoryName = (categoryKey, language = 'ar') => {
  const categories = {
    ar: {
      'budget': 'اقتصادي 💰',
      'midRange': 'متوسط ⭐',
      'luxury': 'فاخر 💎'
    },
    en: {
      'budget': 'Budget 💰',
      'midRange': 'Mid-Range ⭐',
      'luxury': 'Luxury 💎'
    }
  };

  return categories[language]?.[categoryKey] || categoryKey;
};

// تنسيق التاريخ حسب اللغة
export const formatDate = (dateString, language = 'ar', format = 'long') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // صيغة مختصرة للتواريخ
  if (format === 'short') {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    return date.toLocaleDateString(locale, options);
  }
  
  // صيغة كاملة
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return date.toLocaleDateString(locale, options);
};

// تنسيق العملة حسب اللغة
export const formatCurrency = (amount, language = 'ar', perUnit = null) => {
  // التحقق من صحة القيمة
  if (amount === null || amount === undefined || isNaN(amount)) {
    return language === 'ar' ? '0 ريال' : '0 SAR';
  }
  
  const formattedAmount = Number(amount).toLocaleString('en-US');
  
  if (language === 'ar') {
    if (perUnit === 'perNight') {
      return `${formattedAmount} ريال/ليلة`;
    } else if (perUnit === 'perDay') {
      return `${formattedAmount} ريال/يوم`;
    }
    return `${formattedAmount} ريال`;
  } else {
    if (perUnit === 'perNight') {
      return `${formattedAmount} SAR/night`;
    } else if (perUnit === 'perDay') {
      return `${formattedAmount} SAR/day`;
    }
    return `${formattedAmount} SAR`;
  }
};

// ترجمة المدة الزمنية
export const translateDuration = (durationAr, language = 'ar') => {
  if (language === 'ar') return durationAr;
  
  // Map common Arabic durations to English
  const durationMap = {
    'ساعة': 'hour',
    'ساعات': 'hours',
    'ساعتان': '2 hours',
    'دقيقة': 'minute',
    'دقائق': 'minutes',
    'يوم': 'day',
    'أيام': 'days'
  };
  
  let englishDuration = durationAr;
  Object.entries(durationMap).forEach(([ar, en]) => {
    englishDuration = englishDuration.replace(ar, en);
  });
  
  return englishDuration;
};

// ترجمة وصف النشاط
export const translateActivityDescription = (descriptionAr, language = 'ar') => {
  if (language === 'ar') return descriptionAr;
  
  // Common word translations for dynamic translation
  const wordMap = {
    'متحف': 'museum',
    'مجاني': 'free',
    'عالمي': 'world-class',
    'معرض': 'gallery',
    'فني': 'art',
    'جولة': 'tour',
    'مشي': 'walking',
    'في': 'in',
    'الحديقة': 'the park',
    'قلعة': 'castle',
    'تاريخية': 'historic',
    'تاريخي': 'historic',
    'جواهر': 'jewels',
    'التاج': 'crown',
    'عجلة': 'wheel',
    'الشهيرة': 'famous',
    'كنيسة': 'abbey',
    'استوديوهات': 'studios',
    'رحلة': 'cruise',
    'نهرية': 'river',
    'فاخرة': 'luxury',
    'عشاء': 'dinner',
    'خاصة': 'private',
    'ملكية': 'royal',
    'هليكوبتر': 'helicopter',
    'فوق': 'over',
    'قصر': 'palace',
    'حدائق': 'gardens',
    'الحدائق': 'gardens',
    'برج': 'tower',
    'الطابق': 'floor',
    'قوس': 'arc',
    'النصر': 'triumph',
    'عرض': 'show',
    'منطاد': 'balloon',
    'آيا صوفيا': 'Hagia Sophia',
    'المسجد الأزرق': 'Blue Mosque',
    'البازار الكبير': 'Grand Bazaar',
    'البوسفور': 'Bosphorus',
    'بحرية': 'cruise',
    'الحمام التركي': 'Turkish bath',
    'تجربة': 'experience',
    'الدراويش': 'Dervishes',
    'المولوية': 'Whirling',
    'يخت': 'yacht',
    'دبي مول': 'Dubai Mall',
    'نافورة دبي': 'Dubai Fountain',
    'شاطئ': 'beach',
    'المشي على': 'walk on',
    'سوق': 'souk',
    'الذهب': 'gold',
    'التوابل': 'spice',
    'برج خليفة': 'Burj Khalifa',
    'أكواريوم': 'aquarium',
    'حديقة الحيوانات': 'zoo',
    'سفاري': 'safari',
    'صحراوية': 'desert',
    'مع': 'with',
    'إطار دبي': 'Dubai Frame',
    'استئجار': 'charter',
    'طائرة مائية': 'seaplane',
    'النخلة': 'Palm',
    'المتحف المصري': 'Egyptian Museum',
    'سوق خان الخليلي': 'Khan El Khalili',
    'جامع': 'mosque',
    'الأزهر': 'Al-Azhar',
    'الشريف': '',
    'أهرامات': 'pyramids',
    'الجيزة': 'Giza',
    'أبو الهول': 'Sphinx',
    'فلوكة': 'felucca',
    'النيل': 'Nile',
    'قلعة صلاح الدين': 'Citadel of Saladin',
    'مسجد محمد علي': 'Alabaster Mosque',
    'الصوت والضوء': 'Sound & Light',
    'عند الأهرامات': 'at Pyramids',
    'على النيل': 'on the Nile',
    'شاملة': 'comprehensive',
    'سقارة': 'Sakkara',
    'ممفيس': 'Memphis',
    'معابد': 'temples',
    'الأقصر': 'Luxor',
    'رحلة يوم واحد': 'day trip',
  };
  
  let translated = descriptionAr;
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedEntries = Object.entries(wordMap).sort((a, b) => b[0].length - a[0].length);
  
  for (const [ar, en] of sortedEntries) {
    if (en) {
      const regex = new RegExp(ar, 'g');
      translated = translated.replace(regex, en);
    } else {
      // Remove empty translations
      translated = translated.replace(new RegExp(ar, 'g'), '');
    }
  }
  
  // Clean up extra spaces
  translated = translated.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  if (translated) {
    translated = translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  
  return translated;
};
