import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import CheckboxRow from './CheckboxRow';

const ROLES = ['Attendee', 'Speaker', 'Press', 'Organizer'];

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  jobTitle: '',
  phone: '',
  role: 'Attendee',
  password: '',
  isSubAdmin: false,
  sessionIds: [],
  additionalInfo: '',
  specialRequests: '',
};

export default function ParticipantEditorModal({ visible, initialAccount, sessions, error, onCancel, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const isEditing = !!initialAccount;

  useEffect(() => {
    if (visible) {
      setForm(
        initialAccount
          ? { ...emptyForm, ...initialAccount, password: '' } // never pre-fill password
          : emptyForm
      );
    }
  }, [visible, initialAccount]);

  const sessionsByDay = useMemo(() => {
    const days = [...new Set(sessions.map((s) => s.day))];
    return days.map((day) => ({ day, items: sessions.filter((s) => s.day === day) }));
  }, [sessions]);

  const setField = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleSession = (id) => {
    setForm((f) => ({
      ...f,
      sessionIds: f.sessionIds.includes(id) ? f.sessionIds.filter((s) => s !== id) : [...f.sessionIds, id],
    }));
  };

  const isValidEmail = /\S+@\S+\.\S+/.test(form.email);

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !isValidEmail) return;
    if (!isEditing && form.password.length < 4) return; // new accounts need a real password
    if (form.password && form.password.length < 4) return; // if resetting, still enforce minimum

    const payload = { ...form, email: form.email.trim() };
    if (!payload.password) delete payload.password; // don't overwrite with blank on edit
    onSave(payload);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView>
            <Text style={styles.title}>{isEditing ? 'Edit participant' : 'Add person'}</Text>

            <Text style={styles.label}>First name *</Text>
            <TextInput style={styles.input} value={form.firstName} onChangeText={setField('firstName')} />

            <Text style={styles.label}>Last name *</Text>
            <TextInput style={styles.input} value={form.lastName} onChangeText={setField('lastName')} />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={setField('email')}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Organization</Text>
            <TextInput style={styles.input} value={form.organization} onChangeText={setField('organization')} />

            <Text style={styles.label}>Job title / position</Text>
            <TextInput style={styles.input} value={form.jobTitle} onChangeText={setField('jobTitle')} />

            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={form.phone} onChangeText={setField('phone')} keyboardType="phone-pad" />

            <Text style={styles.label}>{isEditing ? 'New password (leave blank to keep current)' : 'Password *'}</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={setField('password')}
              secureTextEntry
              placeholder={isEditing ? 'Leave blank to keep current password' : 'At least 4 characters'}
            />

            <Text style={styles.label}>Role</Text>
            <View style={styles.chipRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, form.role === r && styles.chipActive]}
                  onPress={() => setField('role')(r)}
                >
                  <Text style={[styles.chipText, form.role === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <CheckboxRow
              label="Grant administrator access (sub-admin)"
              checked={form.isSubAdmin}
              onPress={() => setField('isSubAdmin')(!form.isSubAdmin)}
              style={{ marginTop: 6, marginBottom: 6 }}
            />
            <Text style={styles.hint}>
              Sub-admins get the same Admin tab access as the main administrator login (web only), using their own
              email and password instead of the shared admin/admin login.
            </Text>

            <Text style={styles.sectionLabel}>Sessions</Text>
            {sessionsByDay.map((group) => (
              <View key={group.day} style={{ marginBottom: 8 }}>
                <Text style={styles.dayLabel}>{group.day}</Text>
                {group.items.map((s) => (
                  <CheckboxRow
                    key={s.id}
                    label={`${s.startTime} · ${s.title}`}
                    checked={form.sessionIds.includes(s.id)}
                    onPress={() => toggleSession(s.id)}
                  />
                ))}
              </View>
            ))}

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.actions}>
              <TouchableOpacity onPress={onCancel}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.save}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '90%' },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 10, marginBottom: 6 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 6 },
  dayLabel: { fontSize: 13, fontWeight: '700', color: '#4F46E5', marginTop: 8, marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#4F46E5' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  hint: { fontSize: 11, color: '#9CA3AF', lineHeight: 15, marginBottom: 6 },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingBottom: 10 },
  cancel: { color: '#6B7280', fontWeight: '600', marginRight: 20 },
  save: { color: '#4F46E5', fontWeight: '700' },
});
