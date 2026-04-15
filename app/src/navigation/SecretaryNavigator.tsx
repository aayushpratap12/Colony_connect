import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SecretaryStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';

import SecretaryDashboardScreen from '@screens/secretary/SecretaryDashboardScreen';
import PostAnnouncementScreen from '@screens/secretary/PostAnnouncementScreen';
import ManageComplaintsScreen from '@screens/secretary/ManageComplaintsScreen';
import ManageResidentsScreen from '@screens/secretary/ManageResidentsScreen';
import CreateEventScreen from '@screens/secretary/CreateEventScreen';
import VisitorApprovalScreen from '@screens/resident/VisitorApprovalScreen';

const Stack = createNativeStackNavigator<SecretaryStackParamList>();

const SecretaryNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name={Routes.SECRETARY_DASHBOARD} component={SecretaryDashboardScreen} />
    <Stack.Screen name={Routes.POST_ANNOUNCEMENT} component={PostAnnouncementScreen} />
    <Stack.Screen name={Routes.MANAGE_COMPLAINTS} component={ManageComplaintsScreen} />
    <Stack.Screen name={Routes.MANAGE_RESIDENTS} component={ManageResidentsScreen} />
    <Stack.Screen name={Routes.CREATE_EVENT} component={CreateEventScreen} />
    <Stack.Screen name={Routes.VISITOR_APPROVAL} component={VisitorApprovalScreen} />
  </Stack.Navigator>
);

export default SecretaryNavigator;
