import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { TERMS_TEXT } from '../data/terms';
import CheckboxRow from '../components/CheckboxRow';

const ROLES = ['Attendee', 'Press'];

export default function RegisterScreen({ navigation }) {
  const { registerAccount, sessions, t } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Attendee');
  const [sessionIds, setSessionIds] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const sessionsByDay = useMemo(() => {
    const days = [...new Set(sessions.map((s) => s.day))];
    return days.map((day) => ({ day, items: sessions.filter((s) => s.day === day) }));
  }, [sessions]);

  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  const toggleSession = (id) => {
    setSessionIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const onSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      return Alert.alert(t('register.missingNameTitle'), t('register.missingName'));
    }
    if (!isValidEmail) {
      return Alert.alert(t('register.missingNameTitle'), t('register.invalidEmail'));
    }
    if (password.length < 4) {
      return Alert.alert(t('register.passwordTooShortTitle'), t('register.passwordTooShort'));
    }
    if (password !== confirmPassword) {
      return Alert.alert(t('register.passwordMismatchTitle'), t('register.passwordMismatch'));
    }
    if (!termsAccepted) {
      return Alert.alert(t('register.termsRequiredTitle'), t('register.termsRequired'));
    }

    const result = await registerAccount({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      organization: organization.trim(),
      jobTitle: jobTitle.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      role,
      sessionIds,
      additionalInfo: additionalInfo.trim(),
      specialRequests: specialRequests.trim(),
      termsAcceptedAt: new Date().toISOString(),
    });

    if (!result.success) {
      return Alert.alert(t('register.couldNotRegisterTitle'), result.error);
    }

    navigation.replace('RegistrationConfirmation', { account: result.account });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>{t('register.firstName')}</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder={t('register.firstNamePlaceholder')} />

      <Text style={styles.label}>{t('register.lastName')}</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder={t('register.lastNamePlaceholder')} />

      <Text style={styles.label}>{t('register.organization')}</Text>
      <TextInput style={styles.input} value={organization} onChangeText={setOrganization} placeholder={t('register.organizationPlaceholder')} />

      <Text style={styles.label}>{t('register.jobTitle')}</Text>
      <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} placeholder={t('register.jobTitlePlaceholder')} />

      <Text style={styles.label}>{t('register.email')}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t('register.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>{t('register.phone')}</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder={t('register.phonePlaceholder')} keyboardType="phone-pad" />

      <Text style={styles.label}>{t('register.password')}</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder={t('register.passwordPlaceholder')}
        secureTextEntry
      />

      <Text style={styles.label}>{t('register.confirmPassword')}</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder={t('register.confirmPasswordPlaceholder')}
        secureTextEntry
      />

      <Text style={styles.label}>{t('register.role')}</Text>
      <View style={styles.chipRow}>
        {ROLES.map((r) => (
          <TouchableOpacity key={r} style={[styles.chip, role === r && styles.chipActive]} onPress={() => setRole(r)}>
            <Text style={[styles.chipText, role === r && styles.chipTextActive]}>{t(`roles.${r}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{t('register.sessionsQuestion')}</Text>
      {sessionsByDay.map((group) => (
        <View key={group.day} style={{ marginBottom: 8 }}>
          <Text style={styles.dayLabel}>{group.day}</Text>
          {group.items.map((s) => (
            <CheckboxRow
              key={s.id}
              label={`${s.startTime} · ${s.title}`}
              checked={sessionIds.includes(s.id)}
              onPress={() => toggleSession(s.id)}
            />
          ))}
        </View>
      ))}

      <Text style={styles.label}>{t('register.additionalInfo')}</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={additionalInfo}
        onChangeText={setAdditionalInfo}
        placeholder={t('register.additionalInfoPlaceholder')}
        multiline
      />

      <Text style={styles.label}>{t('register.specialRequests')}</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={specialRequests}
        onChangeText={setSpecialRequests}
        placeholder={t('register.specialRequestsPlaceholder')}
        multiline
      />

      <View style={styles.termsBox}>
        <CheckboxRow
          label={t('register.termsAgree')}
          checked={termsAccepted}
          onPress={() => setTermsAccepted((v) => !v)}
        />
        <TouchableOpacity onPress={() => setTermsModalVisible(true)}>
          <Text style={styles.readTerms}>{t('register.readTerms')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, !termsAccepted && styles.submitBtnDisabled]}
        onPress={onSubmit}
        disabled={!termsAccepted}
      >
        <Text style={styles.submitText}>{t('register.submit')}</Text>
      </TouchableOpacity>

      <Modal visible={termsModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.termsText}>{TERMS_TEXT}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setTermsModalVisible(false)}>
            <Text style={styles.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 22, marginBottom: 8 },
  dayLabel: { fontSize: 13, fontWeight: '700', color: '#4D92CF', marginTop: 8, marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  multiline: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#4D92CF' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  termsBox: { marginTop: 24, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  readTerms: { color: '#4D92CF', fontSize: 13, fontWeight: '600', marginLeft: 32, marginTop: 2 },
  submitBtn: { backgroundColor: '#4D92CF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  submitBtnDisabled: { backgroundColor: '#AFCEE9' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  termsText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  closeBtn: { padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  closeBtnText: { color: '#4D92CF', fontWeight: '700', fontSize: 15 },
});
