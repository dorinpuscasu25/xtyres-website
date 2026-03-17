export interface ProductCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface ProductSpecification {
  id: number;
  slug: string;
  label: string;
  value: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  oldPrice: number | null;
  badge: 'Nou' | 'Super Preț' | 'Montare gratuită' | 'Reducere' | null;
  brand: string | null;
  brandId?: number | null;
  imageUrl?: string | null;
  attributes: Record<string, string>;
  primaryCategory?: ProductCategoryRef | null;
  categories?: ProductCategoryRef[];
  sku?: string;
  stockQuantity?: number;
  specifications?: ProductSpecification[];
  gallery?: string[];
  metaTitle?: string | null;
  metaKeywords?: string | null;
  metaDescription?: string | null;
}

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  children: StoreCategory[];
}

export interface StoreBrand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
}

export interface SocialLink {
  name: string;
  url: string;
}

export interface StoreSettings {
  siteName: string;
  siteDescription?: string | null;
  footerText?: string | null;
  contactAddress?: string | null;
  workingHours?: string | null;
  emails: string[];
  phones: string[];
  socialLinks: SocialLink[];
  mapEmbedUrl?: string | null;
  headerLogoUrl?: string | null;
  footerLogoUrl?: string | null;
}

export interface CatalogOptionFilter {
  id: number;
  label: string;
  count: number;
  value?: boolean;
}

export interface CatalogAttributeFilter {
  id: number;
  slug: string;
  label: string;
  type: 'select' | 'multi_select' | 'number' | 'boolean';
  options?: CatalogOptionFilter[];
  min?: number | null;
  max?: number | null;
  values?: number[];
}

export interface CatalogRequestFilter {
  attribute_id: number;
  type: 'select' | 'multi_select' | 'number' | 'boolean';
  values?: number[];
  min?: number;
  max?: number;
  value?: boolean;
}

export interface CatalogFilters {
  brands: CatalogOptionFilter[];
  price: {
    min: number | null;
    max: number | null;
  };
  attributes: CatalogAttributeFilter[];
}

export interface CatalogPagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}
