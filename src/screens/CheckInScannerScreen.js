import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '../context/AppContext';

export default function CheckInScannerScreen() {
  const { hasAdminAccess, checkIns, recordCheckIn } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [locked, setLocked] = useState(false);

  const handleScan = ({ data }) => {
    if (locked) return;
    setLocked(true);
    try {
      const parsed = JSON.parse(data);
      if (!parsed.id) throw new Error('Missing id');
      setScanned(parsed);
      setScanError(null);
    } catch (e) {
      setScanned(null);
      setScanError('This QR code is not a recognized conference badge.');
    }
  };

  const confirmCheckIn = () => {
    if (!scanned) return;
    recordCheckIn({ participantId: scanned.id, name: scanned.name, org: scanned.org, role: scanned.role });
    setScanned(null);
    setLocked(false);
  };

  const scanAgain = () => {
    setScanned(null);
    setScanError(null);
    setLocked(false);
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.center}>
        <Text style={styles.restrictedText}>Administrator access required.</Text>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Camera access is needed to scan attendee badges.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant camera access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={locked ? undefined : handleScan}
        />
      </View>

      <View style={styles.resultPanel}>
        {scanned && (
          <>
            <Text style={styles.resultName}>{scanned.name}</Text>
            <Text style={styles.resultMeta}>{scanned.org}{scanned.org ? ' · ' : ''}{scanned.role}</Text>
            <Text style={styles.resultId}>{scanned.id}</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmCheckIn}>
              <Text style={styles.confirmBtnText}>Record check-in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={scanAgain}>
              <Text style={styles.scanAgain}>Scan a different badge</Text>
            </TouchableOpacity>
          </>
        )}
        {scanError && (
          <>
            <Text style={styles.errorText}>{scanError}</Text>
            <TouchableOpacity onPress={scanAgain}>
              <Text style={styles.scanAgain}>Try again</Text>
            </TouchableOpacity>
          </>
        )}
        {!scanned && !scanError && <Text style={styles.hint}>Point the camera at a participant's badge QR code.</Text>}
      </View>

      <FlatList
        style={styles.list}
        data={checkIns}
        keyExtractor={(item) => item.participantId}
        ListHeaderComponent={<Text style={styles.listHeader}>Recently checked in</Text>}
        renderItem={({ item }) => (
          <View style={styles.checkInRow}>
            <Text style={styles.checkInName}>{item.name}</Text>
            <Text style={styles.checkInTime}>{new Date(item.checkedInAt).toLocaleTimeString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  restrictedText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  permissionText: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 16 },
  permissionBtn: { backgroundColor: '#4D92CF', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20 },
  permissionBtnText: { color: '#fff', fontWeight: '700' },
  cameraWrap: { height: 300, backgroundColor: '#000' },
  resultPanel: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  resultName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  resultMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  resultId: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  confirmBtn: { backgroundColor: '#059669', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
  scanAgain: { color: '#4D92CF', fontWeight: '600', textAlign: 'center', marginTop: 12, fontSize: 13 },
  errorText: { fontSize: 13, color: '#DC2626' },
  hint: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  list: { flex: 1, paddingHorizontal: 16 },
  listHeader: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 12, marginBottom: 8 },
  checkInRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  checkInName: { fontSize: 13, color: '#1F2937' },
  checkInTime: { fontSize: 12, color: '#9CA3AF' },
});
