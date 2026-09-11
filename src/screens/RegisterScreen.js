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

const ROLES = ['Attendee', 'Speaker', 'Press', 'Organizer'];

export default function RegisterScreen({ navigation }) {
  const { registerAccount, sessions } = useApp();

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
      return Alert.alert('Missing info', 'Please enter your first and last name.');
    }
    if (!isValidEmail) {
      return Alert.alert('Missing info', 'Please enter a valid email address.');
    }
    if (password.length < 4) {
      return Alert.alert('Password too short', 'Please choose a password with at least 4 characters.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Passwords don\'t match', 'Please make sure both password fields match.');
    }
    if (!termsAccepted) {
      return Alert.alert('Terms required', 'Please review and accept the terms before continuing.');
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
      return Alert.alert('Could not register', result.error);
    }

    navigation.replace('RegistrationConfirmation', { account: result.account });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>First name *</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Jane" />

      <Text style={styles.label}>Last name *</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Doe" />

      <Text style={styles.label}>Organization / institution</Text>
      <TextInput style={styles.input} value={organization} onChangeText={setOrganization} placeholder="Company / University" />

      <Text style={styles.label}>Job title / position</Text>
      <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Product Manager" />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="jane@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone number</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+420 ..." keyboardType="phone-pad" />

      <Text style={styles.label}>Password *</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="At least 4 characters"
        secureTextEntry
      />

      <Text style={styles.label}>Confirm password *</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Re-enter your password"
        secureTextEntry
      />

      <Text style={styles.label}>Role</Text>
      <View style={styles.chipRow}>
        {ROLES.map((r) => (
          <TouchableOpacity key={r} style={[styles.chip, role === r && styles.chipActive]} onPress={() => setRole(r)}>
            <Text style={[styles.chipText, role === r && styles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Which sessions would you like to attend?</Text>
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

      <Text style={styles.label}>Additional information for the organizer</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={additionalInfo}
        onChangeText={setAdditionalInfo}
        placeholder="Anything else the organizers should know"
        multiline
      />

      <Text style={styles.label}>Special requests (dietary, accessibility, other)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={specialRequests}
        onChangeText={setSpecialRequests}
        placeholder="e.g. vegetarian meals, wheelchair access"
        multiline
      />

      <View style={styles.termsBox}>
        <CheckboxRow
          label="I have read and agree to the Terms of Participation and Personal Data Processing"
          checked={termsAccepted}
          onPress={() => setTermsAccepted((v) => !v)}
        />
        <TouchableOpacity onPress={() => setTermsModalVisible(true)}>
          <Text style={styles.readTerms}>Read the full terms</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, !termsAccepted && styles.submitBtnDisabled]}
        onPress={onSubmit}
        disabled={!termsAccepted}
      >
        <Text style={styles.submitText}>Complete registration</Text>
      </TouchableOpacity>

      <Modal visible={termsModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.termsText}>{TERMS_TEXT}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setTermsModalVisible(false)}>
            <Text style={styles.closeBtnText}>Close</Text>
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
  dayLabel: { fontSize: 13, fontWeight: '700', color: '#4F46E5', marginTop: 8, marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  multiline: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#4F46E5' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  termsBox: { marginTop: 24, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  readTerms: { color: '#4F46E5', fontSize: 13, fontWeight: '600', marginLeft: 32, marginTop: 2 },
  submitBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  submitBtnDisabled: { backgroundColor: '#C7D2FE' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  termsText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  closeBtn: { padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  closeBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 15 },
});
