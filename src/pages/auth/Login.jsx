/**
 * مكون Login - نموذج تسجيل الدخول
 * يوفر:
 * - حقول البريد الإلكتروني وكلمة المرور
 * - تسجيل دخول بجوجل
 * - رابط لصفحة التسجيل
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout.jsx';
import { InputField } from '../../components/ui/InputField.jsx';
import { GoogleButton } from '../../components/ui/GoogleButton.jsx';
import { GlassButton } from '../../components/ui/GlassButton.jsx';
import { FeedbackToast } from '../../components/ui/FeedbackToast.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus({ type: 'error', message: t('auth.checkRequiredFields') });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    window.setTimeout(() => {
      const username = formData.email.split('@')[0];
      localStorage.setItem('username', username);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('isLoggedIn', 'true');
      setIsSubmitting(false);
      setStatus({ type: 'success', message: `${t('auth.welcomeUser')} ${username}! ${t('auth.loginSuccess')}.` });
      window.setTimeout(() => {
        navigate('/');
      }, 600);
    }, 1200);
  };

  const handleGoogleLogin = () => {
    // Google OAuth integration placeholder
    setIsSubmitting(true);
    setStatus(null);

    window.setTimeout(() => {
      const username = 'Google User';
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
      setIsSubmitting(false);
      setStatus({ type: 'success', message: t('auth.googleLoginSuccess') });
      window.setTimeout(() => {
        navigate('/');
      }, 600);
    }, 1000);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header with animation */}
        <div className="text-center animate-fadeIn">
          <h1 className="mb-3 font-display text-3xl font-bold bg-gradient-to-r from-triply-teal via-triply to-triply-mint bg-clip-text text-transparent dark:from-triply-mint dark:via-triply-teal dark:to-triply-accentLight animate-gradient-x">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-base text-triply-slate/70 dark:text-slate-400">
            {t('auth.loginToAccount')}
          </p>
        </div>

        <FeedbackToast
          message={status?.message}
          variant={status?.type === 'error' ? 'error' : 'success'}
          onDismiss={() => setStatus(null)}
        />

        {/* Form with staggered animation */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <InputField
              label={t('auth.email')}
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <InputField
              label={t('auth.password')}
              type="password"
              name="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-sm animate-fadeInUp" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <label className="group flex cursor-pointer items-center gap-2 text-triply-slate transition-colors hover:text-triply-teal dark:text-slate-400 dark:hover:text-triply-mint">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer rounded border-2 border-triply-mint/40 bg-white text-triply transition-all focus:ring-2 focus:ring-triply/30 dark:border-triply-teal/40 dark:bg-slate-800 dark:text-triply-mint dark:focus:ring-triply-mint/30"
              />
              {t('auth.rememberMe')}
            </label>
            <a href="#" className="group relative text-triply transition-all hover:text-triply-teal dark:text-triply-mint dark:hover:text-triply-accentLight">
              {t('auth.forgotPassword')}
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-current transition-all group-hover:w-full" />
            </a>
          </div>

          {/* Submit button */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <GlassButton type="submit" variant="primary" className="w-full group relative overflow-hidden" size="lg" isLoading={isSubmitting}>
              <span className="relative z-10">{t('auth.loginButton')}</span>
              <span className="absolute inset-0 -z-0 bg-gradient-to-r from-triply-teal via-triply to-triply-mint opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
            </GlassButton>
          </div>
        </form>

        {/* Divider with animation */}
        <div className="relative animate-fadeInUp" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-triply-mint/30 dark:border-triply-teal/30" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white/90 px-4 text-triply-slate/60 backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-400">
              {t('auth.orContinueWith')}
            </span>
          </div>
        </div>

        {/* Google login */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          <GoogleButton label={t('auth.googleLogin')} onClick={handleGoogleLogin} disabled={isSubmitting} />
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-triply-slate/70 animate-fadeInUp dark:text-slate-400" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="group relative font-semibold text-triply transition-all hover:text-triply-teal dark:text-triply-mint dark:hover:text-triply-accentLight">
            {t('auth.signupLink')}
            <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-current transition-all group-hover:w-full" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export { Login };
