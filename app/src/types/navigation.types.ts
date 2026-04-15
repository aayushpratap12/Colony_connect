import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Routes } from '@constants/routes';

// Auth Stack
export type AuthStackParamList = {
  [Routes.SPLASH]: undefined;
  [Routes.ONBOARDING]: undefined;
  [Routes.LOGIN]: undefined;
  [Routes.OTP_VERIFY]: { phone: string };
  [Routes.COLONY_SELECT]: { phone: string };
  [Routes.REGISTER]: { phone: string; colonyId: string };
};

// Resident Bottom Tabs
export type ResidentTabParamList = {
  [Routes.RESIDENT_HOME]: undefined;
  [Routes.RESIDENT_CHAT]: undefined;
  [Routes.RESIDENT_MARKETPLACE]: undefined;
  [Routes.RESIDENT_EVENTS]: undefined;
  [Routes.RESIDENT_PROFILE]: undefined;
};

// Resident Stack (wraps tabs + modal screens)
export type ResidentStackParamList = {
  ResidentTabs: undefined;
  [Routes.ANNOUNCEMENTS]: undefined;
  [Routes.COMPLAINT_LIST]: undefined;
  [Routes.COMPLAINT_DETAIL]: { complaintId: string };
  [Routes.RAISE_COMPLAINT]: undefined;
  [Routes.VISITOR_APPROVAL]: undefined;
  [Routes.SOS]: undefined;
  [Routes.AI_ASSISTANT]: undefined;
  [Routes.CHAT_ROOM]: { roomId: string; roomName: string };
  [Routes.MARKETPLACE_DETAIL]: { listingId: string };
  [Routes.CREATE_LISTING]: undefined;
  [Routes.EVENT_DETAIL]: { eventId: string };
};

// Secretary Stack
export type SecretaryStackParamList = {
  [Routes.SECRETARY_DASHBOARD]: undefined;
  [Routes.POST_ANNOUNCEMENT]: undefined;
  [Routes.MANAGE_COMPLAINTS]: undefined;
  [Routes.COMPLAINT_DETAIL]: { complaintId: string };
  [Routes.MANAGE_RESIDENTS]: undefined;
  [Routes.CREATE_EVENT]: undefined;
  [Routes.VISITOR_APPROVAL]: undefined;
};

// Guard Stack
export type GuardStackParamList = {
  [Routes.GUARD_HOME]: undefined;
  [Routes.VISITOR_LOG]: undefined;
  [Routes.VERIFY_OTP]: undefined;
};

// Screen prop helpers
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type ResidentTabProps<T extends keyof ResidentTabParamList> = BottomTabScreenProps<ResidentTabParamList, T>;
export type ResidentScreenProps<T extends keyof ResidentStackParamList> = NativeStackScreenProps<ResidentStackParamList, T>;
export type SecretaryScreenProps<T extends keyof SecretaryStackParamList> = NativeStackScreenProps<SecretaryStackParamList, T>;
export type GuardScreenProps<T extends keyof GuardStackParamList> = NativeStackScreenProps<GuardStackParamList, T>;
