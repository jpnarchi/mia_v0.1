// Existing types...

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_hotel: string | null;
  frequent_changes: boolean;
  avoid_locations: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_intent_id: string;
  created_at: string;
  bookings: {
    confirmation_code: string;
    hotel_name: string;
    check_in: string;
    check_out: string;
  } | null;
}

export interface Invoice {
  id: string;
  user_id: string;
  booking_id: string;
  invoice_type: InvoiceType;
  status: 'pending' | 'completed' | 'cancelled';
  amount: number;
  tax_percentage: number;
  billing_details: {
    business_name: string;
    rfc: string;
    email: string;
    custom_comments?: string;
  };
  created_at: string;
  updated_at: string;
  booking?: {
    confirmation_code: string;
    hotel_name: string;
    check_in: string;
    check_out: string;
  };
}

export type InvoiceType = 
  | 'purchase'
  | 'purchase_with_comments'
  | 'partial_purchase'
  | 'partial_purchase_with_comments'
  | 'reservation'
  | 'reservation_with_comments'
  | 'partial_nights'
  | 'partial_nights_with_comments'
  | 'per_traveler'
  | 'per_traveler_with_comments'
  | 'per_service'
  | 'per_service_with_comments'
  | 'group_reservations'
  | 'group_reservations_with_comments'
  | 'advance_payment'
  | 'advance_payment_with_comments'
  | 'custom_tax'
  | 'custom_tax_with_comments'
  | 'combined_traveler_service'
  | 'combined_traveler_service_with_comments'
  | 'combined_provider'
  | 'combined_provider_with_comments';

export interface BillingOption {
  id: InvoiceType;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  allowsComments: boolean;
  category: 'basic' | 'advanced' | 'combined';
}