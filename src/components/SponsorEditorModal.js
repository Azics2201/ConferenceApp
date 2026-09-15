import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useApp } from '../context/AppContext';
import { averageColorFromImage } from '../utils/imageColor';

const emptyForm = { name: '', color: '#4D92CF', image: null };
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

// Sponsor logos are resized down to this width (aspect ratio preserved)
// before being stored as a base64 PNG — plenty sharp for the ~84px banner
// badge at any device pixel density, while keeping AsyncStorage entries
// small. PNG (not JPEG) keeps transparency, so a logo with no background
// still sits naturally on the badge's own color behind it.
const TARGET_WIDTH = 240;

export default function SponsorEditorModal({ visible, initialSponsor, onCancel, onSave }) {
  const { t } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(initialSponsor ? { ...emptyForm, ...initialSponsor } : emptyForm);
      setPicking(false);
    }
  }, [visible, initialSponsor]);

  const setField = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const isValidColor = HEX_COLOR.test(form.color);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('sponsorEditor.permissionTitle'), t('sponsorEditor.permissionBody'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setPicking(true);
    try {
      const resized = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: TARGET_WIDTH } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.PNG, base64: true }
      );
      const dataUri = `data:image/png;base64,${resized.base64}`;
      setForm((f) => ({ ...f, image: dataUri }));

      // Web only — see utils/imageColor.js for why this can't run on the
      // native app. Still just a starting point: the color field underneath
      // stays editable either way, on every platform.
      const detected = await averageColorFromImage(dataUri);
      if (detected) setForm((f) => ({ ...f, color: detected }));
    } catch (e) {
      Alert.alert(t('sponsorEditor.imageErrorTitle'), t('sponsorEditor.imageErrorBody'));
    } finally {
      setPicking(false);
    }
  };

  const removeImage = () => setForm((f) => ({ ...f, image: null }));

  const handleSave = () => {
    if (!form.name.trim() || !isValidColor) return;
    onSave(form);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView>
            <Text style={styles.title}>{initialSponsor ? t('sponsorEditor.editTitle') : t('sponsorEditor.addTitle')}</Text>

            <Text style={styles.label}>{t('sponsorEditor.name')}</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={setField('name')} placeholder={t('sponsorEditor.namePlaceholder')} />

            <Text style={styles.label}>{t('sponsorEditor.image')}</Text>
            <View style={styles.imageRow}>
              <View style={[styles.imagePreview, { backgroundColor: isValidColor ? form.color : '#F3F4F6' }]}>
                {picking ? (
                  <ActivityIndicator color="#fff" />
                ) : form.image ? (
                  <Image source={{ uri: form.image }} style={styles.imagePreviewImg} resizeMode="contain" />
                ) : (
                  <Text style={styles.imagePreviewPlaceholder}>{t('sponsorEditor.noImage')}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} disabled={picking}>
                  <Text style={styles.uploadBtnText}>
                    {form.image ? t('sponsorEditor.changeImage') : t('sponsorEditor.uploadImage')}
                  </Text>
                </TouchableOpacity>
                {!!form.image && (
                  <TouchableOpacity onPress={removeImage} style={{ marginTop: 8 }}>
                    <Text style={styles.removeImageText}>{t('sponsorEditor.removeImage')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={styles.hint}>{t('sponsorEditor.imageHint')}</Text>

            <Text style={styles.label}>{t('sponsorEditor.color')}</Text>
            <View style={styles.colorRow}>
              <View style={[styles.swatch, isValidColor && { backgroundColor: form.color }]} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={form.color}
                onChangeText={setField('color')}
                placeholder="#4D92CF"
                autoCapitalize="none"
                maxLength={7}
              />
            </View>
            {!isValidColor && !!form.color && <Text style={styles.errorText}>{t('sponsorEditor.invalidColor')}</Text>}

            <View style={styles.actions}>
              <TouchableOpacity onPress={onCancel}>
                <Text style={styles.cancel}>{t('sponsorEditor.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.save}>{t('sponsorEditor.save')}</Text>
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
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  imageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  imagePreview: { width: 72, height: 72, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imagePreviewImg: { width: '100%', height: '100%' },
  imagePreviewPlaceholder: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600', textAlign: 'center', paddingHorizontal: 6 },
  uploadBtn: { backgroundColor: '#E4EFF8', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  uploadBtnText: { color: '#4D92CF', fontWeight: '700', fontSize: 13 },
  removeImageText: { color: '#DC2626', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  hint: { fontSize: 11, color: '#9CA3AF', marginTop: 8, lineHeight: 15 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F3F4F6' },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: 6 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingBottom: 10 },
  cancel: { color: '#6B7280', fontWeight: '600', marginRight: 20 },
  save: { color: '#4D92CF', fontWeight: '700' },
});
