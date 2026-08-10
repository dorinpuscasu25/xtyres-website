import { NavigatePayload } from './navigation';
import { CatalogRequestFilter } from './products';

export type AppPage =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'contact'
  | 'about'
  | 'cart'
  | 'checkout'
  | 'thank-you';

export interface AppRoute {
  page: AppPage;
  productId?: number;
  productSlug?: string;
  categorySlug?: string;
  query?: string;
  filters: CatalogRequestFilter[];
  sort: string;
  pageNumber: number;
  brandIds: number[];
  priceMin: number | null;
  priceMax: number | null;
  submissionType?: 'order' | 'request' | 'message';
  reference?: string;
}

const emptyRouteState = {
  filters: [] as CatalogRequestFilter[],
  sort: 'featured',
  pageNumber: 1,
  brandIds: [] as number[],
  priceMin: null,
  priceMax: null,
};

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '');
  }

  return pathname;
}

function parseNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseNumberList(value: string | null): number[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function parseFilters(value: string | null): CatalogRequestFilter[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse catalog filters from URL', error);
    return [];
  }
}

export function buildProductPath(productId?: number, productSlug?: string) {
  if (productSlug) {
    return `/produs/${encodeURIComponent(productSlug)}`;
  }

  if (productId) {
    return `/produs/${productId}`;
  }

  return '/products';
}

export function parseCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') {
    return {
      page: 'home',
      ...emptyRouteState,
    };
  }

  return parseRoute(window.location.pathname, window.location.search);
}

export function parseRoute(pathname: string, search: string): AppRoute {
  const normalizedPathname = normalizePathname(pathname);
  const params = new URLSearchParams(search);
  const requestedPage = Number(params.get('page') || '1');

  if (normalizedPathname === '/') {
    return {
      page: 'home',
      ...emptyRouteState,
    };
  }

  if (normalizedPathname === '/shop') {
    return {
      page: 'products',
      categorySlug: 'anvelope',
      ...emptyRouteState,
    };
  }

  if (normalizedPathname.startsWith('/product-category/')) {
    const categorySlug = decodeURIComponent(
      normalizedPathname.replace('/product-category/', ''),
    );

    return {
      page: 'products',
      categorySlug: categorySlug || undefined,
      ...emptyRouteState,
    };
  }

  if (normalizedPathname === '/products') {
    return {
      page: 'products',
      categorySlug: params.get('category') || undefined,
      query: params.get('q') || undefined,
      filters: parseFilters(params.get('filters')),
      sort: params.get('sort') || 'featured',
      pageNumber: Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
      brandIds: parseNumberList(params.get('brands')),
      priceMin: parseNumber(params.get('price_min')),
      priceMax: parseNumber(params.get('price_max')),
    };
  }

  if (normalizedPathname.startsWith('/produs/')) {
    const segment = decodeURIComponent(normalizedPathname.replace('/produs/', ''));

    if (segment) {
      return {
        page: 'product-detail',
        productSlug: segment,
        ...emptyRouteState,
      };
    }
  }

  if (normalizedPathname.startsWith('/products/')) {
    const segment = decodeURIComponent(normalizedPathname.replace('/products/', ''));
    const match = segment.match(/^(\d+)(?:-(.+))?$/);

    if (match) {
      return {
        page: 'product-detail',
        productId: Number(match[1]),
        productSlug: match[2] || undefined,
        ...emptyRouteState,
      };
    }

    if (segment) {
      return {
        page: 'product-detail',
        productSlug: segment,
        ...emptyRouteState,
      };
    }
  }

  if (normalizedPathname === '/contacts' || normalizedPathname === '/contact') {
    return { page: 'contact', ...emptyRouteState };
  }

  if (normalizedPathname === '/despre' || normalizedPathname === '/about') {
    return { page: 'about', ...emptyRouteState };
  }

  if (normalizedPathname === '/cart') {
    return { page: 'cart', ...emptyRouteState };
  }

  if (normalizedPathname === '/checkout') {
    return { page: 'checkout', ...emptyRouteState };
  }

  if (normalizedPathname === '/thank-you' || normalizedPathname === '/multumim') {
    const type = params.get('type');

    return {
      page: 'thank-you',
      submissionType: type === 'order' || type === 'request' || type === 'message'
        ? type
        : 'request',
      reference: params.get('reference') || undefined,
      ...emptyRouteState,
    };
  }

  return {
    page: 'home',
    ...emptyRouteState,
  };
}

export function buildRouteUrl(route: AppRoute): string {
  if (route.page === 'home') {
    return '/';
  }

  if (route.page === 'products') {
    const params = new URLSearchParams();

    if (route.categorySlug) {
      params.set('category', route.categorySlug);
    }

    if (route.query) {
      params.set('q', route.query);
    }

    if (route.sort && route.sort !== 'featured') {
      params.set('sort', route.sort);
    }

    if (route.pageNumber > 1) {
      params.set('page', String(route.pageNumber));
    }

    if (route.brandIds.length > 0) {
      params.set('brands', route.brandIds.join(','));
    }

    if (route.priceMin !== null) {
      params.set('price_min', String(route.priceMin));
    }

    if (route.priceMax !== null) {
      params.set('price_max', String(route.priceMax));
    }

    if (route.filters.length > 0) {
      params.set('filters', JSON.stringify(route.filters));
    }

    const query = params.toString();

    return query ? `/products?${query}` : '/products';
  }

  if (route.page === 'product-detail' && (route.productSlug || route.productId)) {
    return buildProductPath(route.productId, route.productSlug);
  }

  if (route.page === 'contact') {
    return '/contacts';
  }

  if (route.page === 'about') {
    return '/despre';
  }

  if (route.page === 'cart') {
    return '/cart';
  }

  if (route.page === 'checkout') {
    return '/checkout';
  }

  if (route.page === 'thank-you') {
    const params = new URLSearchParams();
    params.set('type', route.submissionType || 'request');

    if (route.reference) {
      params.set('reference', route.reference);
    }

    return `/thank-you?${params.toString()}`;
  }

  return '/';
}

export function updateBrowserUrl(route: AppRoute, replace = false) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextUrl = buildRouteUrl(route);
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (nextUrl === currentUrl) {
    return;
  }

  window.history[replace ? 'replaceState' : 'pushState']({}, '', nextUrl);
}

export function buildRouteFromNavigation(
  page: string,
  payload?: NavigatePayload,
): AppRoute {
  if (page === 'products') {
    if (payload && typeof payload !== 'number') {
      return {
        page: 'products',
        categorySlug: payload.categorySlug,
        query: payload.query,
        filters: payload.filters || [],
        sort: payload.sort || 'featured',
        pageNumber: payload.pageNumber || 1,
        brandIds: payload.brandIds || [],
        priceMin: payload.priceMin ?? null,
        priceMax: payload.priceMax ?? null,
      };
    }

    return {
      page: 'products',
      ...emptyRouteState,
    };
  }

  if (page === 'product-detail') {
    if (typeof payload === 'number') {
      return {
        page: 'product-detail',
        productId: payload,
        ...emptyRouteState,
      };
    }

    return {
      page: 'product-detail',
      productId: payload?.productId,
      productSlug: payload?.productSlug,
      ...emptyRouteState,
    };
  }

  if (page === 'contact' || page === 'about' || page === 'cart' || page === 'checkout') {
    return {
      page,
      ...emptyRouteState,
    };
  }

  if (page === 'thank-you') {
    const details = payload && typeof payload !== 'number' ? payload : undefined;

    return {
      page: 'thank-you',
      submissionType: details?.submissionType || 'request',
      reference: details?.reference,
      ...emptyRouteState,
    };
  }

  return {
    page: 'home',
    ...emptyRouteState,
  };
}
