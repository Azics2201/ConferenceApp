import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { EVENT } from '../data/event';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.eventName}>{EVENT.name}</Text>
        <Text style={styles.eventMeta}>{EVENT.dates} · {EVENT.location}</Text>
        <Text style={styles.tagline}>{EVENT.tagline}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.primaryBtnText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryBtnText}>Log in</Text>
        </TouchableOpacity>

        {Platform.OS === 'web' && (
          <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('AdminLogin')}>
            <Text style={styles.adminBtnText}>Administrator login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'space-between', paddingTop: 100, paddingBottom: 50 },
  eventName: { fontSize: 26, fontWeight: '800', color: '#111827' },
  eventMeta: { fontSize: 13, color: '#6B7280', marginTop: 6 },
  tagline: { fontSize: 14, color: '#374151', marginTop: 10 },
  actions: { gap: 12 },
  primaryBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: { backgroundColor: '#EEF2FF', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  secondaryBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 15 },
  adminBtn: { alignItems: 'center', paddingVertical: 10, marginTop: 8 },
  adminBtnText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});
