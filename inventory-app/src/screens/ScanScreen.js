// src/screens/ScanScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Alert, Linking, Platform, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getItemByBarcode } from '../services/api';
// import { useStoreContext } from '../store/StoreContext'; // Example for getting storeId (Actual implementation needed)

const ScanScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to re-initialize scanner when screen is focused

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(Camera.Constants.FlashMode.off);

  // FIXME: Replace with actual store context logic (e.g., React Context, Zustand, Redux)
  // This is a placeholder. In a real app, currentStore should come from a shared state.
  const [currentStore, setCurrentStore] = useState({ storeId: 'store123', name: 'Default Store (FIXME)' });
  // useEffect(() => {
  //   // Placeholder: If using a global store, you might subscribe to changes here or use a selector.
  //   // For now, we'll use the hardcoded store. A real app might prompt for store selection
  //   // if currentStore.storeId is null/undefined.
  //   // const store = getStoreFromGlobalState(); // Replace with actual logic
  //   // if (store) setCurrentStore(store);
  // }, []);


  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    requestCameraPermission();
  }, []);

  // When screen comes into focus, reset 'scanned' state to allow new scans
  useEffect(() => {
    if (isFocused) {
      setScanned(false);
    }
  }, [isFocused]);

  const handleBarCodeScanned = async ({ type, data: barcode }) => {
    setScanned(true); // Prevent multiple scans immediately

    console.log(`Barcode Scanned! Type: ${type}, Data: ${barcode}`);

    if (!currentStore || !currentStore.storeId) {
      Alert.alert(
        "Store Not Selected",
        "Please select a store context before scanning items. You can typically select a store from the 'Inventory' or 'Settings' tab.",
        [{ text: 'OK', onPress: () => setScanned(false) }] // Allow scanning again or navigate
      );
      return;
    }

    Alert.alert( // Give immediate feedback about the scan itself
        'Barcode Detected',
        `${barcode}\n\nSearching for item...`,
        [{text: 'OK'}] // This alert is mostly informational
    );

    try {
      const response = await getItemByBarcode(barcode);
      if (response.data && response.data.item) {
        const item = response.data.item;
        Alert.alert('Item Found', `Name: ${item.name}`, [
          { text: 'Scan Another', onPress: () => setScanned(false), style: 'cancel' },
          {
            text: 'View Details',
            onPress: () => {
              setScanned(false); // Reset before navigating
              navigation.navigate('InventoryTab', {
                screen: 'ItemDetail',
                params: {
                  itemId: item.itemId,
                  storeId: currentStore.storeId,
                  storeName: currentStore.name,
                  itemName: item.name
                },
                // Merge true ensures that if InventoryTab is already active, it uses its current stack
                // and pushes ItemDetail. If another tab is active, it switches to InventoryTab first.
                // merge: true, // Default behavior is usually fine.
              });
            }
          },
        ]);
      } else {
        // This case might not be hit if API throws 404, which is caught below.
        // But if API returns 200 with no item, handle here.
        Alert.alert(
            'Item Not Found',
            `No item found with barcode: ${barcode}. Would you like to create a new item?`,
            [
              { text: 'Scan Another', onPress: () => setScanned(false), style: 'cancel' },
              {
                text: 'Create New Item',
                onPress: () => {
                  setScanned(false); // Reset before navigating
                  navigation.navigate('CatalogTab', {
                    screen: 'CreateItem', // Placeholder for CreateItemScreen
                    params: { barcodeScanned: barcode }
                  });
                }
              },
            ]
          );
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Alert.alert(
          'Item Not Found',
          `No item found with barcode: ${barcode}. Would you like to create a new item?`,
          [
            { text: 'Scan Another', onPress: () => setScanned(false), style: 'cancel' },
            {
              text: 'Create New Item',
              onPress: () => {
                setScanned(false); // Reset before navigating
                navigation.navigate('CatalogTab', {
                  screen: 'CreateItem', // Placeholder for CreateItemScreen
                  params: { barcodeScanned: barcode }
                });
              }
            },
          ]
        );
      } else {
        console.error('Error fetching item by barcode:', error.response ? error.response.data : error.message);
        Alert.alert('Error', 'Could not fetch item details. Please try again.');
        setScanned(false); // Allow scanning again
      }
    }
  };

  const toggleTorch = () => {
    setTorchOn(current => current === Camera.Constants.FlashMode.off ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off);
  };

  if (hasPermission === null) {
    return <View style={styles.centered}><ActivityIndicator size="large"/><Text style={{marginTop:10}}>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return (
        <View style={styles.centered}>
            <Text style={styles.permissionText}>No access to camera. Please grant permission in your phone settings to use the scanner.</Text>
            <Button title="Open Settings" onPress={() => Linking.openSettings()} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused ? (
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          flashMode={torchOn}
          barCodeScannerSettings={{
            barCodeTypes: [
              BarCodeScanner.Constants.BarCodeType.ean13,
              BarCodeScanner.Constants.BarCodeType.ean8,
              BarCodeScanner.Constants.BarCodeType.upc_a,
              BarCodeScanner.Constants.BarCodeType.upc_e,
              BarCodeScanner.Constants.BarCodeType.qr,
              BarCodeScanner.Constants.BarCodeType.code128, // Common for inventory/logistics
              BarCodeScanner.Constants.BarCodeType.code39,  // Common for inventory/logistics
              BarCodeScanner.Constants.BarCodeType.datamatrix, // For smaller items
            ],
          }}
        />
      ) : (
        // Optionally, show a placeholder if not focused, though usually not needed
        // as the component might unmount or be hidden by navigator.
        <View style={styles.centered}><Text>Camera is paused when not focused.</Text></View>
      )}
      <View style={styles.overlay}>
        <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleTorch}>
                <Text style={styles.controlButtonText}>{torchOn ? "Flash Off" : "Flash On"}</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.bottomControls}>
            {scanned && (
                <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
                    <Text style={styles.controlButtonText}>Tap to Scan Again</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  permissionText: { textAlign: 'center', marginBottom: 15, fontSize: 16, lineHeight: 22 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 30 : 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Position torch button to the right
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 20 : 0, // Safe area for iOS notch
  },
  bottomControls: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20, // Space from bottom
  },
  controlButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanAgainButton: { // Similar to controlButton but could be styled differently
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  }
});

export default ScanScreen;
