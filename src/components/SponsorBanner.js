import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPONSORS } from '../data/sponsors';

const CYCLE_MS = 8000;

// `orientation="horizontal"` renders a slim bar (mobile, sits above the
// navigator so it never overlaps screen content). `orientation="vertical"`
// renders a sidebar strip (web, left/right of the main content column).
export default function SponsorBanner({ orientation = 'horizontal' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SPONSORS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const sponsor = SPONSORS[index];

  if (orientation === 'vertical') {
    return (
      <View style={styles.verticalBar}>
        <Text style={styles.verticalLabel}>Sponsored{'\n'}by</Text>
        <View style={[styles.badge, styles.verticalBadge, { backgroundColor: sponsor.color }]}>
          <Text style={styles.badgeText}>{sponsor.name}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.horizontalSafeArea}>
      <View style={styles.horizontalBar}>
        <Text style={styles.horizontalLabel}>Sponsored by</Text>
        <View style={[styles.badge, { backgroundColor: sponsor.color }]}>
          <Text style={styles.badgeText}>{sponsor.name}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  horizontalSafeArea: { backgroundColor: '#111827' },
  horizontalBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  horizontalLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  verticalBar: {
    width: 110,
    paddingTop: 28,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  verticalLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 14,
  },
  badge: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, minWidth: 84, alignItems: 'center' },
  verticalBadge: { width: 84 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12, textAlign: 'center' },
});
