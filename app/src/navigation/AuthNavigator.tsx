import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@typings/navigation.types';
import { Routes } from '@constants/routes';

// Placeholder screens — will be replaced with real screens
import OnboardingScreen from '@screens/auth/OnboardingScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import OtpVerifyScreen from '@screens/auth/OtpVerifyScreen';
import ColonySelectScreen from '@screens/auth/ColonySelectScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name={Routes.ONBOARDING} component={OnboardingScreen} />
    <Stack.Screen name={Routes.LOGIN} component={LoginScreen} />
    <Stack.Screen name={Routes.OTP_VERIFY} component={OtpVerifyScreen} />
    <Stack.Screen name={Routes.COLONY_SELECT} component={ColonySelectScreen} />
    <Stack.Screen name={Routes.REGISTER} component={RegisterScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
