import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../i18n';

const ROW_HEIGHT = 38;
const MENU_HEIGHT = LANGUAGES.length * ROW_HEIGHT;
const ROLL_DURATION = 220;

// A small floating pill that unrolls into a language menu anchored at the
// same spot — no Modal, no full-screen overlay. The menu is just a sibling
// View below the button, animated from height 0 up to its full height with
// overflow:hidden, so it reads as rolling out of the button rather than a
// separate window appearing.
export default function LanguageButton() {
  const { language, setLanguage, t } = useApp();
  const insets = useSafeAreaInsets();
  const heightAnim = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const animateTo = (isOpen) => {
    Animated.timing(heightAnim, {
      toValue: isOpen ? MENU_HEIGHT : 0,
      duration: ROLL_DURATION,
      easing: isOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: false, // animating height, can't use the native driver
    }).start();
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    animateTo(next);
  };

  const selectLanguage = (code) => {
    setLanguage(code);
    setOpen(false);
    animateTo(false);
  };

  return (
    <View style={[styles.wrap, { top: insets.top + 8 }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={toggleOpen}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('languagePicker.button')}
        accessibilityState={{ expanded: open }}
      >
        <Text style={styles.flag}>{current.flag}</Text>
        <Text style={styles.code}>{current.code.toUpperCase()}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={12} color="#fff" style={styles.chevron} />
      </TouchableOpacity>

      <Animated.View style={[styles.menu, { height: heightAnim }]}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.row, lang.code === language && styles.rowActive]}
            onPress={() => selectLanguage(lang.code)}
          >
            <Text style={styles.rowFlag}>{lang.flag}</Text>
            <Text style={styles.rowLabel}>{lang.nativeName}</Text>
            {lang.code === language && <Ionicons name="checkmark" size={16} color="#fff" style={styles.check} />}
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 12, zIndex: 20, alignItems: 'flex-end' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.85)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  flag: { fontSize: 15, marginRight: 5 },
  code: { color: '#fff', fontWeight: '700', fontSize: 12 },
  chevron: { marginLeft: 4 },
  menu: {
    width: 150,
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(17,24,39,0.92)',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', height: ROW_HEIGHT, paddingHorizontal: 12 },
  rowActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  rowFlag: { fontSize: 16, marginRight: 10 },
  rowLabel: { color: '#fff', fontWeight: '600', fontSize: 13, flex: 1 },
  check: { marginLeft: 6 },
});
