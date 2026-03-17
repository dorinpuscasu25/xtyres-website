import { FormEvent, useState } from 'react';
import { ChevronRightIcon, CheckCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../lib/cart';
import { storefrontApi } from '../lib/api';
import { useTranslation } from '../lib/i18n';
import { NavigateFn } from '../lib/navigation';
interface CheckoutPageProps {
  onNavigate: NavigateFn;
}
export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { t, locale } = useTranslation();
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    street: '',
    streetNumber: '',
    postalCode: '',
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'card',
    note: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await storefrontApi.createOrder({
        locale,
        customer: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: formData.email || undefined,
          city: formData.city,
          street: formData.street,
          street_number: formData.streetNumber,
          postal_code: formData.postalCode || undefined
        },
        payment_method: formData.paymentMethod,
        note: formData.note || undefined,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      });
      setOrderNumber(response.order.orderNumber);
      setIsSubmitted(true);
      clearCart();
    } catch (error) {
      setSubmitError(
        error instanceof Error ?
        error.message :
        'Comanda nu a putut fi trimisă.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isSubmitted) {
    return (
      <main className="flex-grow bg-slate-50 py-20 flex items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          className="max-w-md w-full px-4 text-center">
          
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-900 uppercase tracking-wide mb-4">
            Comandă Plasată!
          </h1>
          <p className="text-slate-600 mb-8 text-lg">
            Îți mulțumim pentru comandă. Vei fi contactat în scurt timp de un
            operator pentru confirmare.
          </p>
          {orderNumber &&
          <p className="text-sm font-bold text-slate-500 mb-6">
              Număr comandă: {orderNumber}
            </p>
          }
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm">
            
            Întoarce-te la pagina principală
          </button>
        </motion.div>
      </main>);

  }
  if (items.length === 0) {
    return (
      <main className="flex-grow bg-slate-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Coșul este gol</h1>
          <button
            onClick={() => onNavigate('products')}
            className="text-amber-500 font-bold">
            
            Înapoi la produse
          </button>
        </div>
      </main>);

  }
  return (
    <main className="flex-grow bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-slate-500 mb-8 font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-amber-500 transition-colors">
            
            {t('nav.home')}
          </button>
          <ChevronRightIcon className="w-4 h-4 mx-2" />
          <button
            onClick={() => onNavigate('cart')}
            className="hover:text-amber-500 transition-colors">
            
            Coșul tău
          </button>
          <ChevronRightIcon className="w-4 h-4 mx-2" />
          <span className="text-slate-900">Checkout</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-wide mb-8">
          Finalizare Comandă
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <div className="w-full lg:w-2/3">
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="space-y-8">
              {submitError &&
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {submitError}
                </div>
              }
              
              {/* Date Personale */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-heading font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">
                  1. Date Personale
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Nume
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        firstName: event.target.value
                      }))
                      }
                      className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors" />
                    
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Prenume
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        lastName: event.target.value
                      }))
                      }
                      className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors" />
                    
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Telefon
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        phone: event.target.value
                      }))
                      }
                      className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors" />
                    
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        email: event.target.value
                      }))
                      }
                      className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors" />
                    
                  </div>
                </div>
              </div>

              {/* Adresa */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-heading font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">
                  2. Adresa de Livrare
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Oraș / Localitate
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        city: event.target.value
                      }))
                      }
                      className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors" />
                    
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Strada
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.street}
                      onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        street: event.target.value
                      }))
                      }
                      className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors" />
                    
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Număr
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.streetNumber}
                      onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        streetNumber: event.target.value
                      }))
                      }
                      className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors" />
                    
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Cod Poștal (Opțional)
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        postalCode: event.target.value
                      }))
                      }
                      className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors" />
                    
                  </div>
                </div>
              </div>

              {/* Metoda Plata */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-heading font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">
                  3. Metoda de Plată
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={() =>
                      setFormData((current) => ({
                        ...current,
                        paymentMethod: 'cash'
                      }))
                      }
                      className="w-5 h-5 text-amber-500 focus:ring-amber-500 border-slate-300"
                      />
                    
                    <span className="ml-3 font-bold text-slate-900">
                      Numerar la livrare
                    </span>
                  </label>
                  <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={() =>
                      setFormData((current) => ({
                        ...current,
                        paymentMethod: 'transfer'
                      }))
                      }
                      className="w-5 h-5 text-amber-500 focus:ring-amber-500 border-slate-300" />
                    
                    <span className="ml-3 font-bold text-slate-900">
                      Transfer bancar
                    </span>
                  </label>
                  <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={() =>
                      setFormData((current) => ({
                        ...current,
                        paymentMethod: 'card'
                      }))
                      }
                      className="w-5 h-5 text-amber-500 focus:ring-amber-500 border-slate-300" />
                    
                    <span className="ml-3 font-bold text-slate-900">
                      Card bancar online
                    </span>
                  </label>
                </div>
              </div>

              {/* Nota */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-heading font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">
                  4. Notă Comandă (Opțional)
                </h2>
                <textarea
                  rows={4}
                  value={formData.note}
                  onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    note: event.target.value
                  }))
                  }
                  className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-colors resize-none"
                  placeholder="Detalii suplimentare pentru livrare...">
                </textarea>
              </div>
            </form>
          </div>

          {/* Right: Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl sticky top-24">
              <h2 className="text-xl font-heading font-bold uppercase tracking-wider mb-6 pb-4 border-b border-slate-700">
                Sumar Comandă
              </h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) =>
                <div
                  key={item.product.id}
                  className="flex justify-between text-sm">
                  
                    <div className="flex-grow pr-4">
                      <span className="text-slate-400">{item.quantity} × </span>
                      <span className="font-medium truncate block">
                        {item.product.name}
                      </span>
                    </div>
                    <div className="font-bold whitespace-nowrap">
                      {item.product.price * item.quantity} MDL
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-700 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>{totalPrice} MDL</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Livrare</span>
                  <span className="text-amber-500 font-bold">Gratuit</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-700 mb-8">
                <span className="text-lg font-bold uppercase tracking-wider">
                  Total
                </span>
                <span className="text-3xl font-heading font-black text-amber-500">
                  {totalPrice} MDL
                </span>
              </div>

            <motion.button
              whileHover={{
                scale: 1.02
                }}
                whileTap={{
                  scale: 0.98
              }}
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm">
              
              {isSubmitting ? 'Se trimite comanda...' : 'Plasează Comanda'}
            </motion.button>
            </div>
          </div>
        </div>
      </div>
    </main>);

}
