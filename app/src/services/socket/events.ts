// All socket event name constants — single source of truth
export const SocketEvents = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Announcements
  NEW_ANNOUNCEMENT: 'announcement:new',
  ANNOUNCEMENT_PINNED: 'announcement:pinned',

  // Chat
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  USER_TYPING: 'user:typing',
  USER_TYPING_STOP: 'user:typing_stop',

  // Complaints
  COMPLAINT_UPDATED: 'complaint:updated',

  // Visitors
  VISITOR_APPROVED: 'visitor:approved',
  VISITOR_ENTRY: 'visitor:entry',

  // Events
  EVENT_RSVP_UPDATED: 'event:rsvp_updated',

  // SOS
  SOS_ALERT: 'sos:alert',
  SOS_RESOLVED: 'sos:resolved',

  // Marketplace
  LISTING_UPDATED: 'listing:updated',
} as const;
