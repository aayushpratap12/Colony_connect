import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import AuthNavigator from './AuthNavigator';
import ResidentNavigator from './ResidentNavigator';
import SecretaryNavigator from './SecretaryNavigator';
import GuardNavigator from './GuardNavigator';
import SplashScreen from '@screens/auth/SplashScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user?.role === 'secretary' ? (
          <Stack.Screen name="Secretary" component={SecretaryNavigator} />
        ) : user?.role === 'guard' ? (
          <Stack.Screen name="Guard" component={GuardNavigator} />
        ) : (
          <Stack.Screen name="Resident" component={ResidentNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
