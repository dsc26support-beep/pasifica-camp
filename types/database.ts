/**
 * Pasifika Campus — Database types
 * -------------------------------------------------------------------------
 * Hand-maintained to mirror supabase/migrations. When the schema changes,
 * update these (or regenerate with `supabase gen types typescript`).
 */

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type BusinessStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type CategoryType = 'product' | 'service' | 'rental' | 'business';
export type ListingType = 'product' | 'service' | 'rental';
export type ListingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'unavailable'
  | 'removed';
export type PriceType = 'fixed' | 'negotiable';
export type AvailabilityStatus = 'available' | 'unavailable';
export type NotificationType =
  | 'new_message'
  | 'message_reply'
  | 'listing_approved'
  | 'listing_rejected'
  | 'admin_announcement';
export type TipStatus = 'draft' | 'published' | 'unpublished';
export type ReportTarget = 'listing' | 'business' | 'user';
export type ReportReason =
  | 'scam'
  | 'incorrect_information'
  | 'prohibited_item'
  | 'duplicate'
  | 'offensive_content'
  | 'other';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  country: string;
  island: string | null;
  community: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  country: string;
  island: string | null;
  community: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: Record<string, unknown> | null;
  is_open: boolean;
  status: BusinessStatus;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  business_id: string | null;
  category_id: string | null;
  listing_type: ListingType;
  title: string;
  description: string | null;
  price: number | null;
  price_type: PriceType;
  condition: string | null;
  brand: string | null;
  quantity: number | null;
  country: string;
  island: string | null;
  community: string | null;
  latitude: number | null;
  longitude: number | null;
  availability_status: AvailabilityStatus;
  status: ListingStatus;
  rejection_reason: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface Favourite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  listing_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string | null;
  business_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  listing_id: string | null;
  message: string;
  read_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  reference_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Tip {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  link_url: string | null;
  status: TipStatus;
  published_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
}

/** Common composite shapes returned by joined queries. */
export interface ListingWithImages extends Listing {
  listing_images: ListingImage[];
}

export interface ListingWithRelations extends ListingWithImages {
  owner?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
  business?: Pick<Business, 'id' | 'name' | 'logo_url' | 'is_open'> | null;
  category?: Pick<Category, 'id' | 'name' | 'type'> | null;
}
