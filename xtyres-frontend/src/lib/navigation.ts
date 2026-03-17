import { CatalogRequestFilter } from './products';

export type NavigatePayload =
  | number
  | {
      productId?: number;
      productSlug?: string;
      categorySlug?: string;
      query?: string;
      filters?: CatalogRequestFilter[];
      sort?: string;
      pageNumber?: number;
      brandIds?: number[];
      priceMin?: number | null;
      priceMax?: number | null;
    };

export interface NavigationOptions {
  replace?: boolean;
}

export type NavigateFn = (
  page: string,
  payload?: NavigatePayload,
  options?: NavigationOptions,
) => void;
