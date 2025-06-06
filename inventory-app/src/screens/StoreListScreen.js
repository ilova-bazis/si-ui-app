// src/screens/StoreListScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Button } from 'react-native';
import { listStores } from '../services/api';
import * as SecureStore from 'expo-secure-store'; // Added for potential auth error handling

const StoreListScreen = ({ navigation }) => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Pagination state (optional for now, but good to keep in mind for future)
  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);

  const fetchStores = useCallback(async () => {
    // For pull-to-refresh, don't show the main loader if stores are already loaded
    if (!isRefreshing && stores.length === 0) {
        setIsLoading(true);
    }
    try {
      const response = await listStores(); // GET /v1/stores
      setStores(response.data.stores || []); // API doc might show { stores: [...] } or similar
      // Set pagination data if implementing:
      // if (response.data.metadata) {
      //   setCurrentPage(response.data.metadata.currentPage);
      //   setTotalPages(response.data.metadata.lastPage);
      // }
    } catch (error) {
      console.error('Failed to fetch stores:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to fetch stores. Please try again.');
      // Example: if GET /v1/stores required auth and token expired or was invalid
      if (error.response && error.response.status === 401) {
        console.log('Auth error fetching stores, logging out.');
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        navigation.replace('Login');
      }
    } finally {
      setIsLoading(false);
      if (isRefreshing) setIsRefreshing(false); // ensure refreshing indicator is turned off
    }
  }, [navigation, isRefreshing, stores.length]); // Added stores.length to dependencies

  useEffect(() => {
    // Fetch stores when the component mounts or when navigation focuses on it
    const unsubscribe = navigation.addListener('focus', () => {
        fetchStores();
    });
    return unsubscribe; // Cleanup listener on unmount
  }, [navigation, fetchStores]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStores(); // No need to set setIsLoading(true) here as fetchStores handles it if needed
    // setIsRefreshing(false); // fetchStores will handle this in its finally block
  };

  const handleSelectStore = (store) => {
    console.log('Selected store:', store);
    // Navigate to MainAppTabs, passing store details.
    // MainTabNavigator will receive these params and can pass them to its tabs.
    navigation.navigate('MainAppTabs', { storeId: store.storeId, storeName: store.name });
  };

  const renderStoreItem = ({ item }) => (
    <TouchableOpacity style={styles.storeItem} onPress={() => handleSelectStore(item)}>
      <Text style={styles.storeName}>{item.name}</Text>
      {item.address && <Text style={styles.storeAddress}>{item.address}</Text>}
    </TouchableOpacity>
  );

  if (isLoading && stores.length === 0) { // Only show full page loader on initial load
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff"/>
        <Text>Loading stores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.storeId.toString()} // Ensure key is a string
        contentContainerStyle={stores.length === 0 ? styles.emptyListContainer : null}
        ListEmptyComponent={
          !isLoading && ( // Only show if not loading
            <View style={styles.centered}>
              <Text>No stores found.</Text>
              <Button title="Try Again" onPress={fetchStores} color="#007AFF" />
            </View>
          )
        }
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
      {/* Button to create a new store (optional for MVP) */}
      {/* <Button title="+ New Store" onPress={() => navigation.navigate('CreateStore')} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyListContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  storeItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // for Android
  },
  storeName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  storeAddress: { fontSize: 14, color: 'gray', marginTop: 5 },
});

export default StoreListScreen;
