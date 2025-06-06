// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { loginUser } from '../services/api'; // Adjusted path

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      // Assuming API returns { accessToken: '...', refreshToken: '...' } in response.data
      const { accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken) {
        Alert.alert('Login Failed', 'Received invalid token response from server.');
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return;
      }

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      // Navigate to the main part of the app
      navigation.replace('StoreList'); // Changed from MainApp
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'An unexpected error occurred. Please try again.');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={isLoading}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, backgroundColor: '#fff' },
  link: { marginTop: 15, textAlign: 'center', color: 'blue' },
});

export default LoginScreen;
