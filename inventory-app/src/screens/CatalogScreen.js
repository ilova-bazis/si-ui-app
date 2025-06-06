// src/screens/CatalogScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CatalogScreen = ({ route }) => {
  // Potentially receive storeId and storeName if needed for catalog context
  // const { storeId, storeName } = route.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalog</Text>
      {/* {storeName && <Text>Store: {storeName}</Text>} */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20 },
});
export default CatalogScreen;
