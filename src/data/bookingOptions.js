// دالة للحصول على الخدمات بناءً على اللغة
export const getBookingServices = (language = 'ar') => {
  const services = {
    ar: [
      { 
        id: 'flight', 
        name: 'حجز طيران', 
        icon: '✈️',
        estimatedCost: 1500
      },
      { 
        id: 'hotel', 
        name: 'حجز فنادق', 
        icon: '🏨',
        estimatedCost: 2000
      },
      { 
        id: 'restaurant', 
        name: 'حجز مطاعم', 
        icon: '🍽️',
        estimatedCost: 500
      },
      { 
        id: 'activities', 
        name: 'أنشطة وجولات', 
        icon: '🎯',
        estimatedCost: 1000
      }
    ],
    en: [
      { 
        id: 'flight', 
        name: 'Flight Booking', 
        icon: '✈️',
        estimatedCost: 1500
      },
      { 
        id: 'hotel', 
        name: 'Hotel Booking', 
        icon: '🏨',
        estimatedCost: 2000
      },
      { 
        id: 'restaurant', 
        name: 'Restaurant Booking', 
        icon: '🍽️',
        estimatedCost: 500
      },
      { 
        id: 'activities', 
        name: 'Activities & Tours', 
        icon: '🎯',
        estimatedCost: 1000
      }
    ]
  };
  return services[language] || services.ar;
};

// Backward compatibility
export const bookingServices = getBookingServices('ar');

// دالة للحصول على مستويات الميزانية بناءً على اللغة
export const getBudgetLevels = (language = 'ar') => {
  const levels = {
    ar: [
      { id: 'budget', name: 'اقتصادي', description: 'خيارات موفرة ومريحة', color: 'triply-teal' },
      { id: 'midRange', name: 'متوسط', description: 'توازن بين السعر والجودة', color: 'triply' },
      { id: 'luxury', name: 'فاخر', description: 'تجربة راقية ومميزة', color: 'triply-accent' }
    ],
    en: [
      { id: 'budget', name: 'Budget', description: 'Affordable and comfortable options', color: 'triply-teal' },
      { id: 'midRange', name: 'Mid-Range', description: 'Balance between price and quality', color: 'triply' },
      { id: 'luxury', name: 'Luxury', description: 'Premium and distinguished experience', color: 'triply-accent' }
    ]
  };
  return levels[language] || levels.ar;
};

// Backward compatibility
export const budgetLevels = getBudgetLevels('ar');

// دالة للحصول على الوجهات بناءً على اللغة
export const getBookingDestinations = (language = 'ar') => {
  const destinations = {
    ar: [
      'لندن - المملكة المتحدة',
      'باريس - فرنسا',
      'القاهرة - مصر',
      'إسطنبول - تركيا',
      'دبي - الإمارات العربية المتحدة'
    ],
    en: [
      'London - United Kingdom',
      'Paris - France',
      'Cairo - Egypt',
      'Istanbul - Turkey',
      'Dubai - United Arab Emirates'
    ]
  };
  return destinations[language] || destinations.ar;
};

// Backward compatibility
export const bookingDestinations = getBookingDestinations('ar');

// تحويل أسماء الوجهات (عربي/إنجليزي) إلى مفاتيح
export const destinationMapping = {
  // Arabic names
  'لندن - المملكة المتحدة': 'london',
  'باريس - فرنسا': 'paris',
  'القاهرة - مصر': 'egypt',
  'إسطنبول - تركيا': 'turkey',
  'دبي - الإمارات العربية المتحدة': 'dubai',
  // English names
  'London - United Kingdom': 'london',
  'Paris - France': 'paris',
  'Cairo - Egypt': 'egypt',
  'Istanbul - Turkey': 'turkey',
  'Dubai - United Arab Emirates': 'dubai'
};
