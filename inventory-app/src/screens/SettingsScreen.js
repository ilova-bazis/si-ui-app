// src/screens/SettingsScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SettingsScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    // This will navigate to the AuthLoading screen in the root AppStack.
    // AuthLoadingScreen will then detect no token and navigate/replace with Login.
    navigation.navigate('AuthLoading');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Button title="Log Out" onPress={handleLogout} color="#FF3B30" />
      {/* User profile, app settings etc. will go here */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, marginBottom: 20 },
});
export default SettingsScreen;
