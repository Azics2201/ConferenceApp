import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const CSV_HEADERS = [
  'First Name',
  'Last Name',
  'Email',
  'Organization',
  'Job Title',
  'Phone',
  'Role',
  'Selected Sessions',
  'Special Requests',
  'Additional Info',
  'Terms Accepted At',
  'Registered At',
  'Participant ID',
];

function escapeCsvValue(value) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Deliberately excludes the password field — never put credentials in an export.
export function buildParticipantsCSV(accounts, sessions) {
  const sessionTitleById = Object.fromEntries(sessions.map((s) => [s.id, s.title]));
  const rows = accounts.map((a) => [
    a.firstName,
    a.lastName,
    a.email,
    a.organization,
    a.jobTitle,
    a.phone,
    a.role,
    (a.sessionIds || []).map((id) => sessionTitleById[id] || id).join('; '),
    a.specialRequests,
    a.additionalInfo,
    a.termsAcceptedAt,
    a.registeredAt,
    a.participantId,
  ]);
  const lines = [CSV_HEADERS, ...rows].map((row) => row.map(escapeCsvValue).join(','));
  return lines.join('\n');
}

// Fully local — works with no network and no backend. On web this triggers a
// browser download; on a native device it writes a temp file and opens the
// share sheet so the organizer can save or send it (e.g. via email/AirDrop).
export async function exportParticipantsLocally(accounts, sessions, filename = 'participants.csv') {
  const csv = buildParticipantsCSV(accounts, sessions);

  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true };
  }

  try {
    const path = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export participants' });
    }
    return { success: true, path };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ---- Future server sync (not implemented) ----
// When a backend exists, exporting could instead (or additionally) POST the
// data to a server endpoint. This function is a placeholder showing the
// shape that call would take — swap the body of buildParticipantsCSV's
// caller to use this once an API is available, or call both for a local
// copy + a server sync in the same action.
//
// export async function exportParticipantsToServer(accounts, apiUrl, authToken) {
//   const response = await fetch(apiUrl, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${authToken}`,
//     },
//     body: JSON.stringify({ accounts }),
//   });
//   if (!response.ok) throw new Error(`Export failed: ${response.status}`);
//   return response.json();
// }
