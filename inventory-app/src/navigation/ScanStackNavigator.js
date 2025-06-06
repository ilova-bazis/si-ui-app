// src/navigation/ScanStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScanScreen from '../screens/ScanScreen';
// Import ScannedItemDetailScreen or AddNewItemFromScanScreen later

const Stack = createStackNavigator();

const ScanStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScanHome" // Changed name for clarity
        component={ScanScreen}
        options={{ title: 'Scan Barcode' }}
      />
      {/* <Stack.Screen name="ScannedItemDetail" component={ScannedItemDetailScreen} /> */}
      {/* <Stack.Screen name="AddNewItemFromScan" component={AddNewItemFromScanScreen} /> */}
    </Stack.Navigator>
  );
};
export default ScanStackNavigator;
