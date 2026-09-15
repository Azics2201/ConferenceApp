import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const CYCLE_MS = 8000;

// `orientation="horizontal"` renders a slim bar (mobile, sits above the
// navigator so it never overlaps screen content). `orientation="vertical"`
// renders a sidebar strip (web, left/right of the main content column).
export default function SponsorBanner({ orientation = 'horizontal' }) {
  const { t, sponsors } = useApp();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (sponsors.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % sponsors.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [sponsors.length]);

  if (sponsors.length === 0) return null;
  const sponsor = sponsors[index % sponsors.length];
  const isVertical = orientation === 'vertical';

  if (isVertical) {
    return (
      <View style={styles.verticalBar}>
        <Text style={styles.verticalLabel}>{t('sponsorBanner.sponsoredBy')}</Text>
        <SponsorContent sponsor={sponsor} fillStyle={styles.verticalFill} badgeStyle={styles.verticalBadge} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.horizontalSafeArea}>
      <View style={styles.horizontalBar}>
        <Text style={styles.horizontalLabel}>{t('sponsorBanner.sponsoredBy')}</Text>
        <SponsorContent sponsor={sponsor} fillStyle={styles.horizontalFill} badgeStyle={styles.horizontalBadge} />
      </View>
    </SafeAreaView>
  );
}

// With an uploaded logo, this fills every bit of space the banner has left
// after its "Sponsored by" label — full width and full height of the
// sidebar strip on web, full height and remaining width of the top bar on
// mobile — not just a small fixed badge floating inside a mostly-empty
// banner. The sponsor's own color fills that same area behind the image
// (resizeMode="contain", so nothing gets cropped or stretched out of
// shape), which matters for logos with transparent backgrounds and reads
// as a proper sponsor takeover of the space rather than a logo pasted on
// top of the banner's own dark background. Sponsors without an image (the
// common case for the seed data) keep the original small colored badge
// with their name as text via a completely separate style — there's
// nothing to "fill the banner" with, and this avoids the flex/width rules
// meant for the image fill leaking into the plain-text badge.
function SponsorContent({ sponsor, fillStyle, badgeStyle }) {
  if (!sponsor.image) {
    return (
      <View style={[styles.badge, badgeStyle, { backgroundColor: sponsor.color }]}>
        <Text style={styles.badgeText}>{sponsor.name}</Text>
      </View>
    );
  }
  return (
    <View style={[fillStyle, { backgroundColor: sponsor.color }]}>
      <Image
        source={{ uri: sponsor.image }}
        style={styles.fillImage}
        resizeMode="contain"
        accessibilityLabel={sponsor.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalSafeArea: { backgroundColor: '#111827' },
  horizontalBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  horizontalLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  horizontalFill: {
    flex: 1,
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  horizontalBadge: { alignSelf: 'center' },
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
  verticalFill: {
    flex: 1,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  verticalBadge: { width: 84 },
  fillImage: { width: '100%', height: '100%' },
  badge: {
    height: 44,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12, textAlign: 'center' },
});
