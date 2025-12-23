/**
 * صفحة InvoicePage - صفحة الفاتورة
 * تعرض:
 * - تفاصيل الحجز الكاملة
 * - رقم الفاتورة والمرجع
 * - رمز QR
 * - زر الطباعة/التحميل
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import QRCode from 'qrcode';

function InvoicePage() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { invoiceId: urlInvoiceId } = useParams();
  const { user } = useAuth();
  
  // Get data from location.state OR from user bookings using URL param
  const stateData = location.state || {};
  const invoiceId = stateData.invoiceId || urlInvoiceId;
  
  // If no booking data in state, try to find it in user's bookings
  const [bookingData, setBookingData] = useState(stateData.bookingData || null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If we don't have booking data, try to find it from user bookings
    if (!bookingData && invoiceId && user?.bookings) {
      const foundBooking = user.bookings.find(b => b.id === invoiceId);
      if (foundBooking) {
        setBookingData(foundBooking);
      } else {
        // No booking found with this ID
        navigate('/dashboard');
        return;
      }
    }
    
    if (!bookingData && !invoiceId) {
      navigate('/dashboard');
      return;
    }

    // Generate QR code for the invoice URL
    if (invoiceId && bookingData) {
      const baseUrl = window.location.origin + window.location.pathname.split('#')[0];
      const invoiceUrl = `${baseUrl}#/invoice/${invoiceId}`;
      QRCode.toDataURL(invoiceUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0c5b43',
          light: '#ffffff'
        }
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [bookingData, invoiceId, navigate, user]);

  if (!bookingData) return null;

  const invoiceDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleShare = async () => {
    const baseUrl = window.location.origin + window.location.pathname.split('#')[0];
    const invoiceUrl = `${baseUrl}#/invoice/${invoiceId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t("invoice.title")} Triply - ${bookingData.destination}`,
          text: `${t("invoice.bookingInvoice")} ${bookingData.destination}`,
          url: invoiceUrl
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(invoiceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `triply-invoice-${invoiceId}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-triply-mint/20 via-white to-triply-sand/20 py-12 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-4xl">
        {/* Header Actions - Hidden on print */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-triply-teal shadow-sm transition hover:shadow-md dark:bg-slate-800 dark:text-triply-mint"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("invoice.back")}
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-triply-teal px-4 py-2 text-white shadow-sm transition hover:bg-triply-teal/90"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t("invoice.print")}
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-triply-teal shadow-sm transition hover:shadow-md dark:bg-slate-800 dark:text-triply-mint"
            >
              {copied ? (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("invoice.shared")}
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {t("invoice.share")}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="rounded-3xl border border-triply-mint/40 bg-white p-8 shadow-2xl dark:border-triply-teal/30 dark:bg-slate-900 md:p-12">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between border-b border-triply-mint/30 pb-6 dark:border-triply-teal/30">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-triply-dark dark:text-white">{t("invoice.bookingInvoice")}</h1>
              <p className="text-triply-slate/70 dark:text-slate-400">{t("invoice.invoiceNumber")}: #{invoiceId}</p>
              <p className="text-sm text-triply-slate/70 dark:text-slate-400">{t("invoice.date")}: {invoiceDate}</p>
            </div>
            
            <div className="text-right">
              <p className="mb-1 text-2xl font-bold text-triply-teal dark:text-triply-mint">{t("invoice.companyName")}</p>
              <p className="text-sm text-triply-slate/70 dark:text-slate-400">{t("invoice.companyDescription")}</p>
              <p className="text-sm text-triply-slate/70 dark:text-slate-400">{t("invoice.companyLocation")}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-triply-dark dark:text-white">{t("invoice.bookingDetails")}</h2>
            <div className="space-y-3 rounded-xl bg-triply-sand/20 p-6 dark:bg-slate-800/50">
              <div className="flex justify-between">
                <span className="text-triply-slate/70 dark:text-slate-400">{t("invoice.destination")}:</span>
                <span className="font-semibold text-triply-dark dark:text-white">{bookingData.destination}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-triply-slate/70 dark:text-slate-400">{t("invoice.category")}:</span>
                <span className="font-semibold text-triply-dark dark:text-white">{bookingData.category}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-triply-slate/70 dark:text-slate-400">{t("invoice.numberOfDays")}:</span>
                <span className="font-semibold text-triply-dark dark:text-white">{bookingData.days} {t("invoice.day")}</span>
              </div>

              {bookingData.numberOfGuests && (
                <div className="flex justify-between">
                  <span className="text-triply-slate/70 dark:text-slate-400">{t("bookingDetails.summaryGuests")}:</span>
                  <span className="font-semibold text-triply-dark dark:text-white">
                    {bookingData.numberOfGuests}{" "}
                    {bookingData.numberOfGuests === 1
                      ? t("bookingDetails.person")
                      : t("bookingDetails.persons")}
                  </span>
                </div>
              )}

              {bookingData.travelers && (
                <div className="flex justify-between">
                  <span className="text-triply-slate/70 dark:text-slate-400">{t("invoice.numberOfTravelers")}:</span>
                  <span className="font-semibold text-triply-dark dark:text-white">{bookingData.travelers}</span>
                </div>
              )}

              {bookingData.startDate && (
                <div className="flex justify-between">
                  <span className="text-triply-slate/70 dark:text-slate-400">{t("invoice.startDate")}:</span>
                  <span className="font-semibold text-triply-dark dark:text-white">{bookingData.startDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-triply-dark dark:text-white">{t("invoice.invoiceDetails")}</h2>
            <div className="space-y-3">
              {bookingData.numberOfGuests > 1 && bookingData.pricePerPerson && (
                <div className="flex justify-between text-sm">
                  <span className="text-triply-slate/70 dark:text-slate-400">{t("bookingDetails.pricePerPerson")}:</span>
                  <span className="text-triply-dark/70 dark:text-white/70">{bookingData.pricePerPerson?.toLocaleString('ar-EG')} ر.س</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-triply-slate/70 dark:text-slate-400">{t("invoice.baseAmount")}:</span>
                <span className="text-triply-dark dark:text-white">{bookingData.totalCost?.toLocaleString('ar-EG')} ر.س</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-triply-slate/70 dark:text-slate-400">{t("invoice.tax15")}:</span>
                <span className="text-triply-dark dark:text-white">{((bookingData.totalCost || 0) * 0.15).toLocaleString('ar-EG')} ر.س</span>
              </div>
              
              <div className="border-t border-triply-mint/30 pt-3 dark:border-triply-teal/30">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-triply-dark dark:text-white">{t("invoice.total")}:</span>
                  <span className="text-triply-teal dark:text-triply-mint">
                    {((bookingData.totalCost || 0) * 1.15).toLocaleString('ar-EG')} ر.س
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-8 rounded-xl border-2 border-dashed border-triply-mint/40 bg-gradient-to-br from-triply-mint/5 to-triply-sand/10 p-6 text-center dark:border-triply-teal/30 dark:from-triply-teal/5 dark:to-slate-800/20">
            <h3 className="mb-4 text-lg font-semibold text-triply-dark dark:text-white">
              {t("invoice.qrCodeTitle")}
            </h3>
            
            {qrCodeUrl && (
              <div className="mb-4 flex justify-center">
                <div className="rounded-2xl bg-white p-4 shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="h-64 w-64" />
                </div>
              </div>
            )}
            
            <p className="mb-4 text-sm text-triply-slate/70 dark:text-slate-400">
              {t("invoice.qrCodeDescription")}
            </p>
            
            <div className="flex justify-center gap-3 print:hidden">
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-2 rounded-xl bg-triply-teal px-4 py-2 text-sm text-white transition hover:bg-triply-teal/90"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t("invoice.download")}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-xl border border-triply-teal px-4 py-2 text-sm text-triply-teal transition hover:bg-triply-teal/10 dark:border-triply-mint dark:text-triply-mint"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {t("invoice.share")}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-triply-mint/30 pt-6 text-center dark:border-triply-teal/30">
            <p className="text-sm text-triply-slate/60 dark:text-slate-500">
              {t("invoice.thankYou")}
            </p>
            <p className="mt-2 text-xs text-triply-slate/50 dark:text-slate-600">
              {t("invoice.contact")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePage;
