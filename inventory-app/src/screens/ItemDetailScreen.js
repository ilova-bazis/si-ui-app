// src/screens/ItemDetailScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, Alert } from 'react-native';
import { getItemDetails, getInventoryItemDetails } from '../services/api';
import { useFocusEffect } from '@react-navigation/native'; // <-- Import useFocusEffect

const ItemDetailScreen = ({ route, navigation }) => {
  const { itemId, storeId, storeName } = route.params || {};

  const [itemData, setItemData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (isInitialCall = false) => {
    if (!itemId || !storeId) {
      if (isInitialCall) { // Only show alert and go back on initial load if params are missing
        Alert.alert("Error", "Item ID or Store ID is missing. Cannot load details.");
        navigation.goBack();
      }
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [itemDetailsRes, inventoryDetailsRes] = await Promise.all([
        getItemDetails(itemId),
        getInventoryItemDetails(storeId, itemId)
      ]);

      if (itemDetailsRes.data && itemDetailsRes.data.item) {
        setItemData(itemDetailsRes.data.item);
        // Set title when data is first loaded or if item name changes
        if (isInitialCall || (itemData && itemData.name !== itemDetailsRes.data.item.name)) {
            navigation.setOptions({ title: itemDetailsRes.data.item.name || `Item ${itemId}` });
        }
      } else {
        throw new Error("Item data not found in response.");
      }

      if (inventoryDetailsRes.data && inventoryDetailsRes.data.inventory) {
        setInventoryData(inventoryDetailsRes.data.inventory);
      } else {
        console.log(`No inventory record found for item ${itemId} in store ${storeId}. Setting defaults.`);
        setInventoryData({ quantity: 0, reserved: 0, threshold: 0, isNew: true });
      }

    } catch (error) {
      console.error("Failed to fetch item/inventory details:", error.response ? error.response.data : error.message);
      if (isInitialCall) { // Only show alert on initial load failures
          Alert.alert("Error", "Failed to load item details. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [itemId, storeId, navigation, itemData]); // itemData added to dep array for title update logic

  // Initial data fetch logic (if not relying solely on useFocusEffect for the very first load)
  // This useEffect will run once on mount.
  useEffect(() => {
    // Set initial title from params if available, before first fetch completes
    if (route.params?.itemName) {
        navigation.setOptions({ title: route.params.itemName });
    } else if (itemId) {
        navigation.setOptions({ title: `Item ${itemId}` });
    }
    fetchData(true); // true indicates it's the initial call from mount
  }, [itemId, storeId]); // Minimal dependencies for initial mount effect, fetchData will be called once.

  // Refetch data when the screen comes into focus (e.g., after navigating back from AdjustInventoryScreen)
  useFocusEffect(
    useCallback(() => {
      // We don't want to call fetchData(true) here as it might show "missing params" alert
      // if navigation somehow happened without params (unlikely for focus).
      // Also, title setting logic might be redundant if useEffect already did it.
      // The key is to refresh the data.
      // Only fetch if not the initial mount (which useEffect handles) to avoid double fetch.
      // However, if we want to ensure freshness on every focus, we call it.
      // The `itemData` check ensures it's not the very first load triggered by focus before useEffect.
      if (itemData) { // If itemData is already populated, means it's not the initial load by this effect.
          console.log('ItemDetailScreen focused, refetching data...');
          fetchData(false); // false indicates it's a subsequent call (refresh)
      }
      return () => {
        // Optional: cleanup if needed, e.g., cancelling network requests
      };
    }, [fetchData, itemData]) // fetchData and itemData are dependencies
  );

  if (isLoading && !itemData) { // Show loader only if itemData is not yet available (initial load)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading item details...</Text>
      </View>
    );
  }

  if (!itemData) {
    return (
      <View style={styles.centered}>
        <Text>Item details could not be loaded.</Text>
        <View style={styles.buttonContainer}>
            <Button title="Go Back" onPress={() => navigation.goBack()} color="#FF3B30"/>
        </View>
        <View style={styles.buttonContainer}>
            <Button title="Try Again" onPress={() => fetchData(true)} color="#007AFF"/>
        </View>
      </View>
    );
  }

  const currentInventoryData = inventoryData || { quantity: 0, reserved: 0, threshold: 0, isNew: true };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>{itemData.name || `Item ${itemData.itemId}`}</Text>
      <Text style={styles.storeContext}>Store: {storeName} (ID: {storeId})</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Information</Text>
        <Text style={styles.label}>Item ID:</Text><Text style={styles.value}>{itemData.itemId}</Text>
        <Text style={styles.label}>Description:</Text><Text style={styles.value}>{itemData.description || 'N/A'}</Text>
        <Text style={styles.label}>Category ID:</Text><Text style={styles.value}>{itemData.categoryId || 'N/A'}</Text>
        <Text style={styles.label}>Attributes:</Text><Text style={styles.value}>{itemData.attributes ? JSON.stringify(itemData.attributes) : 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory Details for {storeName}</Text>
        {currentInventoryData.isNew ? (
            <Text style={styles.value}>This item is not yet tracked in this store's inventory.</Text>
        ) : (
            <>
                <Text style={styles.label}>Quantity:</Text><Text style={styles.value}>{currentInventoryData.quantity}</Text>
                <Text style={styles.label}>Reserved:</Text><Text style={styles.value}>{currentInventoryData.reserved}</Text>
                <Text style={styles.label}>Threshold:</Text><Text style={styles.value}>{currentInventoryData.threshold}</Text>
                <Text style={styles.label}>Last Updated:</Text><Text style={styles.value}>{currentInventoryData.updatedAt ? new Date(currentInventoryData.updatedAt).toLocaleString() : 'N/A'}</Text>
            </>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Adjust Inventory"
          onPress={() => navigation.navigate('AdjustInventory', {
            itemId: itemData.itemId,
            storeId: storeId,
            itemName: itemData.name,
            currentQuantity: currentInventoryData.quantity
          })}
          color="#007AFF"
          disabled={isLoading} // Disable button while loading to prevent issues
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  contentContainer: { paddingBottom: 30 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 5, paddingHorizontal: 15, paddingTop: 20, color: '#222' },
  storeContext: { fontSize: 16, color: 'dimgray', marginBottom: 20, paddingHorizontal: 15 },
  section: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1, },
    shadowOpacity: 0.1,
    shadowRadius: 2.0,
    elevation: 2,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  label: { fontWeight: 'bold', marginTop: 8, color: '#444', fontSize: 15 },
  value: { marginBottom: 5, fontSize: 15, color: '#555' },
  buttonContainer: {
    marginVertical: 5,
    width: '80%',
  },
  actionsContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  }
});

export default ItemDetailScreen;
