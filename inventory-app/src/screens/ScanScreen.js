// src/screens/ScanScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScanScreen = ({ route }) => {
  // Potentially receive storeId and storeName if needed for scan context
  // const { storeId, storeName } = route.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Barcode</Text>
      {/* {storeName && <Text>Store: {storeName}</Text>} */}
      {/* Camera view or barcode input will go here */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20 },
});
export default ScanScreen;
