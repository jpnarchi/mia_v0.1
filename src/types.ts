export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isLoading?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  promptCount: number;
}

export interface BookingData {
  confirmationCode: string | null;
  hotel: {
    name: string | null;
    location: string | null;
    image: string | null;
    additionalImages?: string[];
  };
  dates: {
    checkIn: string | null;
    checkOut: string | null;
  };
  room: {
    type: 'single' | 'double' | null;
    pricePerNight: number | null;
    totalPrice: number | null;
  };
  guests: string[];
  totalNights: number | null;
}

export interface WebhookResponse {
  output: string | null;
  type: string | null;
  data: {
    bookingData: BookingData;
  };
}