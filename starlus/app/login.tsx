import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://192.168.123.54:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Login failed');
        setLoading(false);
        return;
      }
      const data = await response.json();
      await SecureStore.setItemAsync('token', data.token);
      router.push('/dashboard');
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[ '#ffb977', '#ff5fad', '#ff6a88' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        </View>
      </LinearGradient>
      <View style={styles.form}>
        <Text style={styles.hello}>Hello</Text>
        <Text style={styles.signInText}>Sign In to your account</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot your Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={loading}>
          <LinearGradient
            colors={[ '#ffb977', '#ff5fad' ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.signInButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.createAccountText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 220,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 18,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logo: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  form: {
    flex: 1,
    paddingHorizontal: 32,
    marginTop: -30,
  },
  hello: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    marginTop: 26,
  },
  signInText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#ff5fad',
    fontSize: 14,
  },
  signInButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  signInButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 24,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#888',
    fontSize: 15,
  },
  createAccountText: {
    color: '#ff5fad',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 