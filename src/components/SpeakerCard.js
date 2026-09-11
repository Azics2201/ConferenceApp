import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function SpeakerCard({ speaker, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: speaker.photo }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{speaker.name}</Text>
        <Text style={styles.title} numberOfLines={2}>{speaker.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12, backgroundColor: '#E5E7EB' },
  name: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  title: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
