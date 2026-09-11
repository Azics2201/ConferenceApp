import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { MATERIALS } from '../data/materials';

export default function InfoScreen() {
  const { orgInfo } = useApp();
  const { venue, directions, parking, transportation, accommodation, organizerContact, catering, instructions, additionalInfo } = orgInfo;

  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${venue.latitude},${venue.longitude}&zoom=15&size=600x300&markers=${venue.latitude},${venue.longitude},red-pushpin`;

  const openInMaps = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Section title="Venue">
        <Text style={styles.venueName}>{venue.name}</Text>
        <Text style={styles.body}>{venue.address}</Text>
        <Text style={[styles.body, { marginTop: 6 }]}>{venue.description}</Text>
        <Image source={{ uri: staticMapUrl }} style={styles.map} resizeMode="cover" />
        <TouchableOpacity style={styles.linkRow} onPress={openInMaps}>
          <Ionicons name="navigate-outline" size={16} color="#4F46E5" />
          <Text style={styles.linkText}>Open in Maps</Text>
        </TouchableOpacity>
      </Section>

      <Section title="Directions">
        <Text style={styles.body}>{directions}</Text>
      </Section>

      <Section title="Parking">
        <Text style={styles.body}>{parking}</Text>
      </Section>

      <Section title="Public transportation">
        <Text style={styles.body}>{transportation}</Text>
      </Section>

      <Section title="Accommodation">
        {accommodation.map((hotel, i) => (
          <View key={i} style={styles.hotelRow}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <Text style={styles.body}>{hotel.description}</Text>
          </View>
        ))}
      </Section>

      <Section title="Organizer contact">
        <Text style={styles.body}>{organizerContact.name}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${organizerContact.email}`)}>
          <Text style={styles.linkText}>{organizerContact.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${organizerContact.phone}`)}>
          <Text style={styles.linkText}>{organizerContact.phone}</Text>
        </TouchableOpacity>
      </Section>

      <Section title="Catering">
        <Text style={styles.body}>{catering}</Text>
      </Section>

      <Section title="Important instructions">
        {instructions.map((line, i) => (
          <Text key={i} style={styles.bullet}>• {line}</Text>
        ))}
      </Section>

      <Section title="Additional information">
        <Text style={styles.body}>{additionalInfo}</Text>
      </Section>

      <Section title="Materials & documents">
        {MATERIALS.map((m) => (
          <TouchableOpacity key={m.id} style={styles.materialRow} onPress={() => Linking.openURL(m.url)}>
            <Ionicons name="document-text-outline" size={20} color="#4F46E5" />
            <Text style={styles.materialText}>{m.title}</Text>
          </TouchableOpacity>
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  section: { marginBottom: 22 },
  sectionHeader: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 8 },
  venueName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  body: { fontSize: 13, color: '#374151', lineHeight: 19 },
  map: { width: '100%', height: 180, borderRadius: 12, marginTop: 10, marginBottom: 10, backgroundColor: '#E5E7EB' },
  linkRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  linkText: { color: '#4F46E5', fontWeight: '600', fontSize: 13, marginLeft: 6 },
  hotelRow: { marginBottom: 10 },
  hotelName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  bullet: { fontSize: 13, color: '#374151', lineHeight: 20 },
  materialRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 8 },
  materialText: { marginLeft: 10, fontSize: 14, color: '#1F2937' },
});
