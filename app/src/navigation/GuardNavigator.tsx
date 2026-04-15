import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { GuardStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';

import GuardHomeScreen from '@screens/guard/GuardHomeScreen';
import VisitorLogScreen from '@screens/guard/VisitorLogScreen';
import VerifyOtpScreen from '@screens/guard/VerifyOtpScreen';

const Stack = createNativeStackNavigator<GuardStackParamList>();

const GuardNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name={Routes.GUARD_HOME} component={GuardHomeScreen} />
    <Stack.Screen name={Routes.VISITOR_LOG} component={VisitorLogScreen} />
    <Stack.Screen name={Routes.VERIFY_OTP} component={VerifyOtpScreen} />
  </Stack.Navigator>
);

export default GuardNavigator;
