export * from './database';

/** Search parameters accepted by the search service (mirrors search_listings RPC). */
export interface SearchParams {
  query?: string;
  listingType?: import('./database').ListingType;
  categoryId?: string;
  country?: string;
  island?: string;
  community?: string;
  priceMin?: number;
  priceMax?: number;
  priceType?: import('./database').PriceType;
  available?: boolean;
  limit?: number;
  offset?: number;
}

export interface AdminStats {
  total_users: number;
  active_businesses: number;
  active_listings: number;
  pending_listings: number;
  open_reports: number;
}
