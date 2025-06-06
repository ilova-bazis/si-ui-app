// src/navigation/CatalogStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CatalogScreen from '../screens/CatalogScreen';
// Import ProductDetailScreen etc. later

const Stack = createStackNavigator();

const CatalogStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CatalogList" // Changed name for clarity, though screen is just CatalogScreen
        component={CatalogScreen}
        options={{ title: 'Product Catalog' }}
      />
      {/* <Stack.Screen name="ProductDetail" component={ProductDetailScreen} /> */}
    </Stack.Navigator>
  );
};
export default CatalogStackNavigator;
