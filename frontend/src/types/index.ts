export type Role = 'CUSTOMER' | 'HOTEL_MANAGER' | 'ADMIN';

export type HotelStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'UPI' | 'NETBANKING' | 'WALLET';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  roles: Role[];
  enabled: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  description?: string;
  pricePerNight: number;
  capacity: number;
  bedCount?: number;
  totalUnits: number;
  amenities: string[];
  images: string[];
  active: boolean;
  availableUnits?: number;
}

export interface Hotel {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  address: string;
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  starRating?: number;
  amenities: string[];
  images: string[];
  policies?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: HotelStatus;
  averageRating: number;
  reviewCount: number;
  startingPrice?: number;
  rooms?: Room[];
}

export interface Booking {
  id: string;
  reference: string;
  customerId: string;
  customerName?: string;
  hotelId: string;
  hotelName?: string;
  roomId: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  numberOfRooms: number;
  numberOfGuests: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  specialRequests?: string;
  createdAt?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  failureReason?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  hotelId: string;
  customerId: string;
  customerName?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

export interface Paged<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardData {
  stats: Record<string, number | string>;
  charts: Array<Record<string, string | number>>;
  recent: Array<Record<string, any>>;
}
