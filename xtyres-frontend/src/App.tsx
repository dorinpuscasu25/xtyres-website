import { useEffect, useState } from 'react';
import { TranslationProvider } from './lib/i18n';
import { StorefrontProvider } from './lib/storefront';
import { CartProvider } from './lib/cart';
import { ReviewsProvider } from './lib/reviews';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SeoHead } from './components/SeoHead';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { NavigatePayload, NavigationOptions } from './lib/navigation';
import {
  AppRoute,
  buildRouteFromNavigation,
  parseCurrentRoute,
  updateBrowserUrl,
} from './lib/router';

function genericTitle(route: AppRoute) {
  switch (route.page) {
    case 'products':
      return 'Catalog produse - XTyres';
    case 'product-detail':
      return 'Produs - XTyres';
    case 'contact':
      return 'Contacte - XTyres';
    case 'about':
      return 'Despre noi - XTyres';
    case 'cart':
      return 'Coș - XTyres';
    case 'checkout':
      return 'Finalizare comandă - XTyres';
    default:
      return 'XTyres';
  }
}

export function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseCurrentRoute());

  useEffect(() => {
    const syncRouteFromUrl = () => {
      setRoute(parseCurrentRoute());
    };

    window.addEventListener('popstate', syncRouteFromUrl);

    return () => window.removeEventListener('popstate', syncRouteFromUrl);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.page, route.productId, route.categorySlug, route.query]);

  const handleNavigate = (
    page: string,
    payload?: NavigatePayload,
    options?: NavigationOptions,
  ) => {
    const nextRoute = buildRouteFromNavigation(page, payload);

    setRoute(nextRoute);
    updateBrowserUrl(nextRoute, options?.replace);
  };

  const renderPage = () => {
    switch (route.page) {
      case 'products':
        return (
          <ProductsPage
            onNavigate={handleNavigate}
            initialCategorySlug={route.categorySlug}
            initialQuery={route.query}
            initialFilters={route.filters}
            initialSort={route.sort}
            initialPage={route.pageNumber}
            initialBrandIds={route.brandIds}
            initialPriceMin={route.priceMin}
            initialPriceMax={route.priceMax}
          />
        );
      case 'product-detail':
        return (
          <ProductDetailPage
            productId={route.productId}
            productSlug={route.productSlug}
            onNavigate={handleNavigate}
          />
        );
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <TranslationProvider>
      <StorefrontProvider>
        <CartProvider>
          <ReviewsProvider>
            <SeoHead title={genericTitle(route)} />
            <div className="min-h-screen flex flex-col w-full bg-slate-50 font-sans">
              <Header onNavigate={handleNavigate} />
              {renderPage()}
              <Footer />
            </div>
          </ReviewsProvider>
        </CartProvider>
      </StorefrontProvider>
    </TranslationProvider>
  );
}
