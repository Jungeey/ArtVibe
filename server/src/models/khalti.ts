export interface KhaltiInitiateRequest {
  return_url: string;
  website_url: string;
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name: string;
    email: string;
    phone: string;
  };
  amount_breakdown?: Array<{
    label: string;
    amount: number;
  }>;
  product_details?: Array<{
    identity: string;
    name: string;
    total_price: number;
    quantity: number;
    unit_price: number;
  }>;
}

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

export interface KhaltiLookupRequest {
  pidx: string;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: 'Completed' | 'Pending' | 'Initiated' | 'Refunded' | 'Expired' | 'User canceled' | 'Partially Refunded';
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
}

export interface KhaltiErrorResponse {
  detail?: string;
  error_key?: string;
  [key: string]: any;
}