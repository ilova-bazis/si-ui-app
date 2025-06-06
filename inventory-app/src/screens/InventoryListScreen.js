// src/screens/InventoryListScreen.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Button } from 'react-native';
import { getStoreInventory, getItemDetails } from '../services/api';
// import { useFocusEffect } from '@react-navigation/native'; // Can be used for refetching on focus

const InventoryListScreen = ({ route, navigation }) => {
  const { storeId, storeName } = route.params || {};

  const [rawInventory, setRawInventory] = useState([]);
  const [itemDetailsMap, setItemDetailsMap] = useState({}); // Stores details like name for each itemId
  const [combinedInventory, setCombinedInventory] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventoryAndDetails = useCallback(async () => {
    if (!storeId) {
      Alert.alert('Error', 'Store ID is missing. Cannot fetch inventory.');
      setIsLoading(false); // Ensure loading is stopped
      setIsRefreshing(false); // Ensure refreshing is stopped
      return;
    }

    // Determine if it's an initial load or a refresh to set the correct loading state
    if (!isRefreshing && combinedInventory.length === 0) {
        setIsLoading(true);
    }

    setCombinedInventory([]); // Clear previous combined data to avoid showing stale data during load

    try {
      const inventoryResponse = await getStoreInventory(storeId);
      const currentRawInventory = inventoryResponse.data.inventory || [];
      setRawInventory(currentRawInventory);

      const uniqueItemIds = [...new Set(currentRawInventory.map(item => item.itemId))];
      const newItemDetailsMap = { ...itemDetailsMap };

      // Using Promise.all for concurrent fetching of item details
      const itemDetailPromises = uniqueItemIds.map(itemId => {
        if (!newItemDetailsMap[itemId]) { // Fetch only if not already in map
          return getItemDetails(itemId)
            .then(response => ({ id: itemId, data: response.data.item }))
            .catch(itemError => {
              console.error(`Failed to fetch details for item ${itemId}:`, itemError.response ? itemError.response.data : itemError.message);
              return { id: itemId, error: true, name: `Unknown Item (${itemId})` }; // Store placeholder on error
            });
        }
        return Promise.resolve(null); // Already fetched or no need to fetch
      });

      const results = await Promise.all(itemDetailPromises.filter(p => p !== null)); // Filter out null promises

      results.forEach(result => {
        if (result) { // result will be null if already fetched
            if (result.error) {
                newItemDetailsMap[result.id] = { name: result.name, itemId: result.id, error: true };
            } else if (result.data) {
                newItemDetailsMap[result.id] = result.data;
            }
        }
      });
      setItemDetailsMap(newItemDetailsMap);

    } catch (error) {
      console.error('Failed to fetch inventory:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to fetch inventory. Please try again.');
      setRawInventory([]); // Clear raw inventory on error too
      setItemDetailsMap({}); // Clear item details map
    } finally {
      setIsLoading(false);
      if (isRefreshing) setIsRefreshing(false);
    }
  }, [storeId, isRefreshing, combinedInventory.length]); // itemDetailsMap removed to prevent potential loops, managed by promise logic

  useEffect(() => {
    // Fetch data when the screen is focused or storeId changes
    const unsubscribe = navigation.addListener('focus', () => {
        fetchInventoryAndDetails();
    });
    // Also fetch if storeId changes (e.g. if this screen could be kept mounted while store changes - less common)
    // fetchInventoryAndDetails(); // Called by focus listener initially

    return unsubscribe;
  }, [navigation, fetchInventoryAndDetails]);

  // Recalculate combined inventory when rawInventory or itemDetailsMap changes
  useEffect(() => {
    const newCombinedInventory = rawInventory.map(invItem => ({
      ...invItem, // storeId, itemId, quantity, reserved, threshold
      ...(itemDetailsMap[invItem.itemId] || { name: `Loading name for ${invItem.itemId}...`, itemId: invItem.itemId }), // Merge item details (name, etc.)
    }));
    setCombinedInventory(newCombinedInventory);
  }, [rawInventory, itemDetailsMap]);


  const handleRefresh = async () => {
    setIsRefreshing(true); // Set refreshing state before calling fetch
    await fetchInventoryAndDetails();
    // setIsRefreshing(false); // fetchInventoryAndDetails will set this in its finally block
  };

  const handleSelectItem = (item) => {
    navigation.navigate('ItemDetail', {
      itemId: item.itemId,
      storeId: storeId, // storeId is from route.params
      storeName: storeName, // storeName is from route.params
      itemName: item.name || `Item ${item.itemId}` // Pass the name if available
    });
  };

  const filteredInventory = useMemo(() => {
    if (!searchTerm) return combinedInventory;
    return combinedInventory.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combinedInventory, searchTerm]);

  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectItem(item)}>
      <Text style={styles.itemName}>{item.name || `Item ID: ${item.itemId}`}</Text>
      <Text>Quantity: {item.quantity !== undefined ? item.quantity : 'N/A'}</Text>
      <Text>Reserved: {item.reserved !== undefined ? item.reserved : 'N/A'}</Text>
      <Text>Threshold: {item.threshold !== undefined ? item.threshold : 'N/A'}</Text>
      {item.error && <Text style={{color: 'red'}}>Error loading details</Text>}
    </TouchableOpacity>
  );

  if (isLoading && combinedInventory.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading inventory for {storeName}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.storeTitle}>Store: {storeName}</Text>
        <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChangeText={setSearchTerm}
        />
      </View>
      <FlatList
        data={filteredInventory}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => `${item.storeId}-${item.itemId}`}
        contentContainerStyle={filteredInventory.length === 0 ? styles.emptyListContainer : {paddingBottom: 20}}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.centered}>
              <Text>No inventory items found for {storeName}.</Text>
              <Button title="Try Again" onPress={fetchInventoryAndDetails} color="#007AFF"/>
            </View>
          )
        }
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyListContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { paddingHorizontal: 10, paddingTop: 10 },
  storeTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  searchInput: {
    height: 40,
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 10, // Added horizontal margin
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});

export default InventoryListScreen;
