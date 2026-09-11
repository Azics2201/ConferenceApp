import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { EVENT } from '../data/event';

const AIR_DEFENCE_LOGO = require('../../assets/department-of-air-defence-logo.png');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.eventName}>{EVENT.name}</Text>
          <Text style={styles.eventMeta}>{EVENT.dates} · {EVENT.location}</Text>
          <Text style={styles.tagline}>{EVENT.tagline}</Text>
        </View>

        <Image source={AIR_DEFENCE_LOGO} style={styles.sponsorLogo} resizeMode="contain" />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, alignItems: 'center', paddingTop: 100, paddingBottom: 50 },
  content: { width: '100%', maxWidth: 480, flexGrow: 1, justifyContent: 'space-between' },
  eventName: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center' },
  eventMeta: { fontSize: 13, color: '#6B7280', marginTop: 6, textAlign: 'center' },
  tagline: { fontSize: 14, color: '#374151', marginTop: 10, textAlign: 'center' },
  sponsorLogo: { width: '100%', aspectRatio: 839 / 285, alignSelf: 'center' },
  actions: { gap: 12 },
  primaryBtn: { backgroundColor: '#4D92CF', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: { backgroundColor: '#E4EFF8', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  secondaryBtnText: { color: '#4D92CF', fontWeight: '700', fontSize: 15 },
  adminBtn: { alignItems: 'center', paddingVertical: 10, marginTop: 8 },
  adminBtnText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});
