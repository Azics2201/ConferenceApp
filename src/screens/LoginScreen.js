import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const { login, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError(t('login.missingFields'));
      return;
    }
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
    }
    // On success, the root navigator swaps to the main app automatically.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('login.email')}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t('login.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>{t('login.password')}</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder={t('login.passwordPlaceholder')}
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{t('login.submit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
        <Text style={styles.registerLinkText}>{t('login.noAccount')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 32 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  error: { color: '#DC2626', fontSize: 13, marginTop: 10 },
  submitBtn: { backgroundColor: '#4D92CF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  registerLink: { alignItems: 'center', marginTop: 20 },
  registerLinkText: { color: '#4D92CF', fontSize: 13, fontWeight: '600' },
});
