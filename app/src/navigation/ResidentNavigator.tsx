import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { ResidentStackParamList, ResidentTabParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';
import { Colors } from '@constants/theme';

// Tab screens — placeholders
import ResidentHomeScreen from '@screens/resident/ResidentHomeScreen';
import ResidentChatScreen from '@screens/resident/ResidentChatScreen';
import ResidentMarketplaceScreen from '@screens/resident/ResidentMarketplaceScreen';
import ResidentEventsScreen from '@screens/resident/ResidentEventsScreen';
import ResidentProfileScreen from '@screens/resident/ResidentProfileScreen';

// Stack screens — placeholders
import AnnouncementsScreen from '@screens/resident/AnnouncementsScreen';
import ComplaintListScreen from '@screens/resident/ComplaintListScreen';
import RaiseComplaintScreen from '@screens/resident/RaiseComplaintScreen';
import VisitorApprovalScreen from '@screens/resident/VisitorApprovalScreen';
import SosScreen from '@screens/resident/SosScreen';
import ChatRoomScreen from '@screens/resident/ChatRoomScreen';
import MarketplaceDetailScreen from '@screens/resident/MarketplaceDetailScreen';
import CreateListingScreen from '@screens/resident/CreateListingScreen';
import EventDetailScreen from '@screens/resident/EventDetailScreen';
import AiAssistantScreen from '@screens/resident/AiAssistantScreen';

const Tab = createBottomTabNavigator<ResidentTabParamList>();
const Stack = createNativeStackNavigator<ResidentStackParamList>();

const ResidentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: {
        borderTopColor: Colors.border,
      },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          [Routes.RESIDENT_HOME]:        'home',
          [Routes.RESIDENT_CHAT]:        'chatbubble-ellipses',
          [Routes.RESIDENT_MARKETPLACE]: 'storefront',
          [Routes.RESIDENT_EVENTS]:      'calendar',
          [Routes.RESIDENT_PROFILE]:     'person',
        };
        return <Ionicons name={icons[route.name] ?? 'home'} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name={Routes.RESIDENT_HOME} component={ResidentHomeScreen} options={{ title: 'Home' }} />
    <Tab.Screen name={Routes.RESIDENT_CHAT} component={ResidentChatScreen} options={{ title: 'Chat' }} />
    <Tab.Screen name={Routes.RESIDENT_MARKETPLACE} component={ResidentMarketplaceScreen} options={{ title: 'Market' }} />
    <Tab.Screen name={Routes.RESIDENT_EVENTS} component={ResidentEventsScreen} options={{ title: 'Events' }} />
    <Tab.Screen name={Routes.RESIDENT_PROFILE} component={ResidentProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

const ResidentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ResidentTabs" component={ResidentTabs} />
    <Stack.Screen name={Routes.ANNOUNCEMENTS} component={AnnouncementsScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name={Routes.COMPLAINT_LIST} component={ComplaintListScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name={Routes.RAISE_COMPLAINT} component={RaiseComplaintScreen} options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name={Routes.VISITOR_APPROVAL} component={VisitorApprovalScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name={Routes.SOS} component={SosScreen} options={{ animation: 'fade' }} />
    <Stack.Screen name={Routes.CHAT_ROOM} component={ChatRoomScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name={Routes.MARKETPLACE_DETAIL} component={MarketplaceDetailScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name={Routes.CREATE_LISTING} component={CreateListingScreen} options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name={Routes.EVENT_DETAIL} component={EventDetailScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name={Routes.AI_ASSISTANT} component={AiAssistantScreen} options={{ animation: 'slide_from_bottom' }} />
  </Stack.Navigator>
);

export default ResidentNavigator;
