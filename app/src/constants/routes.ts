export const Routes = {
  // Auth Stack
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  OTP_VERIFY: 'OtpVerify',
  COLONY_SELECT: 'ColonySelect',
  REGISTER: 'Register',

  // Resident Tabs
  RESIDENT_HOME: 'ResidentHome',
  RESIDENT_CHAT: 'ResidentChat',
  RESIDENT_MARKETPLACE: 'ResidentMarketplace',
  RESIDENT_EVENTS: 'ResidentEvents',
  RESIDENT_PROFILE: 'ResidentProfile',

  // Resident Screens
  ANNOUNCEMENTS: 'Announcements',
  COMPLAINT_LIST: 'ComplaintList',
  COMPLAINT_DETAIL: 'ComplaintDetail',
  RAISE_COMPLAINT: 'RaiseComplaint',
  VISITOR_APPROVAL: 'VisitorApproval',
  SOS: 'SOS',
  AI_ASSISTANT: 'AiAssistant',
  CHAT_ROOM: 'ChatRoom',
  MARKETPLACE_DETAIL: 'MarketplaceDetail',
  CREATE_LISTING: 'CreateListing',
  EVENT_DETAIL: 'EventDetail',

  // Secretary Stack
  SECRETARY_DASHBOARD: 'SecretaryDashboard',
  SECRETARY_TABS: 'SecretaryTabs',
  POST_ANNOUNCEMENT: 'PostAnnouncement',
  MANAGE_COMPLAINTS: 'ManageComplaints',
  MANAGE_RESIDENTS: 'ManageResidents',
  CREATE_EVENT: 'CreateEvent',

  // Guard Stack
  GUARD_HOME: 'GuardHome',
  VISITOR_LOG: 'VisitorLog',
  VERIFY_OTP: 'VerifyOtp',
} as const;

export type RouteNames = (typeof Routes)[keyof typeof Routes];
