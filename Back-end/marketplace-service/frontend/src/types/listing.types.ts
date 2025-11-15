// services/marketplace-service/frontend/src/types/listing.types.ts

export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: 'furniture' | 'books' | 'electronics' | 'utilities' | 'clothing' | 'sports' | 'other';
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  status: 'available' | 'sold' | 'reserved';
  contactInfo: {
    phone?: string;
    room?: string;
    hostel?: string;
  };
  // FIXED: createdBy should be an object, not a string
  createdBy: {
    _id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  contactInfo: {
    phone?: string;
    room?: string;
    hostel?: string;
  };
}