import { CheckCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavigateFn } from '../lib/navigation';
import { useTranslation } from '../lib/i18n';

interface ThankYouPageProps {
  onNavigate: NavigateFn;
  type?: 'order' | 'request' | 'message';
  reference?: string;
}

export function ThankYouPage({ onNavigate, type = 'request', reference }: ThankYouPageProps) {
  const { t } = useTranslation();
  const titleKey = type === 'order' ? 'thank_you.order_title' : 'thank_you.request_title';
  const messageKey = type === 'order' ? 'thank_you.order_message' : 'thank_you.request_message';

  return (
    <main className="flex flex-grow items-center justify-center bg-slate-50 px-4 py-16 md:py-24">
      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm"
      >
        <div className="h-2 bg-amber-500" />
        <div className="px-6 py-12 sm:px-12 md:py-16">
          <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircleIcon className="h-12 w-12 text-green-600" aria-hidden="true" />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
            {t('thank_you.eyebrow')}
          </p>
          <h1 className="mb-5 text-3xl font-black uppercase tracking-wide text-slate-900 md:text-4xl">
            {t(titleKey)}
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-slate-600">
            {t(messageKey)}
          </p>

          {reference && (
            <div className="mx-auto mt-8 max-w-sm rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                {type === 'order' ? t('thank_you.order_number') : t('thank_you.reference')}
              </span>
              <strong className="mt-1 block text-xl text-slate-900">{reference}</strong>
            </div>
          )}

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => onNavigate('home')}
              className="rounded-md bg-amber-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-slate-900 transition-colors hover:bg-amber-600"
            >
              {t('thank_you.home')}
            </button>
            <button
              onClick={() => onNavigate('products')}
              className="rounded-md border border-slate-300 bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              {t('thank_you.products')}
            </button>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
