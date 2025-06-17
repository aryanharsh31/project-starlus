import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Platform, 
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { register } from './utils/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await register(username, email, password);
      setSuccess('Registered successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            <Text style={styles.hello}>Register</Text>
            <Text style={styles.signInText}>Create a new account</Text>
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
              placeholder="john@gmail.com"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
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
            <TouchableOpacity style={styles.signInButton} onPress={handleRegister} disabled={loading}>
              <LinearGradient
                colors={[ '#ffb977', '#ff5fad' ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.signInButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signInButtonText}>REGISTER</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            {success ? (
              <Text style={styles.successText}>{success}</Text>
            ) : null}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.createAccountText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 300,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 24,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  form: {
    flex: 1,
    paddingHorizontal: 48,
    marginTop: -40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  hello: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    marginTop: 32,
  },
  signInText: {
    fontSize: 20,
    color: '#888',
    marginBottom: 32,
  },
  input: {
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  signInButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 32,
  },
  signInButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 30,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  successText: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#888',
    fontSize: 16,
  },
  createAccountText: {
    color: '#ff5fad',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 