/**
 * صفحة BookingConfirmationPage - صفحة تأكيد الحجز
 * تعرض:
 * - مراجعة شاملة لتفاصيل الحجز
 * - التكلفة ازمفصلة
 * - زر الانتقال للدفع
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { GlassButton } from '../components/ui/GlassButton.jsx';
import { formatCurrency, getDestinationName, getCategoryName } from '../utils/translationHelpers.js';

function BookingConfirmationPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  useEffect(() => {
    // جلب بيانات الحجز من state أو localStorage
    const data = location.state?.bookingData || JSON.parse(localStorage.getItem('triply-booking-confirmation') || '{}');
    
    if (!data || !data.destination) {
      // إذا لم توجد بيانات، العودة للصفحة السابقة
      navigate('/booking-details');
      return;
    }

    setBookingData(data);
    
    // إنشاء رقم تأكيد عشوائي
    const confirmNum = `TRP-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setConfirmationNumber(confirmNum);
  }, [location, navigate]);

  if (!bookingData) {
    return null;
  }

  const { destination, category, arrivalDate, departureDate, days, selectedFlight, selectedHotel, selectedRestaurants, selectedActivities, totalCost, numberOfGuests, pricePerPerson } = bookingData;

  // دالة الطباعة
  const handlePrint = () => {
    window.print();
  };

  // دالة المشاركة عبر واتساب
  const handleWhatsAppShare = () => {
    const message = `
🎉 *${language === 'ar' ? 'تأكيد حجز رحلة Triply' : 'Triply Booking Confirmation'}*
${language === 'ar' ? 'رقم التأكيد' : 'Confirmation Number'}: ${confirmationNumber}

📍 ${language === 'ar' ? 'الوجهة' : 'Destination'}: ${getDestinationName(destination, language)}
🏷️ ${language === 'ar' ? 'الفئة' : 'Category'}: ${getCategoryName(category, language)}
📅 ${language === 'ar' ? 'تاريخ الوصول' : 'Arrival Date'}: ${arrivalDate}
📅 ${language === 'ar' ? 'تاريخ المغادرة' : 'Departure Date'}: ${departureDate}
⏱️ ${language === 'ar' ? 'عدد الأيام' : 'Days'}: ${days}
${numberOfGuests ? `👥 ${language === 'ar' ? 'عدد الأشخاص' : 'Number of Guests'}: ${numberOfGuests} ${numberOfGuests === 1 ? (language === 'ar' ? 'شخص' : 'person') : (language === 'ar' ? 'أشخاص' : 'persons')}\n` : ''}
✈️ ${language === 'ar' ? 'الطيران' : 'Flight'}: ${selectedFlight?.airline || (language === 'ar' ? 'غير محدد' : 'Not specified')} - ${formatCurrency(selectedFlight?.price || 0, language)}
🏨 ${language === 'ar' ? 'الفندق' : 'Hotel'}: ${selectedHotel?.name || (language === 'ar' ? 'غير محدد' : 'Not specified')} - ${formatCurrency(selectedHotel?.price || 0, language, 'perNight')}
🍽️ ${language === 'ar' ? 'المطاعم' : 'Restaurants'}: ${selectedRestaurants?.length || 0} ${language === 'ar' ? 'مطعم' : 'restaurant(s)'}
🎡 ${language === 'ar' ? 'الأنشطة' : 'Activities'}: ${selectedActivities?.length || 0} ${language === 'ar' ? 'نشاط' : 'activity(ies)'}

${numberOfGuests > 1 && pricePerPerson ? `💵 ${language === 'ar' ? 'السعر للشخص الواحد' : 'Price per Person'}: ${formatCurrency(pricePerPerson, language)}\n` : ''}💰 *${language === 'ar' ? 'الإجمالي' : 'Total'}: ${formatCurrency(totalCost || 0, language)}*

---
✅ ${language === 'ar' ? 'تم التأكيد عبر منصة Triply' : 'Confirmed via Triply platform'}
    `.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // دالة المشاركة عبر Web Share API
  const handleShare = async () => {
    const shareText = `
🎉 ${language === 'ar' ? 'تأكيد حجز Triply' : 'Triply Booking Confirmation'}
${language === 'ar' ? 'رقم التأكيد' : 'Confirmation Number'}: ${confirmationNumber}

📍 ${getDestinationName(destination, language)} | ${getCategoryName(category, language)}
📅 ${language === 'ar' ? 'من' : 'From'} ${arrivalDate} ${language === 'ar' ? 'إلى' : 'to'} ${departureDate} (${days} ${language === 'ar' ? 'أيام' : 'days'})
💰 ${language === 'ar' ? 'الإجمالي' : 'Total'}: ${formatCurrency(totalCost || 0, language)}

✅ ${language === 'ar' ? 'تم التأكيد عبر Triply' : 'Confirmed via Triply'}
    `.trim();

    const shareData = {
      title: language === 'ar' ? 'تأكيد حجز Triply' : 'Triply Booking Confirmation',
      text: shareText
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // نسخ النص للحافظة
        await navigator.clipboard.writeText(shareText);
        // إظهار رسالة تأكيد مرئية
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-triply text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideDown';
        alertDiv.innerHTML = language === 'ar' ? '✅ تم نسخ تفاصيل الحجز للحافظة!' : '✅ Booking details copied to clipboard!';
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('Error sharing:', err);
        alert(language === 'ar' ? 'حدث خطأ أثناء المشاركة' : 'An error occurred while sharing');
      }
    }
  };

  // دالة حفظ كـ PDF (باستخدام الطباعة)
  const handleSaveAsPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-triply-sand/20 via-white to-triply-mint/10 dark:from-dark-bg dark:via-dark-surface/50 dark:to-dark-elevated print:bg-white">
      {/* Header للطباعة فقط */}
      <div className="hidden print:block text-center py-6 border-b-4 border-triply mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <svg className="w-10 h-10 text-triply" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
          </svg>
          <h1 className="text-3xl font-bold text-triply-dark">Triply - {t('bookingConfirmation.title')}</h1>
        </div>
        <div className="bg-triply-mint/20 inline-block px-6 py-2 rounded-lg">
          <p className="text-sm font-semibold text-triply-dark">{t('bookingConfirmation.confirmationNumber')}: <span className="text-xl font-bold">{confirmationNumber}</span></p>
        </div>
        <p className="text-xs text-gray-600 mt-2">تاريخ التأكيد: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      {/* Header عادي (يخفى عند الطباعة) */}
      <div className="print:hidden relative overflow-hidden bg-hero-gradient dark:bg-gradient-to-br dark:from-dark-bg dark:via-dark-surface dark:to-dark-elevated">
        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-triply-mint/40 dark:bg-triply-teal/30 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-triply-accent/30 dark:bg-triply-mint/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 text-right text-white dark:text-dark-text-primary">
          <button
            onClick={() => navigate('/booking-details')}
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/90 dark:text-dark-text-secondary hover:text-white dark:hover:text-dark-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t('bookingConfirmation.backToDetails')}
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border-4 border-white/40 mb-6 animate-bounce">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
              {language === 'ar' ? '🎉 تم تأكيد حجزك بنجاح!' : '🎉 Booking Confirmed Successfully!'}
            </h1>
            <p className="text-lg text-white/90 dark:text-dark-text-secondary mb-3">
              {language === 'ar' ? 'رقم التأكيد' : 'Confirmation Number'}: <span className="font-bold text-triply-sand dark:text-triply-mint">{confirmationNumber}</span>
            </p>
            <p className="text-sm text-white/80 dark:text-dark-text-secondary">
              {language === 'ar' ? 'سيتم التواصل معك قريباً لإتمام التفاصيل النهائية' : 'We will contact you soon to finalize the details'}
            </p>
          </div>
        </div>
      </div>

      {/* محتوى التأكيد */}
      <div className="relative mx-auto max-w-5xl px-6 py-12 print:py-8">
        {/* بطاقة معلومات الرحلة */}
        <div className="mb-8 rounded-3xl border-2 border-triply-mint/40 dark:border-triply-teal/40 bg-white dark:bg-dark-elevated/90 p-8 shadow-2xl print:shadow-none print:border-2 print:border-black print:rounded-lg print:p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-triply-mint/30 dark:border-triply-teal/30 print:border-b-2 print:border-gray-400">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal shadow-lg print:bg-white print:border-2 print:border-triply">
              <svg className="w-8 h-8 text-white print:!text-triply" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-triply-dark dark:text-dark-text-primary print:!text-triply">
                📍 {t('bookingConfirmation.title')}
              </h2>
              <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary print:!text-gray-700">{language === 'ar' ? 'تفاصيل حجزك الكامل' : 'Your complete booking details'}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-triply-dark dark:text-dark-text-primary print:text-black">
                <span className="text-2xl">📍</span>
                <div className="flex-1">
                  <p className="text-xs text-triply-slate/70 dark:text-dark-text-secondary print:text-gray-600 mb-1">{t('bookingConfirmation.destination')}</p>
                  <p className="text-lg font-bold leading-relaxed">{getDestinationName(destination, language)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-triply-dark dark:text-dark-text-primary print:text-black">
                <span className="text-2xl">🏷️</span>
                <div className="flex-1">
                  <p className="text-xs text-triply-slate/70 dark:text-dark-text-secondary print:text-gray-600 mb-1">{t('bookingConfirmation.category')}</p>
                  <p className="text-lg font-bold leading-relaxed">
                    {getCategoryName(category, language)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-triply-dark dark:text-dark-text-primary print:text-black">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-xs text-triply-slate/70 dark:text-dark-text-secondary print:text-gray-600">{t('bookingConfirmation.duration')}</p>
                  <p className="text-lg font-bold">{days} {days === 1 ? t('bookingConfirmation.day') : t('bookingConfirmation.days')}</p>
                </div>
              </div>

              {numberOfGuests && (
                <div className="flex items-center gap-3 text-triply-dark dark:text-dark-text-primary print:text-black">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="text-xs text-triply-slate/70 dark:text-dark-text-secondary print:text-gray-600">{t('bookingDetails.summaryGuests')}</p>
                    <p className="text-lg font-bold">{numberOfGuests} {numberOfGuests === 1 ? t('bookingDetails.person') : t('bookingDetails.persons')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-triply-dark dark:text-dark-text-primary print:text-black">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-xs text-triply-slate/70 dark:text-dark-text-secondary print:text-gray-600">{t('bookingConfirmation.arrivalDate')}</p>
                  <p className="text-lg font-bold">{arrivalDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-triply-dark dark:text-dark-text-primary print:text-black">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-xs text-triply-slate/70 dark:text-dark-text-secondary print:text-gray-600">{t('bookingConfirmation.departureDate')}</p>
                  <p className="text-lg font-bold">{departureDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الخدمات المحجوزة */}
        <div className="mb-8 rounded-3xl border-2 border-triply-mint/40 dark:border-triply-teal/40 bg-white dark:bg-dark-elevated/90 p-8 shadow-2xl print:shadow-none print:border-2 print:border-black print:rounded-lg print:p-6">
          <h2 className="text-2xl font-bold text-triply-dark dark:text-dark-text-primary print:!text-triply mb-6 print:border-b-2 print:border-gray-400 print:pb-3">
            💼 {t('bookingConfirmation.selectedServices')}
          </h2>

          <div className="space-y-4">
            {selectedFlight && (
              <div className="flex justify-between items-center p-4 rounded-xl bg-triply-mint/10 dark:bg-triply-teal/20 print:!bg-white border border-triply-mint/30 dark:border-triply-teal/30 print:!border-2 print:!border-gray-300">
                <div className="text-right flex-1">
                  <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary print:!text-gray-700 mb-1 font-semibold">{t('bookingConfirmation.flight')}</p>
                  <p className="font-semibold text-triply-dark dark:text-dark-text-primary print:!text-black">{selectedFlight.airline}</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-triply dark:text-triply-mint print:!text-triply">{formatCurrency(selectedFlight.price, language)}</p>
                </div>
              </div>
            )}

            {selectedHotel && (
              <div className="flex justify-between items-center p-4 rounded-xl bg-triply-mint/10 dark:bg-triply-teal/20 print:!bg-white border border-triply-mint/30 dark:border-triply-teal/30 print:!border-2 print:!border-gray-300">
                <div className="text-right flex-1">
                  <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary print:!text-gray-700 mb-1 font-semibold">{t('bookingConfirmation.hotelNights', { count: days })}</p>
                  <p className="font-semibold text-triply-dark dark:text-dark-text-primary print:!text-black">{selectedHotel.name}</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-triply dark:text-triply-mint print:!text-triply">{formatCurrency((selectedHotel.price * days), language)}</p>
                </div>
              </div>
            )}

            {selectedRestaurants && selectedRestaurants.length > 0 && (
              <div className="p-4 rounded-xl bg-triply-mint/10 dark:bg-triply-teal/20 print:!bg-white border border-triply-mint/30 dark:border-triply-teal/30 print:!border-2 print:!border-gray-300">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary print:!text-gray-700 font-semibold">{t('bookingConfirmation.restaurantsCount', { count: selectedRestaurants.length })}</p>
                  <p className="text-2xl font-bold text-triply dark:text-triply-mint print:!text-triply">
                    {formatCurrency(selectedRestaurants.reduce((sum, r) => sum + (r.price * days), 0), language)}
                  </p>
                </div>
                <div className="space-y-1">
                  {selectedRestaurants.map((restaurant) => (
                    <p key={restaurant.id} className="text-sm text-triply-dark dark:text-dark-text-primary print:!text-black">
                      • {restaurant.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {selectedActivities && selectedActivities.length > 0 && (
              <div className="p-4 rounded-xl bg-triply-mint/10 dark:bg-triply-teal/20 print:!bg-white border border-triply-mint/30 dark:border-triply-teal/30 print:!border-2 print:!border-gray-300">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary print:!text-gray-700 font-semibold">{t('bookingConfirmation.activitiesCount', { count: selectedActivities.length })}</p>
                  <p className="text-2xl font-bold text-triply dark:text-triply-mint print:!text-triply">
                    {formatCurrency(selectedActivities.reduce((sum, a) => sum + a.price, 0), language)}
                  </p>
                </div>
                <div className="space-y-1">
                  {selectedActivities.map((activity) => (
                    <p key={activity.id} className="text-sm text-triply-dark dark:text-dark-text-primary print:!text-black">
                      • {activity.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* المجموع */}
          <div className="mt-6 pt-6 border-t-2 border-triply dark:border-triply-mint print:!border-t-4 print:!border-black">
            <div className="flex justify-between items-center p-6 rounded-2xl bg-gradient-to-r from-triply/10 to-triply-teal/10 dark:from-triply-mint/20 dark:to-triply-teal/20 print:!bg-triply-mint/20 print:!border-4 print:!border-triply">
              <div className="text-left">
                {numberOfGuests > 1 && pricePerPerson && (
                  <p className="text-sm text-triply-dark/70 dark:text-dark-text-secondary print:!text-gray-700 mb-2">
                    {t('bookingDetails.pricePerPerson')}: {formatCurrency(pricePerPerson, language)}
                  </p>
                )}
                <p className="text-4xl font-black text-triply dark:text-triply-mint print:!text-triply">{formatCurrency(totalCost, language)}</p>
                {numberOfGuests > 1 && (
                  <p className="text-xs text-triply-dark/60 dark:text-dark-text-secondary print:!text-gray-600 mt-1">
                    ({formatCurrency(pricePerPerson || (totalCost / numberOfGuests), language)} × {numberOfGuests} {numberOfGuests === 1 ? t('bookingDetails.person') : t('bookingDetails.persons')})
                  </p>
                )}
              </div>
              <p className="text-2xl font-bold text-triply-dark dark:text-dark-text-primary print:!text-triply">{t('bookingConfirmation.totalCost')}</p>
            </div>
          </div>
        </div>

        {/* زر متابعة للدفع */}
        <div className="print:hidden mb-6">
          <button
            onClick={() => navigate('/payment', { state: bookingData })}
            className="w-full px-8 py-5 bg-gradient-to-r from-triply-teal to-triply-mint text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            <span>{language === 'ar' ? 'متابعة للدفع' : 'Proceed to Payment'}</span>
            <span className="text-2xl">💳</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* أزرار الإجراءات (تخفى عند الطباعة) */}
        <div className="print:hidden grid gap-4 sm:grid-cols-3">
          <GlassButton
            variant="accent"
            size="lg"
            onClick={handlePrint}
            className="w-full"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            {language === 'ar' ? '🖨️ طباعة / حفظ PDF' : '🖨️ Print / Save PDF'}
          </GlassButton>

          <GlassButton
            variant="primary"
            size="lg"
            onClick={handleWhatsAppShare}
            className="w-full"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            {language === 'ar' ? '💬 إرسال عبر واتساب' : '💬 Send via WhatsApp'}
          </GlassButton>

          <GlassButton
            variant="secondary"
            size="lg"
            onClick={handleShare}
            className="w-full"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            {language === 'ar' ? '📤 مشاركة' : '📤 Share'}
          </GlassButton>
        </div>

        {/* ملاحظة في الأسفل */}
        <div className="print:hidden mt-8 p-6 rounded-2xl bg-triply-mint/10 dark:bg-triply-teal/20 border border-triply-mint/30 dark:border-triply-teal/30 text-center">
          <p className="text-sm text-triply-slate/80 dark:text-dark-text-secondary">
            {language === 'ar' 
              ? '✨ شكراً لاختيارك Triply! سيتم التواصل معك خلال 24 ساعة لتأكيد التفاصيل النهائية.' 
              : '✨ Thank you for choosing Triply! We will contact you within 24 hours to confirm the final details.'}
          </p>
        </div>

        {/* Footer للطباعة فقط */}
        <div className="hidden print:block mt-8 pt-6 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-600">© 2025 Triply - جميع الحقوق محفوظة</p>
          <p className="text-xs text-gray-500 mt-2">www.triply.com | support@triply.com | +966 50 123 4567</p>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmationPage;
