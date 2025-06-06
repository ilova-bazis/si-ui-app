// src/navigation/SettingsStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
// Import UserProfileScreen, AppPreferencesScreen etc. later

const Stack = createStackNavigator();

const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsHome" // Changed name for clarity
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      {/* <Stack.Screen name="UserProfile" component={UserProfileScreen} /> */}
      {/* <Stack.Screen name="AppPreferences" component={AppPreferencesScreen} /> */}
    </Stack.Navigator>
  );
};
export default SettingsStackNavigator;
