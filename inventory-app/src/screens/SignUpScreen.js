// src/screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { registerUser } from '../services/api'; // Adjusted path

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
    }
    // Basic password validation (e.g., minimum length)
    if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long.');
        return;
    }

    setIsLoading(true);
    try {
      // Assuming the API returns the user object or a success message upon successful registration
      // According to API spec, POST /v1/users returns 201 with user data (excluding password)
      // or 202 if email verification is pending.
      const response = await registerUser(name, email, password);
      console.log('Sign up successful:', response.data);

      let alertMessage = 'Your account has been created.';
      if (response.status === 202) { // Accepted for processing, e.g. email verification
        alertMessage = 'Account created successfully! Please check your email to verify your account before logging in.';
      } else {
        alertMessage = 'Account created successfully! You can now log in.';
      }

      Alert.alert(
        'Sign Up Successful',
        alertMessage,
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        // Using replace to prevent going back to signup.
        // Or navigate if you want the user to see the login form pre-filled or something.
      );
    } catch (error) {
      console.error('Sign up failed:', error.response ? error.response.data : error.message);
      Alert.alert('Sign Up Failed', error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} editable={!isLoading} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isLoading} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry editable={!isLoading} />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Sign Up" onPress={handleSignUp} />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
        <Text style={styles.link}>Already have an account? Log In</Text>
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

export default SignUpScreen;
