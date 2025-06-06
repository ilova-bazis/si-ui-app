// src/navigation/InventoryStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import InventoryListScreen from '../screens/InventoryListScreen';
// Import ItemDetailScreen, AdjustInventoryScreen, CreateItemScreen etc. later

const Stack = createStackNavigator();

const InventoryStackNavigator = ({ route }) => {
  // Params passed to this navigator component (e.g., from Tab.Screen initialParams)
  // are available in route.params. These can be passed down to screens.
  // const { storeId, storeName } = route.params || {}; // Not directly used here but available

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InventoryList"
        component={InventoryListScreen}
        options={{ title: 'Store Inventory' }}
        // Props like storeId are passed via initialParams from TabNavigator to InventoryListScreen's route.params
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={({ route }) => ({ title: route.params?.itemName || 'Item Details' })}
      />
      <Stack.Screen
        name="AdjustInventory"
        component={AdjustInventoryScreen}
        options={{ title: 'Adjust Inventory' }}
      />
      {/* Example of other screens in this stack:
      <Stack.Screen name="CreateItem" component={CreateItemScreen} />
      */}
    </Stack.Navigator>
  );
};
export default InventoryStackNavigator;
