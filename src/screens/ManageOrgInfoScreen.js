import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useApp } from '../context/AppContext';

function accommodationToText(list) {
  return list.map((h) => `${h.name} — ${h.description}`).join('\n');
}

function textToAccommodation(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split('—');
      return { name: (name || '').trim(), description: rest.join('—').trim() };
    });
}

export default function ManageOrgInfoScreen() {
  const { hasAdminAccess, orgInfo, updateOrgInfo } = useApp();

  const [venueName, setVenueName] = useState(orgInfo.venue.name);
  const [venueAddress, setVenueAddress] = useState(orgInfo.venue.address);
  const [venueDescription, setVenueDescription] = useState(orgInfo.venue.description);
  const [directions, setDirections] = useState(orgInfo.directions);
  const [parking, setParking] = useState(orgInfo.parking);
  const [transportation, setTransportation] = useState(orgInfo.transportation);
  const [accommodationText, setAccommodationText] = useState(accommodationToText(orgInfo.accommodation));
  const [contactName, setContactName] = useState(orgInfo.organizerContact.name);
  const [contactEmail, setContactEmail] = useState(orgInfo.organizerContact.email);
  const [contactPhone, setContactPhone] = useState(orgInfo.organizerContact.phone);
  const [catering, setCatering] = useState(orgInfo.catering);
  const [instructionsText, setInstructionsText] = useState(orgInfo.instructions.join('\n'));
  const [additionalInfo, setAdditionalInfo] = useState(orgInfo.additionalInfo);

  const onSave = () => {
    updateOrgInfo({
      venue: { ...orgInfo.venue, name: venueName, address: venueAddress, description: venueDescription },
      directions,
      parking,
      transportation,
      accommodation: textToAccommodation(accommodationText),
      organizerContact: { name: contactName, email: contactEmail, phone: contactPhone },
      catering,
      instructions: instructionsText.split('\n').map((l) => l.trim()).filter(Boolean),
      additionalInfo,
    });
    Alert.alert('Saved', 'Organizational info updated. Participants will see the changes on the Info tab.');
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>Administrator access required.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Field label="Venue name" value={venueName} onChangeText={setVenueName} />
      <Field label="Venue address" value={venueAddress} onChangeText={setVenueAddress} />
      <Field label="Venue description" value={venueDescription} onChangeText={setVenueDescription} multiline />
      <Field label="Directions" value={directions} onChangeText={setDirections} multiline />
      <Field label="Parking" value={parking} onChangeText={setParking} multiline />
      <Field label="Public transportation" value={transportation} onChangeText={setTransportation} multiline />
      <Field
        label={'Accommodation (one per line: "Hotel name — description")'}
        value={accommodationText}
        onChangeText={setAccommodationText}
        multiline
      />
      <Field label="Organizer contact name" value={contactName} onChangeText={setContactName} />
      <Field label="Organizer contact email" value={contactEmail} onChangeText={setContactEmail} autoCapitalize="none" />
      <Field label="Organizer contact phone" value={contactPhone} onChangeText={setContactPhone} />
      <Field label="Catering" value={catering} onChangeText={setCatering} multiline />
      <Field label="Important instructions (one per line)" value={instructionsText} onChangeText={setInstructionsText} multiline />
      <Field label="Additional information" value={additionalInfo} onChangeText={setAdditionalInfo} multiline />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>Save changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, multiline, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.multiline]} multiline={multiline} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  restricted: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  restrictedText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
