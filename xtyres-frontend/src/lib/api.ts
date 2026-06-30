import {
  CatalogFilters,
  CatalogPagination,
  CatalogRequestFilter,
  Product,
  StoreBrand,
  StoreCategory,
  StoreSettings } from
'./products';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/storefront';
const API_ORIGIN = new URL(API_BASE).origin;

function absoluteAssetUrl(value?: string | null): string | null {
  if (!value) return null;

  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:')) {
    return value;
  }

  return new URL(value.startsWith('/') ? value : `/${value}`, API_ORIGIN).toString();
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    imageUrl: absoluteAssetUrl(product.imageUrl),
    gallery: product.gallery?.map((imageUrl) => absoluteAssetUrl(imageUrl)).filter(Boolean) as
      | string[]
      | undefined,
  };
}

function normalizeCategory(category: StoreCategory): StoreCategory {
  return {
    ...category,
    imageUrl: absoluteAssetUrl(category.imageUrl),
    children: category.children.map(normalizeCategory),
  };
}

function normalizeBrand(brand: StoreBrand): StoreBrand {
  return {
    ...brand,
    logoUrl: absoluteAssetUrl(brand.logoUrl),
  };
}

function normalizeSettings(settings: StoreSettings): StoreSettings {
  return {
    ...settings,
    headerLogoUrl: absoluteAssetUrl(settings.headerLogoUrl),
    footerLogoUrl: absoluteAssetUrl(settings.footerLogoUrl),
  };
}

function normalizeBootstrapResponse(response: BootstrapResponse): BootstrapResponse {
  return {
    ...response,
    settings: normalizeSettings(response.settings),
    menu: response.menu.map(normalizeCategory),
    brands: response.brands.map(normalizeBrand),
  };
}

function normalizeHomeResponse(response: HomeResponse): HomeResponse {
  return {
    ...response,
    featuredProducts: response.featuredProducts.map(normalizeProduct),
    featuredCategories: response.featuredCategories.map(normalizeCategory),
    brands: response.brands.map(normalizeBrand),
  };
}

function normalizeCatalogResponse(response: CatalogResponse): CatalogResponse {
  return {
    ...response,
    category: response.category ? normalizeCategory(response.category) : null,
    products: response.products.map(normalizeProduct),
  };
}

function normalizeProductResponse(response: ProductResponse): ProductResponse {
  return {
    ...response,
    product: normalizeProduct(response.product),
    similarProducts: response.similarProducts.map(normalizeProduct),
  };
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | null | undefined>,
) {
  const url = new URL(`${API_BASE}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function request<T>(
  path: string,
  params?: Record<string, string | number | null | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, params));

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function postRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export interface BootstrapResponse {
  locale: string;
  settings: StoreSettings;
  menu: StoreCategory[];
  brands: StoreBrand[];
}

export interface HomeResponse {
  featuredProducts: Product[];
  featuredCategories: StoreCategory[];
  brands: StoreBrand[];
}

export interface CatalogResponse {
  category: StoreCategory | null;
  products: Product[];
  filters: CatalogFilters;
  pagination: CatalogPagination;
}

export interface ProductResponse {
  product: Product;
  similarProducts: Product[];
}

export interface SearchResponse {
  products: Product[];
}

export interface CreateOrderPayload {
  locale: string;
  customer: {
    first_name: string;
    last_name: string;
    email?: string;
    phone: string;
    city: string;
    street: string;
    street_number: string;
    postal_code?: string;
  };
  payment_method: 'cash' | 'transfer' | 'card';
  note?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface CreateOrderResponse {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    total: number;
  };
}

export const storefrontApi = {
  bootstrap(locale: string) {
    return request<BootstrapResponse>('/bootstrap', { locale }).then(normalizeBootstrapResponse);
  },
  home(locale: string) {
    return request<HomeResponse>('/home', { locale }).then(normalizeHomeResponse);
  },
  settings(locale: string) {
    return request<{ settings: StoreSettings }>('/settings', { locale }).then((response) => ({
      settings: normalizeSettings(response.settings),
    }));
  },
  catalog(params: {
    locale: string;
    category?: string | null;
    q?: string | null;
    sort?: string;
    page?: number;
    brandIds?: number[];
    priceMin?: number | null;
    priceMax?: number | null;
    filters?: CatalogRequestFilter[];
  }) {
    return request<CatalogResponse>('/catalog', {
      locale: params.locale,
      category: params.category ?? undefined,
      q: params.q ?? undefined,
      sort: params.sort ?? 'featured',
      page: params.page ?? 1,
      brand_ids: params.brandIds?.join(','),
      price_min: params.priceMin ?? undefined,
      price_max: params.priceMax ?? undefined,
      filters:
        params.filters && Array.isArray(params.filters) && params.filters.length === 0
          ? undefined
          : params.filters
          ? JSON.stringify(params.filters)
          : undefined,
    }).then(normalizeCatalogResponse);
  },
  product(productKey: string | number, locale: string) {
    return request<ProductResponse>(`/products/${productKey}`, { locale }).then(
      normalizeProductResponse,
    );
  },
  search(query: string, locale: string) {
    return request<SearchResponse>('/search', { q: query, locale }).then((response) => ({
      products: response.products.map(normalizeProduct),
    }));
  },
  createOrder(payload: CreateOrderPayload) {
    return postRequest<CreateOrderResponse>('/orders', payload);
  },
};
