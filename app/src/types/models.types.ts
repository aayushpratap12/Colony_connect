export type UserRole = 'resident' | 'secretary' | 'guard';

export interface User {
  id: string;
  colonyId: string;
  name: string;
  phone: string;
  role: UserRole;
  flatNumber?: string;
  fcmToken?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Colony {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  totalUnits: number;
  createdAt: string;
}

export interface Announcement {
  id: string;
  colonyId: string;
  title: string;
  body: string;
  createdBy: string;
  createdByName: string;
  isPinned: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  colonyId: string;
  raisedBy: string;
  raisedByName: string;
  title: string;
  description: string;
  category: 'maintenance' | 'security' | 'cleanliness' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  colonyId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  createdAt: string;
}

export interface Visitor {
  id: string;
  colonyId: string;
  residentId: string;
  residentName: string;
  visitorName: string;
  purpose: string;
  otp: string;
  status: 'pending' | 'approved' | 'entered' | 'exited' | 'expired';
  vehicleNumber?: string;
  entryTime?: string;
  exitTime?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  colonyId: string;
  title: string;
  description: string;
  venue: string;
  eventDate: string;
  createdBy: string;
  rsvpCount: number;
  hasRsvped: boolean;
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  colonyId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  status: 'active' | 'sold' | 'removed';
  createdAt: string;
}

export interface SosAlert {
  id: string;
  colonyId: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'resolved';
  createdAt: string;
}
