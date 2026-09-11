import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Encodes just enough to be useful at a check-in desk without a backend
// lookup: id, name, organization, and role. Real deployments would likely
// encode only the participantId and look the rest up server-side.
export function buildBadgePayload(registration) {
  return JSON.stringify({
    id: registration.participantId,
    name: `${registration.firstName} ${registration.lastName}`,
    org: registration.organization || '',
    role: registration.role || '',
  });
}

export default function QRCodeBadge({ registration, size = 200 }) {
  const value = buildBadgePayload(registration);
  return (
    <View style={styles.wrap}>
      <View style={styles.qrCard}>
        <QRCode value={value} size={size} />
      </View>
      <Text style={styles.idText}>{registration.participantId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  qrCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2 },
  idText: { marginTop: 10, fontSize: 12, color: '#6B7280', letterSpacing: 0.5 },
});
