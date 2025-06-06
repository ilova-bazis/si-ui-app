// src/screens/AdjustInventoryScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import { adjustInventory } from '../services/api';

const AdjustInventoryScreen = ({ route, navigation }) => {
  const { itemId, storeId, itemName, currentQuantity } = route.params || {};

  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdjustInventory = async () => {
    Keyboard.dismiss(); // Dismiss keyboard

    const numDelta = parseInt(delta, 10);
    if (isNaN(numDelta) || numDelta === 0) {
      Alert.alert('Invalid Input', 'Delta must be a non-zero number (e.g., -5 or 10).');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Invalid Input', 'Reason for adjustment cannot be empty.');
      return;
    }
    // Optional: Check if adjustment makes quantity negative if that's not allowed
    // if ((currentQuantity + numDelta) < 0) {
    //   Alert.alert('Invalid Input', 'Adjustment would result in negative quantity.');
    //   return;
    // }

    setIsLoading(true);
    try {
      // API expects { delta: integer, reason: string }
      await adjustInventory(storeId, itemId, numDelta, reason.trim());
      Alert.alert(
        'Success',
        'Inventory adjusted successfully.',
        // After pressing OK, navigate back. ItemDetailScreen should then refetch.
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      // Clear form
      setDelta('');
      setReason('');
    } catch (error) {
      console.error('Failed to adjust inventory:', error.response ? error.response.data : error.message);
      Alert.alert('Adjustment Failed', error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Adjust Inventory</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.itemInfoLabel}>Item:</Text>
        <Text style={styles.itemInfoValue}>{itemName || `ID: ${itemId}`}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.itemInfoLabel}>Current Quantity:</Text>
        <Text style={styles.itemInfoValue}>{currentQuantity !== undefined ? currentQuantity : 'N/A'}</Text>
      </View>

      <Text style={styles.label}>Adjustment Quantity (Delta):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., -5 or 10"
        value={delta}
        onChangeText={setDelta}
        keyboardType="numeric"
        editable={!isLoading}
      />
      <Text style={styles.label}>Reason:</Text>
      <TextInput
        style={styles.input}
        placeholder="Reason for adjustment (e.g., stock count, damage)"
        value={reason}
        onChangeText={setReason}
        editable={!isLoading}
        multiline
        numberOfLines={3} // Suggests initial height for multiline
        textAlignVertical="top" // For Android multiline
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <View style={styles.buttonWrapper}>
            <Button title="Submit Adjustment" onPress={handleAdjustInventory} color="#007AFF" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333'
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemInfoLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
    marginRight: 5,
  },
  itemInfoValue: {
    fontSize: 16,
    color: '#555',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 15, // Add margin top for labels
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8, // More rounded
    paddingHorizontal: 12, // Adjust padding
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20, // More margin bottom
  },
  loader: {
    marginTop: 20,
  },
  buttonWrapper: {
    marginTop: 10, // Add some space above the button
  }
});

export default AdjustInventoryScreen;
