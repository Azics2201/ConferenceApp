import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import BilingualField from '../components/BilingualField';
import { toBilingual, isBilingualFilled } from '../utils/bilingual';

export default function ManageEventScreen() {
  const { hasAdminAccess, event, updateEvent, termsText, updateTermsText, t } = useApp();

  const [name, setName] = useState(event.name);
  const [dates, setDates] = useState(toBilingual(event.dates));
  const [location, setLocation] = useState(toBilingual(event.location));
  const [tagline, setTagline] = useState(toBilingual(event.tagline));
  const [terms, setTerms] = useState(toBilingual(termsText));

  const setBilingual = (setter) => (lang) => (value) => setter((f) => ({ ...f, [lang]: value }));

  const onSave = () => {
    if (
      !name.trim() ||
      !isBilingualFilled(dates) ||
      !isBilingualFilled(location) ||
      !isBilingualFilled(tagline) ||
      !isBilingualFilled(terms)
    ) {
      return Alert.alert(t('common.bothLanguagesRequired'));
    }
    updateEvent({ name, dates, location, tagline });
    updateTermsText(terms);
    Alert.alert(t('manageEvent.savedTitle'), t('manageEvent.savedBody'));
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>{t('manageEvent.restricted')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionLabel}>{t('manageEvent.detailsSection')}</Text>
      <View style={{ marginBottom: 14 }}>
        <Text style={styles.label}>{t('manageEvent.name')}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>

      <BilingualField
        label={t('manageEvent.dates')}
        valueEn={dates.en}
        valueCs={dates.cs}
        onChangeEn={setBilingual(setDates)('en')}
        onChangeCs={setBilingual(setDates)('cs')}
      />
      <BilingualField
        label={t('manageEvent.location')}
        valueEn={location.en}
        valueCs={location.cs}
        onChangeEn={setBilingual(setLocation)('en')}
        onChangeCs={setBilingual(setLocation)('cs')}
      />
      <BilingualField
        label={t('manageEvent.tagline')}
        valueEn={tagline.en}
        valueCs={tagline.cs}
        onChangeEn={setBilingual(setTagline)('en')}
        onChangeCs={setBilingual(setTagline)('cs')}
        multiline
      />

      <Text style={styles.sectionLabel}>{t('manageEvent.termsSection')}</Text>
      <BilingualField
        label={t('manageEvent.terms')}
        valueEn={terms.en}
        valueCs={terms.cs}
        onChangeEn={setBilingual(setTerms)('en')}
        onChangeCs={setBilingual(setTerms)('cs')}
        multiline
        tall
      />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>{t('manageEvent.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  restricted: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  restrictedText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  saveBtn: { backgroundColor: '#4D92CF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
