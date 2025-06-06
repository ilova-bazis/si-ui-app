// src/screens/PlaceholderMainScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const PlaceholderMainScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    navigation.replace('Login'); // Navigate back to Login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Application Area</Text>
      <Text>You are logged in!</Text>
      <Button title="Log Out (Test)" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
});

export default PlaceholderMainScreen;
