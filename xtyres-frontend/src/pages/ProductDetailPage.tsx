import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ChevronRightIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  TruckIcon,
  StarIcon,
  UserIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { useTranslation } from '../lib/i18n';
import { useCart } from '../lib/cart';
import { useReviews } from '../lib/reviews';
import { storefrontApi } from '../lib/api';
import { Product } from '../lib/products';
import { NavigateFn } from '../lib/navigation';
import { updateBrowserUrl } from '../lib/router';
import { prepareRichText } from '../lib/rich-text';
interface ProductDetailPageProps {
  productId?: number;
  productSlug?: string;
  onNavigate: NavigateFn;
}
export function ProductDetailPage({
  productId,
  productSlug,
  onNavigate
}: ProductDetailPageProps) {
  const { t, locale } = useTranslation();
  const { addToCart } = useCart();
  const { getReviews, addReview } = useReviews();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('info');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const productKey = productId ?? productSlug;
  const preparedDescription = useMemo(
    () => prepareRichText(product?.description),
    [product?.description]
  );
  useEffect(() => {
    if (!productKey) return;
    storefrontApi.product(productKey, locale).then((response) => {
      setProduct(response.product);
      setSimilarProducts(response.similarProducts);
    }).catch((error) => {
      console.error('Failed to load product', error);
      setProduct(null);
    });
  }, [productKey, locale]);
  useEffect(() => {
    if (!product) return;
    updateBrowserUrl({
      page: 'product-detail',
      productId: product.id,
      productSlug: product.slug,
      filters: [],
      sort: 'featured',
      pageNumber: 1,
      brandIds: [],
      priceMin: null,
      priceMax: null
    }, true);
    setActiveImage(product.gallery?.[0] || product.imageUrl || null);
  }, [product]);
  const productReviews = getReviews(productId || 0);
  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case 'Nou':
        return 'bg-green-500 text-white';
      case 'Super Preț':
        return 'bg-red-500 text-white';
      case 'Montare gratuită':
        return 'bg-slate-900 text-white';
      case 'Reducere':
        return 'bg-amber-500 text-slate-900';
      default:
        return 'bg-slate-900 text-white';
    }
  };
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };
  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    onNavigate('checkout');
  };
  const submitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewText || !product) return;
    addReview(product.id, {
      name: reviewName,
      email: reviewEmail,
      rating,
      text: reviewText
    });
    setReviewSubmitted(true);
    setReviewName('');
    setReviewEmail('');
    setReviewText('');
    setRating(5);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };
  if (!product) {
    return (
      <main className="flex-grow bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center text-slate-500">
          Produsul nu a putut fi încărcat.
        </div>
      </main>);

  }
  return (
    <main className="flex-grow bg-slate-50 py-8">
      <SeoHead
        title={product.metaTitle || `${product.name} - XTyres`}
        description={product.metaDescription || product.shortDescription || product.description || undefined}
        keywords={product.metaKeywords || undefined}
      />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-slate-500 mb-8 font-medium overflow-x-auto whitespace-nowrap pb-2">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-amber-500 transition-colors">
            
            {t('nav.home')}
          </button>
          <ChevronRightIcon className="w-4 h-4 mx-2 flex-shrink-0" />
          <button
            onClick={() => onNavigate('products')}
            className="hover:text-amber-500 transition-colors">
            
            Produse
          </button>
          <ChevronRightIcon className="w-4 h-4 mx-2 flex-shrink-0" />
          <span className="text-slate-900 truncate">{product.name}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 flex items-center justify-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 relative">
              {product.badge &&
              <div
                className={`absolute top-6 left-6 text-sm font-bold px-4 py-1.5 rounded-full z-10 ${getBadgeColor(product.badge)}`}>
                
                  {product.badge}
                </div>
              }
              {activeImage ?
              <img
                src={activeImage}
                alt={product.name}
                className="w-full max-w-md rounded-2xl object-cover shadow-lg" /> :
              <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border-[20px] border-slate-200 bg-slate-300 shadow-2xl relative">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-400 opacity-20"></div>
                </div>
              }

              {product.gallery && product.gallery.length > 1 ?
              <div className="absolute bottom-6 left-6 right-6 flex gap-3 overflow-x-auto rounded-xl bg-white/80 p-3 backdrop-blur">
                  {product.gallery.map((imageUrl, index) =>
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(imageUrl)}
                  className={`overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === imageUrl ? 'border-amber-500' : 'border-transparent'
                  }`}>
                    
                      <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="h-16 w-16 object-cover" />
                    
                    </button>
                )}
                </div> :
              null}
            </div>

            <div className="p-8 md:p-12 flex flex-col">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                {product.brand}
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-900 leading-tight mb-4">
                {product.name}
              </h1>
              {product.shortDescription &&
              <p className="text-slate-600 mb-6">
                  {product.shortDescription}
                </p>
              }

              <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-slate-100">
                <div className="flex flex-col">
                  {product.oldPrice &&
                  <span className="text-lg text-slate-400 line-through font-medium">
                      {product.oldPrice} MDL
                    </span>
                  }
                  <span className="text-4xl font-heading font-extrabold text-amber-500">
                    {product.price} MDL
                  </span>
                </div>
                {product.oldPrice &&
                <div className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-md">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </div>
                }
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="flex items-center border border-slate-200 rounded-md h-12 w-full sm:w-auto">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    
                    -
                  </button>
                  <div className="w-12 h-full flex items-center justify-center font-bold text-slate-900 border-x border-slate-200">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    
                    +
                  </button>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02
                  }}
                  whileTap={{
                    scale: 0.98
                  }}
                  onClick={handleAddToCart}
                  className="w-full sm:flex-grow h-12 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm flex items-center justify-center">
                  
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  {t('btn.add_to_cart')}
                </motion.button>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.02
                }}
                whileTap={{
                  scale: 0.98
                }}
                onClick={handleBuyNow}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md transition-colors uppercase tracking-wider text-sm mb-8">
                
                {t('btn.buy_now')}
              </motion.button>

              <div className="space-y-3 text-sm text-slate-600 mb-8">
                <div className="flex items-center">
                  <span className="font-bold text-slate-900 w-24">SKU:</span>{' '}
                  {product.sku}
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-slate-900 w-24">
                    Categorie:
                  </span>{' '}
                  <span>{product.primaryCategory?.name || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-slate-900 w-24">Brand:</span>{' '}
                  {product.brand}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-center text-sm font-medium text-slate-700">
                  <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />{' '}
                  Garanție și originalitate
                </div>
                <div className="flex items-center text-sm font-medium text-slate-700">
                  <TruckIcon className="w-5 h-5 text-amber-500 mr-2" /> Livrare
                  rapidă
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-16">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 sm:px-8 py-4 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors ${activeTab === 'info' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-900'}`}>
              
              Informații Suplimentare
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 sm:px-8 py-4 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors ${activeTab === 'reviews' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-900'}`}>
              
              Recenzii ({productReviews.length})
            </button>
          </div>
          <div className="p-4 sm:p-8">
            {activeTab === 'info' &&
            <div className="max-w-2xl">
                <table className="w-full text-sm text-left">
                  <tbody>
                    {(product.specifications || []).map((spec) =>
                    <tr key={spec.id} className="border-b border-slate-100">
                        <th className="py-4 font-bold text-slate-900 uppercase tracking-wider w-1/3">
                          {spec.label}
                        </th>
                        <td className="py-4 text-slate-600">
                          {spec.value}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {preparedDescription.html &&
              (preparedDescription.isHtml ?
              <div
                className="mt-6 space-y-4 text-slate-600 leading-relaxed [&_a]:text-amber-600 [&_a]:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:mb-4 [&_ul]:space-y-2"
                dangerouslySetInnerHTML={{ __html: preparedDescription.html }} /> :
              <div className="mt-6 whitespace-pre-line text-slate-600 leading-relaxed">
                    {preparedDescription.html}
                  </div>
              )}
              </div>
            }

            {activeTab === 'reviews' &&
            <div className="max-w-3xl">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-10">
                  <h3 className="font-heading font-bold text-lg text-slate-900 uppercase tracking-wide mb-4">
                    Adaugă o recenzie
                  </h3>
                  {reviewSubmitted ?
                <div className="bg-green-100 text-green-700 p-4 rounded-md font-medium">
                      Recenzia ta a fost adăugată cu succes! Îți mulțumim.
                    </div> :

                <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                          Nota ta
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) =>
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-amber-500">
                        
                              <StarIcon
                          className={`w-6 h-6 ${(hoverRating || rating) >= star ? 'fill-current' : ''}`} />
                            
                            </button>
                      )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Nume"
                      className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white" />
                    
                        <input
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white" />
                    
                      </div>
                      <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="Scrie recenzia ta"
                    className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white resize-none">
                  </textarea>
                      <button className="px-6 py-3 bg-slate-900 text-white rounded-md font-bold uppercase text-sm">
                        Trimite
                      </button>
                    </form>
                }
                </div>

                <div className="space-y-6">
                  {productReviews.map((review, index) =>
                <div
                  key={index}
                  className="border border-slate-100 rounded-xl p-6">
                    
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {review.name}
                            </p>
                            <div className="flex text-amber-500">
                              {Array.from({
                            length: review.rating
                          }, (_, i) =>
                          <StarIcon
                            key={i}
                            className="w-4 h-4 fill-current" />
                          
                          )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600">{review.text}</p>
                    </div>
                )}
                </div>
              </div>
            }
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-heading font-bold text-slate-900 uppercase tracking-wide mb-6">
            {t('section.similar_products')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {similarProducts.map((tp, index) =>
            <ProductCard
              key={tp.id}
              product={tp}
              onNavigate={onNavigate}
              index={index} />
            )}
          </div>
        </section>
      </div>
    </main>);

}
