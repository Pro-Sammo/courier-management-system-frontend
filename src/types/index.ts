export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer" | "agent";
  phone: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "customer" | "agent";
}

export interface Parcel {
  tracking_id: string;
  id: number;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  pickup_address: string;
  delivery_address: string;
  parcel_weight?: number;
  parcel_description?: string;
  parcel_type?:
    | "fragile"
    | "electronics"
    | "documents"
    | "clothing"
    | "food"
    | "other";
  payment_mode: "cod" | "prepaid";
  amount: number;
  is_paid?: boolean;
  status: "PENDING" | "PICKED UP" | "IN TRANSIT" | "DELIVERED" | "FAILED";
  weight?: number;
  agent_id?: number;
  created_at: string;
  updated_at?: string;
  pickup_lat?: number | string;
  pickup_lng?: number | string;
  delivery_lat?: number | string;
  delivery_lng?: number | string;
  agent_name?: string;
  agent_phone?: string;
  agent_photo?: string;
}

export interface IParcel {
  id: number;
  tracking_id: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  pickup_address: string;
  delivery_address: string;
  parcel_weight: number;
  parcel_description: string;
  parcel_type:
    | "fragile"
    | "electronics"
    | "documents"
    | "clothing"
    | "food"
    | "other";
  payment_mode: "cod" | "prepaid";
  amount: number;
  is_paid: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_lat?: number;
  delivery_lng?: number;
}

export interface IBooking {
  success: boolean;
  message: string;
  total: number;
  data: IParcel[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ParcelDetails {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  type: string;
  fragile: boolean;
  value: number;
}

export type ParcelStatus =
  | "PENDING"
  | "PICKED UP"
  | "IN TRANSIT"
  | "DELIVERED"
  | "FAILED";


export interface DailyBooking {
  id: number;
  tracking_id: string;
  customer_name: string;
  sender_name: string;
  receiver_name: string;
  status: string;
  amount: number;
  is_paid: boolean;
  created_at: string;
  payment_mode: string;
}

export interface FailedDelivery {
  id: number;
  tracking_id: string;
  customer_name: string;
  sender_name: string;
  receiver_name: string;
  amount: number;
  status: string;
  created_at: string; 
  updated_at: string;
}

export interface DashboardStats {
  state: {
    total_parcels:string;
    total_cod_count:string;
    pending_deliveries:string;
    delivered_count:string;
    total_revenue:string;
  }
  daily_booking:DailyBooking[]
  failed_deliveries:FailedDelivery[]
}


export interface RecentBooking {
  id: number;
  tracking_id: string;
  status: "DELIVERED" | "FAILED" | "IN TRANSIT" | "PENDING" | "PICKED UP";
  created_at: string;
  amount: string;
  payment_mode: "prepaid" | "cod";
  delivery_address: string;
  pickup_address: string;
  receiver_name: string;
  receiver_phone: string;
}

export interface AgentDashboardStats {
  DELIVERED: number;
  FAILED: number;
  "IN TRANSIT": number;
  PENDING: number;
  "PICKED UP": number;
  recentBooking: RecentBooking[];
}

export interface AgentDashboardResponse {
  success: boolean;
  message: string;
  data: AgentDashboardStats;
}
export interface ILoginResponse {
  success: boolean;
  message: string;
  data: User;
  token: string;
}

export interface Agent {
  id: number;
  name: string;
  photo: string;
  parcels: string;
  phone: string;
}

export interface IAgent {
  success: boolean;
  message: string;
  data: Agent[];
}

export interface AssignedParcel {
  id: number;
  tracking_id: string;
  status: "PENDING" | "PICKED UP" | "IN TRANSIT" | "DELIVERED" | "FAILED";
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  amount: number;
  payment_mode: "cod" | "prepaid";
  pickup_lat?: number | string;
  pickup_lng?: number | string;
  delivery_lat?: number | string;
  delivery_lng?: number | string;
}

export interface GetAssignedParcelsResponse {
  success: boolean;
  message: string;
  data: AssignedParcel[];
}

export interface ParcelTrackingStatus {
  id: number;
  parcel_id: number;
  status: "PENDING" | "PICKED UP" | "IN TRANSIT" | "DELIVERED" | "FAILED";
  updated_by: number;
  note: string;
  updated_at: string;
}

export interface ITrackingParcel {
  id: number;
  tracking_id: string;
  status: string;
  agent_id: number;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  amount: number;
  payment_mode: string;
  agent_name: string;
  agent_phone: string;
  tracking: ParcelTrackingStatus[];
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_lat?: number;
  delivery_lng?: number;
}

export interface TrackParcelResponse {
  success: boolean;
  message: string;
  data: ITrackingParcel;
}


export type IStatus = "PENDING" | "PICKED UP" | "IN TRANSIT" | "DELIVERED" | "FAILED";



export interface AssignedParcelDetail {
  id: number;
  tracking_id: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  status: string;
  created_at: string;
  estimated_time: string | null;
  parcel_type: string;
  payment_mode: string;
  amount: number;
  is_paid: boolean;
}

export interface AgentParcelStatsData {
  total_assigned_today: string;
  pending_count: string;
  picked_up_count: string;
  in_transit_count: string;
  delivered_count: string;
  failed_count: string;
  assigned_parcel_details: AssignedParcelDetail[];
}

export interface AgentParcelStatsResponse {
  success: boolean;
  message: string;
  data: AgentParcelStatsData;
}