import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export default function AdminLoginScreen() {
  const { loginAdmin } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter a username and password.');
      return;
    }
    setSubmitting(true);
    const result = await loginAdmin(username, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
    }
    // On success, the root navigator swaps to the main app automatically.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.submitText}>Log in as administrator</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>For testing: username "admin", password "admin".</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 32 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  error: { color: '#DC2626', fontSize: 13, marginTop: 10 },
  submitBtn: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint: { color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 16 },
});
