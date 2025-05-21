import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { authFetch } from './utils/api';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

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
        const response = await authFetch('http://192.168.123.54:8000/api/profile/');
        if (!response.ok) {
          setError('Failed to load profile');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setProfile(data);
      } catch (e) {
        setError('Network error');
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={32} color="#222" />
        </TouchableOpacity>
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
      {/* Main Content */}
      <View style={styles.mainRow}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <TouchableOpacity style={styles.sidebarButton}>
            <Ionicons name="mic" size={22} color="#222" style={styles.sidebarIcon} />
            <Text style={styles.sidebarText}>Speech to text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarButton}>
            <FontAwesome5 name="pen-nib" size={20} color="#222" style={styles.sidebarIcon} />
            <Text style={styles.sidebarText}>Handwriting Recognition</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarButton}>
            <Ionicons name="language" size={22} color="#222" style={styles.sidebarIcon} />
            <Text style={styles.sidebarText}>Multilingual</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarButton}>
            <Ionicons name="document-text" size={22} color="#222" style={styles.sidebarIcon} />
            <Text style={styles.sidebarText}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarButton}>
            <Ionicons name="calculator" size={22} color="#222" style={styles.sidebarIcon} />
            <Text style={styles.sidebarText}>Calculator</Text>
          </TouchableOpacity>
        </View>
        {/* Main Panel */}
        <View style={styles.panel}>
          {/* Placeholder for main content */}
          {loading && <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />}
          {error ? <Text style={{ color: 'red', margin: 20 }}>{error}</Text> : null}
          {profile && (
            <View style={{ margin: 20 }}>
              <Text style={{ color: '#fff', fontSize: 18 }}>Welcome, {profile.name}!</Text>
              <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>Email: {profile.email}</Text>
            </View>
          )}
        </View>
      </View>
      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomIcon}><Ionicons name="pencil" size={22} color="#222" /></TouchableOpacity>
        <TouchableOpacity style={styles.bottomIcon}><Ionicons name="brush" size={22} color="#222" /></TouchableOpacity>
        <TouchableOpacity style={styles.bottomIcon}><Ionicons name="image" size={22} color="#222" /></TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.bottomNav}><Ionicons name="chevron-back" size={22} color="#222" /></TouchableOpacity>
        <TouchableOpacity style={styles.bottomNav}><Ionicons name="add" size={22} color="#222" /></TouchableOpacity>
        <TouchableOpacity style={styles.bottomNav}><Ionicons name="chevron-forward" size={22} color="#222" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeaf0',
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6ec1e4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuButton: {
    marginRight: 12,
  },
  greeting: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  profilePic: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 2,
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  sidebar: {
    width: 180,
    backgroundColor: '#3ea6c7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 10,
    justifyContent: 'flex-start',
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5ec6e4',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  sidebarIcon: {
    marginRight: 10,
  },
  sidebarText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  panel: {
    flex: 1,
    backgroundColor: '#1790a7',
    borderRadius: 18,
    marginLeft: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6ec1e4',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  bottomIcon: {
    marginRight: 10,
  },
  bottomNav: {
    marginLeft: 10,
    backgroundColor: '#5ec6e4',
    borderRadius: 6,
    padding: 4,
  },
}); 