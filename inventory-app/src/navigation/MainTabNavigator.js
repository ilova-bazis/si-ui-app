// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InventoryStackNavigator from './InventoryStackNavigator';
import CatalogStackNavigator from './CatalogStackNavigator';
import ScanStackNavigator from './ScanStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
// For icons, you would uncomment and install:
// import Ionicons from 'react-native-vector-icons/Ionicons'; // or '@expo/vector-icons/Ionicons' for Expo

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ route }) => {
  // storeId and storeName are passed when navigating to MainAppTabs (which renders this navigator)
  const { storeId, storeName } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // tabBarIcon: ({ focused, color, size }) => {
        //   let iconName;
        //   if (route.name === 'InventoryTab') {
        //     iconName = focused ? 'list-circle' : 'list-circle-outline';
        //   } else if (route.name === 'CatalogTab') {
        //     iconName = focused ? 'book' : 'book-outline';
        //   } else if (route.name === 'ScanTab') {
        //     iconName = focused ? 'scan-circle' : 'scan-circle-outline';
        //   } else if (route.name === 'SettingsTab') {
        //     iconName = focused ? 'settings' : 'settings-outline';
        //   }
        //   // You can return any component that you like here!
        //   return <Ionicons name={iconName} size={size} color={color} />;
        // },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Headers are managed by individual stack navigators within each tab
      })}
    >
      <Tab.Screen
        name="InventoryTab"
        component={InventoryStackNavigator}
        options={{ title: 'Inventory' }}
        // Pass storeId and storeName as initial params to the InventoryStackNavigator.
        // InventoryListScreen (initial screen of InventoryStackNavigator) will receive these.
        initialParams={{ storeId, storeName }}
      />
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStackNavigator}
        options={{ title: 'Catalog' }}
        initialParams={{ storeId, storeName }} // Also pass to Catalog stack if needed
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanStackNavigator}
        options={{ title: 'Scan' }}
        initialParams={{ storeId, storeName }} // Also pass to Scan stack if needed
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{ title: 'Settings' }}
        // Settings might not need storeId/storeName directly, but good for consistency or future use
        initialParams={{ storeId, storeName }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
