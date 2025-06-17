import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getProfile } from './utils/api';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    router.replace('/login');
  };

  const handleCreateNote = () => {
    router.push('/notes');
  };

  const handleNotebooks = () => {
    router.push('/notebooks');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {loading ? 'Loading...' : error ? error : `Hey  ${profile?.name || 'Student'}`}
        </Text>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: profile?.avatar || 'https://randomuser.me/api/portraits/women/44.jpg' }}
            style={styles.profilePic}
          />
          <MaterialIcons name="arrow-drop-down" size={28} color="#222" />
          <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 10, backgroundColor: '#ff5fad', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Notes Button */}
      <TouchableOpacity 
        style={styles.createNoteButton}
        onPress={handleCreateNote}
      >
        <Ionicons name="create-outline" size={24} color="#fff" style={styles.createNoteIcon} />
        <Text style={styles.createNoteText}>Create Notes</Text>
      </TouchableOpacity>

      {/* Notebooks Button */}
      <TouchableOpacity 
        style={[styles.createNoteButton, { marginTop: 12 }]}
        onPress={handleNotebooks}
      >
        <Ionicons name="book-outline" size={24} color="#fff" style={styles.createNoteIcon} />
        <Text style={styles.createNoteText}>Notebooks</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {loading && <ActivityIndicator color="#6ec1e4" style={{ marginTop: 20 }} />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {profile && (
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome, {profile.name}!</Text>
            <Text style={styles.emailText}>Email: {profile.email}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeaf0',
    paddingTop: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6ec1e4',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  greeting: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: '#222',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 4,
  },
  createNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6ec1e4',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createNoteIcon: {
    marginRight: 12,
  },
  createNoteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  welcomeText: {
    color: '#222',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 16,
  },
  emailText: {
    color: '#666',
    fontSize: 18,
  },
  errorText: {
    color: '#ff5fad',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
}); 