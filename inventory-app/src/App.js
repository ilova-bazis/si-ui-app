// src/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthLoadingScreen from './screens/AuthLoadingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import StoreListScreen from './screens/StoreListScreen';
import MainTabNavigator from './navigation/MainTabNavigator'; // <-- Import Tab Navigator

const AppStack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <AppStack.Navigator
        initialRouteName="AuthLoading"
        // screenOptions={{ headerShown: false }} // Can be applied globally if no screens need a header from this navigator
      >
        <AppStack.Screen
          name="AuthLoading"
          component={AuthLoadingScreen}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: 'Create Account' }} // Shows header for sign up
        />
        <AppStack.Screen
          name="StoreList"
          component={StoreListScreen}
          options={{ title: 'Select a Store' }} // Shows header for store list
        />
        <AppStack.Screen
          name="MainAppTabs" // This screen component is the entire Tab Navigator
          component={MainTabNavigator}
          // options={{ headerShown: false }} // Often false, as tabs manage their own headers or have none from root stack
          // Or, set a title for the whole tab section, perhaps based on store name
          options={({ route }) => ({
            title: route.params?.storeName || 'Store Dashboard',
            // You might want to hide the back button here if coming from StoreList
            // headerLeft: () => null,
          })}
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
}
