// src/screens/AuthLoadingScreen.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
// import { useNavigation } from '@react-navigation/native'; // Will be used once navigation is set up

const AuthLoadingScreen = ({ navigation }) => { // Assuming navigation prop is passed by navigator
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          console.log('Token found, navigating to App');
          navigation.replace('StoreList'); // Changed from MainApp
        } else {
          console.log('No token, navigating to Login');
          navigation.replace('Login'); // Replace with actual navigation
        }
      } catch (error) {
        console.error('Error reading token', error);
        navigation.replace('Login'); // Fallback to Login on error
      }
    };
    checkToken();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthLoadingScreen;
