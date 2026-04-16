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
  colonyId?: string;
  raisedBy: string;
  raisedByName: string;
  flatNumber: string;
  title: string;
  description: string;
  category: 'maintenance' | 'security' | 'cleanliness' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Visitor {
  id: string;
  visitorName: string;
  purpose: string;
  vehicleNumber?: string;
  otp?: string;
  otpExpiresAt: string;
  status: 'pending' | 'approved' | 'entered' | 'exited' | 'expired';
  entryTime?: string;
  exitTime?: string;
  createdAt: string;
  residentId: string;
  residentName: string;
  flatNumber: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  eventDate: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  rsvpCount: number;
  userRsvped: boolean;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  status: 'active' | 'sold' | 'removed';
  createdAt: string;
  sellerId: string;
  sellerName: string;
  flatNumber: string;
  sellerAvatar?: string;
}

export interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  flatNumber: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'general' | 'maintenance' | 'events' | 'private';
  createdAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastSenderName?: string;
}

export interface Message {
  id: string;
  roomId: string;
  content?: string;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
}
