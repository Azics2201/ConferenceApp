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
  const { hasAdminAccess, orgInfo, updateOrgInfo, t } = useApp();

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
    Alert.alert(t('manageOrgInfo.savedTitle'), t('manageOrgInfo.savedBody'));
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>{t('manageOrgInfo.restricted')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Field label={t('manageOrgInfo.venueName')} value={venueName} onChangeText={setVenueName} />
      <Field label={t('manageOrgInfo.venueAddress')} value={venueAddress} onChangeText={setVenueAddress} />
      <Field label={t('manageOrgInfo.venueDescription')} value={venueDescription} onChangeText={setVenueDescription} multiline />
      <Field label={t('manageOrgInfo.directions')} value={directions} onChangeText={setDirections} multiline />
      <Field label={t('manageOrgInfo.parking')} value={parking} onChangeText={setParking} multiline />
      <Field label={t('manageOrgInfo.transportation')} value={transportation} onChangeText={setTransportation} multiline />
      <Field
        label={t('manageOrgInfo.accommodation')}
        value={accommodationText}
        onChangeText={setAccommodationText}
        multiline
      />
      <Field label={t('manageOrgInfo.contactName')} value={contactName} onChangeText={setContactName} />
      <Field label={t('manageOrgInfo.contactEmail')} value={contactEmail} onChangeText={setContactEmail} autoCapitalize="none" />
      <Field label={t('manageOrgInfo.contactPhone')} value={contactPhone} onChangeText={setContactPhone} />
      <Field label={t('manageOrgInfo.catering')} value={catering} onChangeText={setCatering} multiline />
      <Field label={t('manageOrgInfo.instructions')} value={instructionsText} onChangeText={setInstructionsText} multiline />
      <Field label={t('manageOrgInfo.additionalInfo')} value={additionalInfo} onChangeText={setAdditionalInfo} multiline />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>{t('manageOrgInfo.save')}</Text>
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
  saveBtn: { backgroundColor: '#4D92CF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
