import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import BilingualField from '../components/BilingualField';
import { toBilingual, isBilingualFilled } from '../utils/bilingual';

// Accommodation is an array of hotels, each with a non-translated `name`
// and a bilingual `description`. Editing it as two "Name — description"
// textareas (one per language) keeps the same simple line-per-hotel format
// admins already know, matching lines by position between the two columns.
function parseAccommodationText(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split('—');
      return { name: (name || '').trim(), description: rest.join('—').trim() };
    });
}

function accommodationToText(list, lang) {
  return list.map((h) => `${h.name} — ${(h.description && h.description[lang]) || ''}`).join('\n');
}

function buildAccommodation(enText, csText) {
  const enList = parseAccommodationText(enText);
  const csList = parseAccommodationText(csText);
  const count = Math.max(enList.length, csList.length);
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      name: (enList[i] && enList[i].name) || (csList[i] && csList[i].name) || '',
      description: { en: (enList[i] && enList[i].description) || '', cs: (csList[i] && csList[i].description) || '' },
    });
  }
  return result;
}

function parseLines(text) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

export default function ManageOrgInfoScreen() {
  const { hasAdminAccess, orgInfo, updateOrgInfo, t } = useApp();

  const [venueName, setVenueName] = useState(toBilingual(orgInfo.venue.name));
  const [venueAddress, setVenueAddress] = useState(orgInfo.venue.address);
  const [venueDescription, setVenueDescription] = useState(toBilingual(orgInfo.venue.description));
  const [directions, setDirections] = useState(toBilingual(orgInfo.directions));
  const [parking, setParking] = useState(toBilingual(orgInfo.parking));
  const [transportation, setTransportation] = useState(toBilingual(orgInfo.transportation));
  const [accommodationEn, setAccommodationEn] = useState(accommodationToText(orgInfo.accommodation, 'en'));
  const [accommodationCs, setAccommodationCs] = useState(accommodationToText(orgInfo.accommodation, 'cs'));
  const [contactName, setContactName] = useState(orgInfo.organizerContact.name);
  const [contactEmail, setContactEmail] = useState(orgInfo.organizerContact.email);
  const [contactPhone, setContactPhone] = useState(orgInfo.organizerContact.phone);
  const [catering, setCatering] = useState(toBilingual(orgInfo.catering));
  const [instructionsEn, setInstructionsEn] = useState((orgInfo.instructions.en || []).join('\n'));
  const [instructionsCs, setInstructionsCs] = useState((orgInfo.instructions.cs || []).join('\n'));
  const [additionalInfo, setAdditionalInfo] = useState(toBilingual(orgInfo.additionalInfo));

  const setBilingual = (setter) => (lang) => (value) => setter((f) => ({ ...f, [lang]: value }));

  const onSave = () => {
    if (
      !isBilingualFilled(venueName) ||
      !venueAddress.trim() ||
      !isBilingualFilled(venueDescription) ||
      !isBilingualFilled(directions) ||
      !isBilingualFilled(parking) ||
      !isBilingualFilled(transportation) ||
      !accommodationEn.trim() ||
      !accommodationCs.trim() ||
      !isBilingualFilled(catering) ||
      !instructionsEn.trim() ||
      !instructionsCs.trim() ||
      !isBilingualFilled(additionalInfo)
    ) {
      return Alert.alert(t('common.bothLanguagesRequired'));
    }

    updateOrgInfo({
      venue: { ...orgInfo.venue, name: venueName, address: venueAddress, description: venueDescription },
      directions,
      parking,
      transportation,
      accommodation: buildAccommodation(accommodationEn, accommodationCs),
      organizerContact: { name: contactName, email: contactEmail, phone: contactPhone },
      catering,
      instructions: { en: parseLines(instructionsEn), cs: parseLines(instructionsCs) },
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
      <BilingualField
        label={t('manageOrgInfo.venueName')}
        valueEn={venueName.en}
        valueCs={venueName.cs}
        onChangeEn={setBilingual(setVenueName)('en')}
        onChangeCs={setBilingual(setVenueName)('cs')}
      />

      <View style={{ marginBottom: 14 }}>
        <Text style={styles.label}>{t('manageOrgInfo.venueAddress')}</Text>
        <TextInput style={styles.input} value={venueAddress} onChangeText={setVenueAddress} />
      </View>

      <BilingualField
        label={t('manageOrgInfo.venueDescription')}
        valueEn={venueDescription.en}
        valueCs={venueDescription.cs}
        onChangeEn={setBilingual(setVenueDescription)('en')}
        onChangeCs={setBilingual(setVenueDescription)('cs')}
        multiline
      />
      <BilingualField
        label={t('manageOrgInfo.directions')}
        valueEn={directions.en}
        valueCs={directions.cs}
        onChangeEn={setBilingual(setDirections)('en')}
        onChangeCs={setBilingual(setDirections)('cs')}
        multiline
      />
      <BilingualField
        label={t('manageOrgInfo.parking')}
        valueEn={parking.en}
        valueCs={parking.cs}
        onChangeEn={setBilingual(setParking)('en')}
        onChangeCs={setBilingual(setParking)('cs')}
        multiline
      />
      <BilingualField
        label={t('manageOrgInfo.transportation')}
        valueEn={transportation.en}
        valueCs={transportation.cs}
        onChangeEn={setBilingual(setTransportation)('en')}
        onChangeCs={setBilingual(setTransportation)('cs')}
        multiline
      />
      <BilingualField
        label={t('manageOrgInfo.accommodation')}
        valueEn={accommodationEn}
        valueCs={accommodationCs}
        onChangeEn={setAccommodationEn}
        onChangeCs={setAccommodationCs}
        multiline
        tall
      />

      <View style={{ marginBottom: 14 }}>
        <Text style={styles.label}>{t('manageOrgInfo.contactName')}</Text>
        <TextInput style={styles.input} value={contactName} onChangeText={setContactName} />
      </View>
      <View style={{ marginBottom: 14 }}>
        <Text style={styles.label}>{t('manageOrgInfo.contactEmail')}</Text>
        <TextInput style={styles.input} value={contactEmail} onChangeText={setContactEmail} autoCapitalize="none" />
      </View>
      <View style={{ marginBottom: 14 }}>
        <Text style={styles.label}>{t('manageOrgInfo.contactPhone')}</Text>
        <TextInput style={styles.input} value={contactPhone} onChangeText={setContactPhone} />
      </View>

      <BilingualField
        label={t('manageOrgInfo.catering')}
        valueEn={catering.en}
        valueCs={catering.cs}
        onChangeEn={setBilingual(setCatering)('en')}
        onChangeCs={setBilingual(setCatering)('cs')}
        multiline
      />
      <BilingualField
        label={t('manageOrgInfo.instructions')}
        valueEn={instructionsEn}
        valueCs={instructionsCs}
        onChangeEn={setInstructionsEn}
        onChangeCs={setInstructionsCs}
        multiline
        tall
      />
      <BilingualField
        label={t('manageOrgInfo.additionalInfo')}
        valueEn={additionalInfo.en}
        valueCs={additionalInfo.cs}
        onChangeEn={setBilingual(setAdditionalInfo)('en')}
        onChangeCs={setBilingual(setAdditionalInfo)('cs')}
        multiline
      />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>{t('manageOrgInfo.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  restricted: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  restrictedText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  saveBtn: { backgroundColor: '#4D92CF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
